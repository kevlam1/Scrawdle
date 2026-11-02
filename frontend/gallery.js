/* Scrawdle gallery: what other players drew for today's parts, shown after you finish.
 *
 * Real drawings aren't connected yet, so it shows clearly labeled sample doodles. To connect it, set:
 *   window.scrawdleGallery = async ({ day, mode, prompts }) => [{ imageUrl, caption }];
 * Samples disappear as soon as that exists. `caption` is optional.
 */
(function (root) {
  "use strict";

  function hash(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  // A made-up doodle, so the layout can be tried before real drawings exist.
  function sampleDoodle(seed) {
    let state = hash(seed);
    const rand = () => {
      state = Math.imul(state ^ (state >>> 15), 2246822519) >>> 0;
      state = (state + 0x9e3779b9) >>> 0;
      return (state >>> 8) / 16777216;
    };
    const canvas = document.createElement("canvas");
    canvas.width = 450;
    canvas.height = 300;
    const c = canvas.getContext("2d");
    c.fillStyle = "#fff";
    c.fillRect(0, 0, 450, 300);
    const inks = ["#2b2540", "#4d96ff", "#ff6b6b", "#6bcb77", "#9b5de5"];
    c.strokeStyle = inks[Math.floor(rand() * inks.length)];
    c.lineWidth = 4 + rand() * 4;
    c.lineCap = c.lineJoin = "round";
    const line = (x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo((x1 + x2) / 2 + rand() * 30 - 15, (y1 + y2) / 2 + rand() * 30 - 15, x2, y2); c.stroke(); };
    const cx = 200 + rand() * 50;
    const cy = 160 + rand() * 20;
    const rx = 70 + rand() * 40;
    const ry = 40 + rand() * 25;
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); c.stroke();
    for (const dx of [-0.6, -0.2, 0.2, 0.6]) line(cx + rx * dx, cy + ry * 0.8, cx + rx * dx + rand() * 20 - 10, cy + ry + 35 + rand() * 25);
    const hx = cx + rx * 0.9;
    const hy = cy - ry * 0.9;
    const hr = 24 + rand() * 12;
    c.beginPath(); c.arc(hx, hy, hr, 0, Math.PI * 2); c.stroke();
    line(hx - hr * 0.6, hy - hr * 0.7, hx - hr * 0.9, hy - hr * 1.7);
    line(hx + hr * 0.6, hy - hr * 0.7, hx + hr * 0.9, hy - hr * 1.7);
    c.beginPath(); c.arc(hx + hr * 0.2, hy - hr * 0.15, 3.5, 0, Math.PI * 2); c.arc(hx + hr * 0.6, hy - hr * 0.15, 3.5, 0, Math.PI * 2); c.fill();
    line(cx - rx, cy, cx - rx - 30 - rand() * 40, cy - 30 - rand() * 50);
    return canvas.toDataURL("image/png");
  }

  function createGallery(board) {
    const dialog = document.createElement("dialog");
    dialog.id = "gallery";
    const closeBtn = document.createElement("button");
    closeBtn.className = "close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => dialog.close());
    const title = document.createElement("h2");
    title.textContent = "Today's drawings";
    const note = document.createElement("p");
    note.className = "gallery-note";
    note.setAttribute("role", "status");
    const grid = document.createElement("ul");
    grid.className = "gallery-grid";
    dialog.append(closeBtn, title, note, grid);
    document.body.appendChild(dialog);

    function addCard(url, caption, mine) {
      const li = document.createElement("li");
      if (mine) li.className = "mine";
      const img = document.createElement("img");
      img.src = url;
      img.alt = caption ? `Drawing: ${caption}` : "A player's drawing";
      li.append(img);
      if (caption) {
        const p = document.createElement("p");
        p.textContent = caption;
        li.append(p);
      }
      grid.append(li);
    }

    async function show(myImageUrl) {
      const round = board.round;
      grid.replaceChildren();
      addCard(myImageUrl, "Yours", true);
      dialog.showModal();
      const source = root.scrawdleGallery;
      if (typeof source !== "function") {
        note.textContent = "These are sample doodles. Real players' drawings will appear here once publishing is connected.";
        for (let i = 1; i <= 5; i++) addCard(sampleDoodle(`${round.day}-${i}`), `Sample ${i}`);
        return;
      }
      note.textContent = "Loading...";
      try {
        const items = await source({ day: round.day, mode: round.mode, prompts: round.prompts });
        note.textContent = items.length ? "" : "Nobody else has published today. You could be the first.";
        for (const item of items) addCard(item.imageUrl, item.caption);
      } catch (err) {
        note.textContent = "Couldn't load today's drawings. Check your connection and try again.";
      }
    }
    return { show };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { hash };
  else root.ScrawdleGallery = { createGallery };
})(typeof window !== "undefined" ? window : globalThis);
