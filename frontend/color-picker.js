/* Scrawdle's own color picker, so "Custom" looks and works the same in every browser instead of
 * opening the browser's built-in one (which is a pop-up in Chrome, a system window in Firefox, and
 * the Mac color panel in Safari).
 *
 * A panel with a shade square (left to right: grey to full color; top to bottom: light to dark),
 * a hue bar, a hex box, and the last few custom colors. The color applies as you drag. It closes on
 * Done, Esc, or a click outside. Mouse, finger, stylus and keyboard all work.
 *
 *   const picker = ScrawdleColorPicker.create({ anchor: button, onInput: (hex) => {} });
 *   container.append(picker.el);   // somewhere positioned near the button
 *   picker.toggle("#4d96ff");      // open on a color, or close if open
 *
 * The color math at the top is tested in tests/color-picker.test.js. drawing.js makes one picker
 * per drawing board.
 */
(function (root) {
  "use strict";

  /* ---------- Color math ---------- */
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  // "#abc", "abc", " #AABBCC " -> "#aabbcc"; anything else -> null.
  function normalizeHex(text) {
    if (typeof text !== "string") return null;
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text.trim());
    if (!m) return null;
    const h = m[1].toLowerCase();
    return "#" + (h.length === 3 ? h.replace(/./g, "$&$&") : h);
  }
  function hexToRgb(hex) {
    const h = normalizeHex(hex);
    if (!h) return null;
    return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) };
  }
  const rgbToHex = ({ r, g, b }) => "#" + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0")).join("");

  // h in degrees (0 up to 360), s and v from 0 to 1.
  function rgbToHsv({ r, g, b }) {
    const [rr, gg, bb] = [r / 255, g / 255, b / 255];
    const max = Math.max(rr, gg, bb);
    const d = max - Math.min(rr, gg, bb);
    let h = 0;
    if (d) {
      if (max === rr) h = ((gg - bb) / d) % 6;
      else if (max === gg) h = (bb - rr) / d + 2;
      else h = (rr - gg) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    return { h, s: max ? d / max : 0, v: max };
  }
  function hsvToRgb({ h, s, v }) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }
  const hexToHsv = (hex) => { const rgb = hexToRgb(hex); return rgb ? rgbToHsv(rgb) : null; };
  const hsvToHex = (hsv) => rgbToHex(hsvToRgb({ h: ((hsv.h % 360) + 360) % 360, s: clamp(hsv.s, 0, 1), v: clamp(hsv.v, 0, 1) }));

  // Newest first, no repeats, at most `max`. Anything that isn't a color is dropped.
  function addRecent(list, hex, max = 6) {
    const h = normalizeHex(hex);
    const clean = (Array.isArray(list) ? list : []).map(normalizeHex).filter(Boolean);
    return (h ? [h, ...clean.filter((c) => c !== h)] : clean).filter((c, i, a) => a.indexOf(c) === i).slice(0, max);
  }

  const pure = { normalizeHex, hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, hexToHsv, hsvToHex, addRecent };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  /* ---------- The panel ---------- */
  const RECENT_KEY = "scrawdle-recent-colors"; // localStorage, shared by every board on the page
  const readRecent = () => { try { return addRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"), null); } catch (err) { return []; } };
  const writeRecent = (list) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (err) { /* private mode */ } };

  function el(tag, className, props) {
    const n = Object.assign(document.createElement(tag), props || {});
    if (className) n.className = className;
    return n;
  }
  function slider(className, label) {
    const s = el("div", className, { tabIndex: 0 });
    s.setAttribute("role", "slider");
    s.setAttribute("aria-label", label);
    s.append(el("span", "cp-thumb"));
    return s;
  }

  function create({ anchor, onInput, onClose }) {
    const panel = el("div", "cp-panel", { hidden: true });
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Custom color");
    const square = slider("cp-square", "Shade: left for grey, right for full color, up for lighter, down for darker");
    const hue = slider("cp-hue", "Hue");
    hue.setAttribute("aria-valuemin", "0");
    hue.setAttribute("aria-valuemax", "359");
    const swatch = el("span", "cp-swatch");
    swatch.setAttribute("aria-hidden", "true");
    const hexInput = el("input", "cp-hex", { type: "text", maxLength: 7, spellcheck: false, autocomplete: "off" });
    hexInput.setAttribute("aria-label", "Hex color code");
    const hexLabel = el("label", "cp-hex-label");
    hexLabel.append(el("span", "", { textContent: "Hex" }), hexInput);
    const done = el("button", "btn cp-done", { type: "button", textContent: "Done" });
    const recentRow = el("div", "cp-recent");
    recentRow.setAttribute("role", "group");
    recentRow.setAttribute("aria-label", "Recent custom colors");
    const row = el("div", "cp-row");
    row.append(swatch, hexLabel, done);
    panel.append(square, hue, row, recentRow);

    let hsv = { h: 0, s: 0, v: 0 };
    let openedWith = null;

    function render(fromHexBox) {
      const hex = hsvToHex(hsv);
      panel.style.setProperty("--cp-hue", `hsl(${Math.round(hsv.h)} 100% 50%)`);
      panel.style.setProperty("--cp-color", hex);
      square.firstChild.style.left = `${hsv.s * 100}%`;
      square.firstChild.style.top = `${(1 - hsv.v) * 100}%`;
      hue.firstChild.style.left = `${(hsv.h / 360) * 100}%`;
      square.setAttribute("aria-valuetext", `${Math.round(hsv.s * 100)}% color, ${Math.round(hsv.v * 100)}% bright`);
      hue.setAttribute("aria-valuenow", String(Math.round(hsv.h)));
      hue.setAttribute("aria-valuetext", `Hue ${Math.round(hsv.h)} degrees`);
      if (!fromHexBox) hexInput.value = hex;
      return hex;
    }
    function apply(next, fromHexBox) {
      hsv = next;
      const hex = render(fromHexBox);
      if (onInput) onInput(hex);
    }
    function renderRecent() {
      recentRow.replaceChildren();
      for (const c of readRecent()) {
        const b = el("button", "cp-recent-color", { type: "button", title: c });
        b.style.setProperty("--cp-swatch", c);
        b.setAttribute("aria-label", `Recent color ${c}`);
        b.addEventListener("click", () => {
          const next = hexToHsv(c);
          apply(next.s ? next : { ...next, h: hsv.h });
        });
        recentRow.append(b);
      }
      recentRow.hidden = !recentRow.childElementCount;
    }

    // Dragging on the square or the bar. Pointer capture keeps the drag going outside the panel.
    function dragOn(target, update) {
      const at = (e) => {
        const r = target.getBoundingClientRect();
        update(clamp((e.clientX - r.left) / r.width, 0, 1), clamp((e.clientY - r.top) / r.height, 0, 1));
      };
      target.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        target.focus();
        try { target.setPointerCapture(e.pointerId); } catch (err) { /* not a real pointer */ }
        at(e);
        const move = (ev) => at(ev);
        const up = () => { target.removeEventListener("pointermove", move); target.removeEventListener("pointerup", up); target.removeEventListener("pointercancel", up); };
        target.addEventListener("pointermove", move);
        target.addEventListener("pointerup", up);
        target.addEventListener("pointercancel", up);
      });
    }
    dragOn(square, (x, y) => apply({ h: hsv.h, s: x, v: 1 - y }));
    dragOn(hue, (x) => apply({ ...hsv, h: Math.min(x * 360, 359.9) }));

    // Arrow keys move by a little, or by more with Shift.
    square.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 0.1 : 0.02;
      const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (!moves[e.key]) return;
      e.preventDefault();
      apply({ h: hsv.h, s: clamp(hsv.s + moves[e.key][0], 0, 1), v: clamp(hsv.v + moves[e.key][1], 0, 1) });
    });
    hue.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 15 : 2;
      const next = { ArrowLeft: hsv.h - step, ArrowDown: hsv.h - step, ArrowRight: hsv.h + step, ArrowUp: hsv.h + step, Home: 0, End: 359 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      apply({ ...hsv, h: clamp(next, 0, 359.9) });
    });

    hexInput.addEventListener("input", () => {
      const hex = normalizeHex(hexInput.value);
      hexInput.setAttribute("aria-invalid", String(!hex && hexInput.value.trim() !== ""));
      if (!hex) return;
      const next = hexToHsv(hex);
      apply(next.s ? next : { ...next, h: hsv.h }, true);
    });
    hexInput.addEventListener("blur", () => { hexInput.value = hsvToHex(hsv); hexInput.removeAttribute("aria-invalid"); });
    hexInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); close(); } });
    done.addEventListener("click", () => close());
    panel.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); // otherwise Esc also closes the dialog the board is in
      e.stopPropagation();
      close();
    });

    // A click anywhere outside the panel (and its button) closes it.
    const outside = (e) => { if (!panel.contains(e.target) && !anchor.contains(e.target)) close(false); };

    function open(hex) {
      const next = hexToHsv(hex) || { h: 0, s: 0, v: 0 };
      hsv = next.s ? next : { ...next, h: hsv.h };
      openedWith = hsvToHex(hsv);
      render();
      renderRecent();
      panel.hidden = false;
      anchor.setAttribute("aria-expanded", "true");
      document.addEventListener("pointerdown", outside, true);
      fit();
      square.focus();
    }
    function close(returnFocus = true) {
      if (panel.hidden) return;
      panel.hidden = true;
      anchor.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      const hex = hsvToHex(hsv);
      if (hex !== openedWith) writeRecent(addRecent(readRecent(), hex));
      if (returnFocus) anchor.focus();
      if (onClose) onClose(hex);
    }
    // Keeps the panel on screen: it opens above its button, and slides sideways if it would
    // poke out of the window. On a phone the stylesheet pins it across the bottom instead.
    function fit() {
      panel.style.setProperty("--cp-shift", "0px");
      const r = panel.getBoundingClientRect();
      const margin = 8;
      let shift = 0;
      if (r.left < margin) shift = margin - r.left;
      else if (r.right > window.innerWidth - margin) shift = window.innerWidth - margin - r.right;
      panel.style.setProperty("--cp-shift", `${Math.round(shift)}px`);
    }

    anchor.setAttribute("aria-haspopup", "dialog");
    anchor.setAttribute("aria-expanded", "false");
    return {
      el: panel,
      open,
      close,
      toggle: (hex) => (panel.hidden ? open(hex) : close()),
      get isOpen() { return !panel.hidden; },
    };
  }

  root.ScrawdleColorPicker = { ...pure, create };
})(typeof window !== "undefined" ? window : globalThis);
