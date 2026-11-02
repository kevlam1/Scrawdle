/* Scrawdle drawing board: tools, undo/redo, auto-save in the browser, and the finish screen.
 *
 * The canvas is stored at twice its display size so lines stay sharp, and every drawing is the
 * same size no matter whose screen it was made on.
 *
 * Publishing is not connected yet. To connect it, set:
 *   window.scrawdlePublish = async ({ blob, mode, prompts, day }) => { ... };
 * The Publish button turns on when that exists. `blob` is the plain PNG of the drawing, and
 * `prompts` is [{ label, value, optional }].
 */
(function (root) {
  "use strict";

  const SCALE = 2;
  const HISTORY_BYTES = 96 * 1024 * 1024;
  const COLORS = ["#2b2540", "#ffffff", "#ff6b6b", "#ff9f43", "#ffd93d", "#6bcb77", "#4d96ff", "#9b5de5", "#f78fb3", "#8d6e63"];
  const TOOLS = [
    { id: "pen", label: "Pen", size: 3 },
    { id: "pencil", label: "Pencil", size: 4 },
    { id: "brush", label: "Brush", size: 14 },
    { id: "line", label: "Line", size: 3 },
    { id: "eraser", label: "Eraser", size: 20 },
    { id: "bucket", label: "Bucket", size: null },
  ];

  const BRUSHES = [
    { id: "round", label: "Round" },
    { id: "marker", label: "Marker" },
    { id: "calligraphy", label: "Calligraphy" },
    { id: "crayon", label: "Crayon" },
    { id: "watercolor", label: "Watercolor" },
    { id: "spray", label: "Spray" },
    { id: "bristle", label: "Dry bristle" },
  ];
  // These build the whole stroke on a separate layer first, so a stroke doesn't darken
  // where it crosses itself. Later strokes still layer over earlier ones.
  const LAYERED = { marker: { alpha: 0.72, blend: "multiply" }, watercolor: { alpha: 0.5, blur: 0.14 } };

  /* ---------- Paint bucket ---------- */
  // Scanline fill on RGBA pixels. Colors within `tolerance` of the clicked one count as the same
  // area, then the fill grows one pixel so it tucks under the soft edges of lines.
  // Returns the changed rectangle, or null if nothing changed.
  function floodFill(pixels, width, height, startX, startY, rgba, tolerance) {
    const x0 = Math.floor(startX);
    const y0 = Math.floor(startY);
    if (x0 < 0 || y0 < 0 || x0 >= width || y0 >= height) return null;
    const at = (x0 + y0 * width) * 4;
    const tr = pixels[at], tg = pixels[at + 1], tb = pixels[at + 2], ta = pixels[at + 3];
    if (tr === rgba[0] && tg === rgba[1] && tb === rgba[2] && ta === rgba[3]) return null;

    const matches = (i) =>
      Math.abs(pixels[i] - tr) <= tolerance && Math.abs(pixels[i + 1] - tg) <= tolerance &&
      Math.abs(pixels[i + 2] - tb) <= tolerance && Math.abs(pixels[i + 3] - ta) <= tolerance;

    const seen = new Uint8Array(width * height);
    const stack = [x0 + y0 * width];
    let minX = x0, maxX = x0, minY = y0, maxY = y0;
    while (stack.length) {
      const p = stack.pop();
      if (seen[p]) continue;
      const y = Math.floor(p / width);
      let left = p;
      const rowStart = y * width;
      while (left > rowStart && !seen[left - 1] && matches((left - 1) * 4)) left--;
      let right = p;
      const rowEnd = rowStart + width - 1;
      while (right < rowEnd && !seen[right + 1] && matches((right + 1) * 4)) right++;
      for (let i = left; i <= right; i++) seen[i] = 1;
      minX = Math.min(minX, left - rowStart);
      maxX = Math.max(maxX, right - rowStart);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const nextRow of [y - 1, y + 1]) {
        if (nextRow < 0 || nextRow >= height) continue;
        const offset = (nextRow - y) * width;
        let inRun = false;
        for (let i = left; i <= right; i++) {
          const n = i + offset;
          const open = !seen[n] && matches(n * 4);
          if (open && !inRun) stack.push(n);
          inRun = open;
        }
      }
    }

    const paint = (p) => {
      const i = p * 4;
      pixels[i] = rgba[0]; pixels[i + 1] = rgba[1]; pixels[i + 2] = rgba[2]; pixels[i + 3] = rgba[3];
    };
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const p = x + y * width;
        if (!seen[p]) continue;
        paint(p);
        if (x > 0 && !seen[p - 1]) paint(p - 1);
        if (x < width - 1 && !seen[p + 1]) paint(p + 1);
        if (y > 0 && !seen[p - width]) paint(p - width);
        if (y < height - 1 && !seen[p + width]) paint(p + width);
      }
    }
    const x = Math.max(0, minX - 1);
    const y = Math.max(0, minY - 1);
    return { x, y, w: Math.min(width - 1, maxX + 1) - x + 1, h: Math.min(height - 1, maxY + 1) - y + 1 };
  }

  /* ---------- Undo and redo ---------- */
  // Each entry keeps only the rectangle that changed. The oldest entries are dropped once the
  // total goes over the byte budget, but the newest always stays.
  class History {
    constructor(maxBytes) {
      this.maxBytes = maxBytes;
      this.entries = [];
      this.cursor = 0;
    }
    static size(e) { return e.before.data.length + e.after.data.length; }
    push(entry) {
      this.entries.length = this.cursor;
      this.entries.push(entry);
      let total = this.entries.reduce((sum, e) => sum + History.size(e), 0);
      while (total > this.maxBytes && this.entries.length > 1) total -= History.size(this.entries.shift());
      this.cursor = this.entries.length;
    }
    get canUndo() { return this.cursor > 0; }
    get canRedo() { return this.cursor < this.entries.length; }
    undo() { return this.canUndo ? this.entries[--this.cursor] : null; }
    redo() { return this.canRedo ? this.entries[this.cursor++] : null; }
    clear() { this.entries = []; this.cursor = 0; }
  }

  function dayKey(date) {
    const d = date || new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /* ---------- Saved draft (IndexedDB, in this browser only) ---------- */
  const draftStore = {
    open() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open("scrawdle", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("drafts");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    },
    async run(mode, action) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction("drafts", mode);
        const req = action(tx.objectStore("drafts"));
        tx.oncomplete = () => { db.close(); resolve(req.result); };
        tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
      });
    },
    get() { return this.run("readonly", (s) => s.get("current")); },
    put(draft) { return this.run("readwrite", (s) => s.put(draft, "current")); },
    remove() { return this.run("readwrite", (s) => s.delete("current")); },
  };

  /* ---------- The board ---------- */
  function createBoard({ canvas, toolbar }) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const W = canvas.width;
    const H = canvas.height;
    const history = new History(HISTORY_BYTES);
    const sizes = Object.fromEntries(TOOLS.map((t) => [t.id, t.size]));
    let tool = "pen";
    let brushKind = "round";
    let filterWorks = "filter" in ctx;
    let color = COLORS[0];
    let round = null; // { mode, prompts, day }
    let hasDrawing = false;
    let stroke = null;
    let saveTimer = null;
    let onDone = () => {};

    const rgba = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
    const paintColor = () => (tool === "eraser" ? "#ffffff" : color);
    const blank = () => { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); };
    blank();

    /* --- toolbar --- */
    const el = (tag, props, ...kids) => {
      const n = Object.assign(document.createElement(tag), props);
      n.append(...kids);
      return n;
    };
    const status = el("span", { className: "save-status", role: "status" });
    const toolButtons = {};
    for (const t of TOOLS) {
      toolButtons[t.id] = el("button", { type: "button", className: "tool", textContent: t.label, onclick: () => setTool(t.id) });
    }
    const swatches = COLORS.map((c) => {
      const b = el("button", { type: "button", className: "swatch", title: c, onclick: () => setColor(c) });
      b.style.background = c;
      b.dataset.color = c;
      b.setAttribute("aria-label", `Color ${c}`);
      return b;
    });
    const picker = el("input", { type: "color", className: "picker", value: color, title: "Pick any color", oninput: (e) => setColor(e.target.value) });
    picker.setAttribute("aria-label", "Pick any color");
    const sizeInput = el("input", { type: "range", min: 1, max: 60, value: 3, id: "tool-size", oninput: (e) => { if (sizes[tool] !== null) sizes[tool] = Number(e.target.value); } });
    const sizeLabel = el("label", { className: "size", htmlFor: "tool-size" }, "Size ", sizeInput);
    const brushSelect = el("select", { id: "brush-kind", className: "tool", onchange: (e) => { brushKind = e.target.value; } },
      ...BRUSHES.map((b) => el("option", { value: b.id, textContent: b.label })));
    const brushLabel = el("label", { className: "size", htmlFor: "brush-kind" }, "Brush type ", brushSelect);
    const undoBtn = el("button", { type: "button", className: "tool", textContent: "Undo", onclick: undo });
    const redoBtn = el("button", { type: "button", className: "tool", textContent: "Redo", onclick: redo });
    const clearBtn = el("button", { type: "button", className: "tool", textContent: "Clear", onclick: clearAll });
    const doneBtn = el("button", { type: "button", className: "tool done", textContent: "Done", onclick: () => onDone() });
    toolbar.append(
      el("div", { className: "tool-group" }, ...Object.values(toolButtons)),
      el("div", { className: "tool-group" }, ...swatches, picker),
      el("div", { className: "tool-group" }, sizeLabel, brushLabel),
      el("div", { className: "tool-group" }, undoBtn, redoBtn, clearBtn),
      el("div", { className: "tool-group" }, status, doneBtn),
    );

    function refreshToolbar() {
      for (const [id, b] of Object.entries(toolButtons)) b.setAttribute("aria-pressed", String(id === tool));
      for (const b of swatches) b.setAttribute("aria-pressed", String(b.dataset.color === color));
      sizeInput.disabled = sizes[tool] === null;
      brushLabel.hidden = tool !== "brush";
      if (sizes[tool] !== null) sizeInput.value = sizes[tool];
      undoBtn.disabled = !history.canUndo;
      redoBtn.disabled = !history.canRedo;
      canvas.dataset.tool = tool;
    }
    function setTool(id) { tool = id; refreshToolbar(); }
    function setColor(c) {
      color = c;
      picker.value = c;
      if (tool === "eraser") tool = "pen";
      refreshToolbar();
    }

    /* --- history --- */
    function record(rect, before) {
      if (!rect || rect.w <= 0 || rect.h <= 0) return;
      history.push({ x: rect.x, y: rect.y, before, after: ctx.getImageData(rect.x, rect.y, rect.w, rect.h) });
      changed();
    }
    function crop(source, rect) {
      const out = ctx.createImageData(rect.w, rect.h);
      for (let row = 0; row < rect.h; row++) {
        const start = ((rect.y + row) * source.width + rect.x) * 4;
        out.data.set(source.data.subarray(start, start + rect.w * 4), row * rect.w * 4);
      }
      return out;
    }
    function undo() {
      const e = history.undo();
      if (e) { ctx.putImageData(e.before, e.x, e.y); changed(); }
    }
    function redo() {
      const e = history.redo();
      if (e) { ctx.putImageData(e.after, e.x, e.y); changed(); }
    }
    function clearAll() {
      const before = ctx.getImageData(0, 0, W, H);
      blank();
      record({ x: 0, y: 0, w: W, h: H }, before);
    }
    function changed() {
      hasDrawing = true;
      refreshToolbar();
      scheduleSave();
    }

    /* --- strokes --- */
    function point(e) {
      const r = canvas.getBoundingClientRect();
      const bx = canvas.clientLeft;
      const by = canvas.clientTop;
      return {
        x: (e.clientX - r.left - bx) * (W / canvas.clientWidth),
        y: (e.clientY - r.top - by) * (H / canvas.clientHeight),
        pressure: e.pointerType === "pen" ? e.pressure : null,
        t: e.timeStamp,
      };
    }
    function grow(x, y, pad) {
      const b = stroke.box;
      b.minX = Math.min(b.minX, x - pad); b.maxX = Math.max(b.maxX, x + pad);
      b.minY = Math.min(b.minY, y - pad); b.maxY = Math.max(b.maxY, y + pad);
    }
    function boxRect(b) {
      const x = Math.max(0, Math.floor(b.minX));
      const y = Math.max(0, Math.floor(b.minY));
      return { x, y, w: Math.min(W, Math.ceil(b.maxX)) - x, h: Math.min(H, Math.ceil(b.maxY)) - y };
    }

    // Repeatable noise tied to a spot on the paper.
    function grain(x, y) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    }
    function showLayer() {
      const s = stroke;
      const look = LAYERED[s.kind];
      ctx.putImageData(s.base, 0, 0);
      ctx.save();
      ctx.globalAlpha = look.alpha;
      // White can't show through "multiply", so it paints normally.
      if (look.blend && paintColorOf(s) !== "#ffffff") ctx.globalCompositeOperation = look.blend;
      if (look.blur && filterWorks) ctx.filter = `blur(${(s.width * look.blur).toFixed(1)}px)`;
      ctx.drawImage(s.layer.canvas, 0, 0);
      ctx.restore();
    }
    const paintColorOf = (s) => s.color;

    function dab(x, y, radius) {
      ctx.beginPath();
      ctx.arc(x, y, Math.max(radius, 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    const draw = {
      smooth(p) { // pen and eraser: curves through the midpoints of the points
        const s = stroke;
        const mid = { x: (s.last.x + p.x) / 2, y: (s.last.y + p.y) / 2 };
        ctx.lineWidth = s.width;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(s.mid.x, s.mid.y);
        ctx.quadraticCurveTo(s.last.x, s.last.y, mid.x, mid.y);
        ctx.stroke();
        s.mid = mid;
        grow(p.x, p.y, s.width);
        grow(s.last.x, s.last.y, s.width);
      },
      pencil(p) { // scattered graphite grains along the path
        const s = stroke;
        const dist = Math.hypot(p.x - s.last.x, p.y - s.last.y);
        const steps = Math.max(1, Math.ceil(dist / 1.5));
        const spread = s.width / 2;
        for (let i = 1; i <= steps; i++) {
          const x = s.last.x + ((p.x - s.last.x) * i) / steps;
          const y = s.last.y + ((p.y - s.last.y) * i) / steps;
          const grains = Math.ceil(spread * 1.1) + 1;
          for (let g = 0; g < grains; g++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * spread;
            ctx.globalAlpha = 0.2 + Math.random() * 0.45;
            ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.6, 1.6);
          }
        }
        ctx.globalAlpha = 1;
        grow(p.x, p.y, spread + 3);
        grow(s.last.x, s.last.y, spread + 3);
      },
      brush(p) {
        const kinds = { marker: draw.layered, watercolor: draw.layered, calligraphy: draw.calligraphy, crayon: draw.crayon, spray: draw.spray, bristle: draw.bristle };
        (kinds[stroke.kind] || draw.round)(p);
      },
      layered(p) { // marker and watercolor: draw on the layer, then show it over the original
        const s = stroke;
        const mid = { x: (s.last.x + p.x) / 2, y: (s.last.y + p.y) / 2 };
        const l = s.layer;
        l.lineWidth = s.width;
        l.beginPath();
        l.moveTo(s.mid.x, s.mid.y);
        l.quadraticCurveTo(s.last.x, s.last.y, mid.x, mid.y);
        l.stroke();
        s.mid = mid;
        grow(p.x, p.y, s.width * 1.5);
        grow(s.last.x, s.last.y, s.width * 1.5);
        showLayer();
      },
      calligraphy(p) { // a slanted nib: thick one way, thin the other
        const s = stroke;
        const nx = Math.cos(-Math.PI / 4) * s.width * 0.6;
        const ny = Math.sin(-Math.PI / 4) * s.width * 0.6;
        ctx.beginPath();
        ctx.moveTo(s.last.x - nx, s.last.y - ny);
        ctx.lineTo(s.last.x + nx, s.last.y + ny);
        ctx.lineTo(p.x + nx, p.y + ny);
        ctx.lineTo(p.x - nx, p.y - ny);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
        grow(p.x, p.y, s.width);
        grow(s.last.x, s.last.y, s.width);
      },
      crayon(p) { // wax catches a fixed paper grain, so gaps stay put when you go over them
        const s = stroke;
        const r = s.width / 2;
        const dist = Math.hypot(p.x - s.last.x, p.y - s.last.y);
        const steps = Math.max(1, Math.ceil(dist / Math.max(1.5, r / 3)));
        for (let i = 1; i <= steps; i++) {
          const cx = s.last.x + ((p.x - s.last.x) * i) / steps;
          const cy = s.last.y + ((p.y - s.last.y) * i) / steps;
          for (let dy = -r; dy <= r; dy += 2) {
            for (let dx = -r; dx <= r; dx += 2) {
              if (dx * dx + dy * dy > r * r) continue;
              const gx = Math.round((cx + dx) / 2);
              const gy = Math.round((cy + dy) / 2);
              if (grain(gx, gy) > 0.42) ctx.fillRect(gx * 2, gy * 2, 2, 2);
            }
          }
        }
        grow(p.x, p.y, r + 3);
        grow(s.last.x, s.last.y, r + 3);
      },
      spray(p) { // a mist of dots, denser in the middle
        const s = stroke;
        const r = s.width;
        const dist = Math.hypot(p.x - s.last.x, p.y - s.last.y);
        const dots = Math.ceil(10 + r * 0.8 + dist * 2);
        for (let i = 0; i < dots; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = r * Math.pow(Math.random(), 1.6);
          const t = Math.random();
          ctx.globalAlpha = 0.35 + Math.random() * 0.5;
          ctx.fillRect(s.last.x + (p.x - s.last.x) * t + Math.cos(a) * d, s.last.y + (p.y - s.last.y) * t + Math.sin(a) * d, 2, 2);
        }
        ctx.globalAlpha = 1;
        grow(p.x, p.y, r + 3);
        grow(s.last.x, s.last.y, r + 3);
      },
      bristle(p) { // separate hairs that run dry at different rates
        const s = stroke;
        const dx = p.x - s.last.x;
        const dy = p.y - s.last.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 0.5) return;
        const nx = -dy / dist;
        const ny = dx / dist;
        const prev = s.normal || { x: nx, y: ny };
        s.travel += dist;
        ctx.lineCap = "round";
        for (const hair of s.hairs) {
          const ink = Math.max(0, 1 - s.travel / hair.reach);
          if (ink <= 0) continue;
          ctx.globalAlpha = hair.alpha * (0.35 + 0.65 * ink);
          ctx.lineWidth = hair.width;
          ctx.beginPath();
          ctx.moveTo(s.last.x + prev.x * hair.at, s.last.y + prev.y * hair.at);
          ctx.lineTo(p.x + nx * hair.at, p.y + ny * hair.at);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        s.normal = { x: nx, y: ny };
        grow(p.x, p.y, s.width);
        grow(s.last.x, s.last.y, s.width);
      },
      round(p) { // width follows stylus pressure, or speed for a mouse or finger
        const s = stroke;
        const dist = Math.hypot(p.x - s.last.x, p.y - s.last.y);
        const dt = Math.max(p.t - s.last.t, 4);
        // Average the speed over recent points so one uneven event can't pinch the line.
        s.speed = s.speed * 0.85 + (dist / dt) * 0.15;
        const factor = p.pressure !== null ? 0.25 + p.pressure * 1.1 : Math.max(0.55, 1 - s.speed * 0.08);
        const target = s.radius + ((s.width / 2) * factor - s.radius) * 0.25;
        const steps = Math.max(1, Math.ceil(dist / Math.max(1, s.radius / 3)));
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          dab(s.last.x + (p.x - s.last.x) * t, s.last.y + (p.y - s.last.y) * t, s.radius + (target - s.radius) * t);
        }
        s.radius = target;
        grow(p.x, p.y, s.width);
        grow(s.last.x, s.last.y, s.width);
      },
    };

    function begin(e) {
      if (!e.isPrimary || e.button !== 0 || stroke) return;
      e.preventDefault();
      const p = point(e);
      if (tool === "bucket") return fill(p);
      canvas.setPointerCapture(e.pointerId);
      const width = sizes[tool] * SCALE;
      ctx.fillStyle = ctx.strokeStyle = paintColor();
      const kind = tool === "brush" ? brushKind : null;
      stroke = { id: e.pointerId, tool, kind, color: paintColor(), width, base: ctx.getImageData(0, 0, W, H), start: p, last: p, mid: p, radius: tool === "brush" ? width * 0.4 : width / 2, speed: 0, travel: 0, moved: false, box: { minX: p.x, maxX: p.x, minY: p.y, maxY: p.y } };
      grow(p.x, p.y, width * 1.5 + 3);
      if (LAYERED[kind]) {
        const layer = document.createElement("canvas");
        layer.width = W;
        layer.height = H;
        const l = layer.getContext("2d");
        l.strokeStyle = l.fillStyle = stroke.color;
        l.lineCap = l.lineJoin = "round";
        l.beginPath();
        l.arc(p.x, p.y, width / 2, 0, Math.PI * 2);
        l.fill();
        stroke.layer = l;
        showLayer();
      } else if (kind === "bristle") {
        const count = Math.max(6, Math.round(width / 2));
        stroke.hairs = Array.from({ length: count }, () => ({
          at: (Math.random() - 0.5) * width,
          width: 0.8 + Math.random() * 2.2,
          alpha: 0.45 + Math.random() * 0.55,
          reach: 300 + Math.random() * 1500,
        }));
        draw.bristle({ ...p, x: p.x + 0.8 });
      } else if (kind === "calligraphy") draw.calligraphy(p);
      else if (kind === "crayon") draw.crayon(p);
      else if (kind === "spray") {
        draw.spray(p);
        stroke.timer = setInterval(() => { if (stroke && stroke.kind === "spray") draw.spray(stroke.last); }, 50);
      } else if (tool === "brush") dab(p.x, p.y, stroke.radius);
      else if (tool === "pencil") draw.pencil(p);
      else if (tool !== "line") dab(p.x, p.y, width / 2);
    }
    function extend(p) {
      const s = stroke;
      if (s.tool === "line") {
        ctx.putImageData(s.base, 0, 0);
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.start.x, s.start.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        grow(p.x, p.y, s.width);
      } else if (s.tool === "pencil") draw.pencil(p);
      else if (s.tool === "brush") draw.brush(p);
      else draw.smooth(p);
      s.last = p;
      s.moved = true;
    }
    function move(e) {
      if (!stroke || e.pointerId !== stroke.id) return;
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const ev of events.length ? events : [e]) extend(point(ev));
    }
    function end(e) {
      if (!stroke || e.pointerId !== stroke.id) return;
      const s = stroke;
      if (s.moved && (s.tool === "pen" || s.tool === "eraser")) {
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.mid.x, s.mid.y);
        ctx.lineTo(s.last.x, s.last.y);
        ctx.stroke();
      }
      if (s.tool === "line" && !s.moved) dab(s.start.x, s.start.y, s.width / 2);
      if (s.layer) {
        s.layer.lineWidth = s.width;
        s.layer.beginPath();
        s.layer.moveTo(s.mid.x, s.mid.y);
        s.layer.lineTo(s.last.x, s.last.y);
        s.layer.stroke();
        showLayer();
      }
      clearInterval(s.timer);
      stroke = null;
      const rect = boxRect(s.box);
      record(rect, crop(s.base, rect));
    }
    function fill(p) {
      const image = ctx.getImageData(0, 0, W, H);
      const before = ctx.getImageData(0, 0, W, H);
      const rect = floodFill(image.data, W, H, p.x, p.y, rgba(color), 40);
      if (!rect) return;
      ctx.putImageData(image, 0, 0);
      record(rect, crop(before, rect));
    }
    canvas.addEventListener("pointerdown", begin);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    document.addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      if (canvas.offsetParent === null || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    });

    /* --- saving --- */
    function setStatus(text) { status.textContent = text; }
    function scheduleSave() {
      clearTimeout(saveTimer);
      setStatus("Saving...");
      saveTimer = setTimeout(save, 400);
    }
    function canvasBlob() {
      return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    }
    async function save() {
      if (!round) return;
      try {
        const blob = await canvasBlob();
        await draftStore.put({ ...round, blob, hasDrawing, savedAt: Date.now() });
        setStatus("Saved in this browser");
      } catch (err) {
        setStatus("Couldn't save. Download your drawing to keep it.");
      }
    }

    /* --- rounds --- */
    function start(mode, prompts, daily = true) {
      clearTimeout(saveTimer);
      round = { mode, prompts, daily, day: dayKey() };
      blank();
      history.clear();
      hasDrawing = false;
      refreshToolbar();
      return save();
    }
    // Brings back today's unfinished drawing. A draft from an earlier day is thrown away.
    async function restore() {
      let draft;
      try { draft = await draftStore.get(); } catch (err) { return null; }
      if (!draft) return null;
      if (draft.day !== dayKey()) {
        await draftStore.remove().catch(() => {});
        return null;
      }
      const bitmap = await createImageBitmap(draft.blob);
      ctx.drawImage(bitmap, 0, 0, W, H);
      bitmap.close();
      round = { mode: draft.mode, prompts: draft.prompts, daily: draft.daily !== false, day: draft.day };
      history.clear();
      hasDrawing = Boolean(draft.hasDrawing);
      refreshToolbar();
      setStatus("Saved in this browser");
      return round;
    }
    function discard() {
      clearTimeout(saveTimer);
      round = null;
      blank();
      history.clear();
      hasDrawing = false;
      setStatus("");
      refreshToolbar();
      return draftStore.remove().catch(() => {});
    }

    /* --- finished image: the drawing with its prompts and date underneath --- */
    function exportCanvas() {
      const m = 40;
      const lineHeight = 44;
      const measure = document.createElement("canvas").getContext("2d");
      const font = '30px "Comic Sans MS", "Chalkboard SE", "Trebuchet MS", sans-serif';
      measure.font = font;
      const lines = [""];
      for (const pr of round.prompts) {
        const piece = `${pr.label}: ${pr.value}`;
        const next = lines[lines.length - 1] ? `${lines[lines.length - 1]}   ${piece}` : piece;
        if (measure.measureText(next).width > W - m * 2 && lines[lines.length - 1]) lines.push(piece);
        else lines[lines.length - 1] = next;
      }
      const out = document.createElement("canvas");
      out.width = W + m * 2;
      out.height = H + m * 2 + (lines.length + 1) * lineHeight + 20;
      const c = out.getContext("2d");
      c.fillStyle = "#fffaf0";
      c.fillRect(0, 0, out.width, out.height);
      c.drawImage(canvas, m, m);
      c.strokeStyle = "#2b2540";
      c.lineWidth = 6;
      c.strokeRect(m, m, W, H);
      c.fillStyle = "#2b2540";
      c.font = font;
      c.textBaseline = "top";
      lines.forEach((line, i) => c.fillText(line, m, H + m + 24 + i * lineHeight));
      c.font = `bold ${font}`;
      c.fillText(`Scrawdle, ${round.day}`, m, H + m + 24 + lines.length * lineHeight);
      return out;
    }

    refreshToolbar();
    return {
      start, restore, discard, undo, redo, exportCanvas, canvasBlob,
      save,
      get round() { return round; },
      get isEmpty() { return !hasDrawing; },
      set onDone(fn) { onDone = fn; },
    };
  }

  /* ---------- Finish screen ---------- */
  function createFinishScreen(board, gallery) {
    const dialog = document.createElement("dialog");
    dialog.id = "finish";
    dialog.innerHTML = `
      <button class="close" type="button" aria-label="Keep drawing">&times;</button>
      <h2>Nice work!</h2>
      <img alt="Your finished drawing with its prompts and date">
      <div class="finish-actions">
        <button type="button" class="tool done" data-act="download">Download</button>
        <button type="button" class="tool" data-act="publish">Publish</button>
        <button type="button" class="tool" data-act="gallery">See today's drawings</button>
        <button type="button" class="tool" data-act="keep">Keep drawing</button>
      </div>
      <p class="finish-note" role="status"></p>`;
    document.body.appendChild(dialog);
    const img = dialog.querySelector("img");
    const note = dialog.querySelector(".finish-note");
    const publishBtn = dialog.querySelector('[data-act="publish"]');
    const galleryBtn = dialog.querySelector('[data-act="gallery"]');
    galleryBtn.addEventListener("click", () => {
      const shown = url;
      dialog.close();
      gallery.show(shown);
    });
    let url = null;

    const release = () => { if (url) URL.revokeObjectURL(url); url = null; };
    const close = () => { dialog.close(); release(); };
    dialog.querySelector(".close").addEventListener("click", close);
    dialog.querySelector('[data-act="keep"]').addEventListener("click", close);

    dialog.querySelector('[data-act="download"]').addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `scrawdle-${board.round.day}.png`;
      a.click();
      note.textContent = "Downloaded.";
    });
    publishBtn.addEventListener("click", async () => {
      publishBtn.disabled = true;
      note.textContent = "Publishing...";
      try {
        const blob = await board.canvasBlob();
        await window.scrawdlePublish({ blob, ...board.round });
        note.textContent = "Published.";
      } catch (err) {
        note.textContent = "Couldn't publish. Your drawing is still saved here, so try again.";
        publishBtn.disabled = false;
      }
    });

    board.onDone = () => {
      board.exportCanvas().toBlob((blob) => {
        release();
        url = URL.createObjectURL(blob);
        img.src = url;
        const daily = board.round.daily;
        const ready = daily && typeof window.scrawdlePublish === "function";
        publishBtn.disabled = !ready;
        galleryBtn.hidden = !daily;
        note.textContent = !daily ? "Free play drawings aren't published, but you can download yours."
          : ready ? "" : "Publishing isn't available yet, but you can download your drawing.";
        dialog.showModal();
      }, "image/png");
    };
  }

  const api = { floodFill, History, dayKey };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ScrawdleDrawing = { ...api, createBoard, createFinishScreen, HISTORY_BYTES };
})(typeof window !== "undefined" ? window : globalThis);
