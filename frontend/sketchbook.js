/* My drawings: the player's own drawings, kept in this browser after their day ends.
 *
 * drawing.js does the keeping (see "My drawings" there): a drawing goes in when its day is over, and a
 * Free play drawing, or today's in the other mode, goes in when a new round replaces it. A drawing thrown
 * away with Start over isn't kept, because that button already says it will be lost. Nothing here is
 * sent anywhere. Clearing the browser's site data deletes it.
 */
(function (root) {
  "use strict";
  const MODE_NAMES = { daily: "Daily Scrawl", basic: "Basic", detailed: "Detailed", scrawl: "Daily Free Play" };
  const modeName = (d) => (d.timed && d.timed.seconds ? `${d.timed.seconds}-second Time Challenge` : d.mode === "scrawl" ? MODE_NAMES.scrawl : d.daily === false ? "Free Play" : MODE_NAMES[d.mode] || "Drawing");
  const dateOf = (day) => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const partsOf = (d) => (d.mode === "scrawl" ? "" : (d.prompts || []).map((p) => p.value).join(", "));

  function create(board, { onContinue } = {}) {
    const dialog = document.createElement("dialog");
    dialog.id = "sketchbook";
    dialog.setAttribute("aria-labelledby", "sketchbook-title");
    dialog.innerHTML = `
      <header class="app-header"><span class="wordmark">Scrawdle</span><button class="quiet" type="button" data-act="close">Back</button></header>
      <div class="gallery-heading"><h2 id="sketchbook-title">My drawings</h2></div>
      <p class="gallery-note" role="status"></p>
      <ul class="gallery-grid"></ul>`;
    document.body.appendChild(dialog);
    const note = dialog.querySelector(".gallery-note");
    const grid = dialog.querySelector(".gallery-grid");
    const KEPT_NOTE = "Kept in this browser only, so clearing your browser data deletes them.";
    const EMPTY_NOTE = "Nothing here yet. A drawing is kept here when its day ends, and so is a Free Play drawing when you start a new set. Kept in this browser only.";
    let urls = [];
    let request = 0;
    const release = () => { urls.forEach((u) => URL.revokeObjectURL(u)); urls = []; };
    dialog.querySelector('[data-act="close"]').addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { request++; release(); });

    async function download(d) {
      const bitmap = await createImageBitmap(d.blob);
      const out = root.ScrawdleDrawing.letterDrawing(bitmap, d);
      bitmap.close();
      const blob = await new Promise((resolve) => out.toBlob(resolve, "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scrawdle-${d.day}-${modeName(d).toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function card(d, { open }) {
      const url = URL.createObjectURL(d.blob);
      urls.push(url);
      const li = document.createElement("li");
      if (open) li.className = "mine";
      const img = document.createElement("img");
      img.src = url;
      const parts = partsOf(d);
      img.alt = `Your ${modeName(d)} drawing${parts ? `: ${parts}` : ""}`;
      const caption = document.createElement("p");
      const title = document.createElement("b");
      // A Time Challenge on its slot is over (it ends when you leave it), so it isn't "in progress".
      title.textContent = `${modeName(d)} · ${open ? (d.timed ? "today" : "in progress") : dateOf(d.day)}`;
      caption.append(title);
      if (parts) {
        const small = document.createElement("small");
        small.textContent = parts;
        caption.append(document.createElement("br"), small);
      }
      const actions = document.createElement("div");
      actions.className = "book-actions";
      const button = (text, fn) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quiet";
        b.textContent = text;
        b.addEventListener("click", fn);
        actions.append(b);
        return b;
      };
      if (open && onContinue) button(d.timed ? "Open" : "Continue", () => { dialog.close(); onContinue(open); });
      button("Download", () => download(d));
      if (!open) {
        button("Delete", async () => {
          if (!confirm("Delete this drawing? It can't be brought back.")) return;
          await root.ScrawdleDrawing.myDrawings.forget(d.key);
          li.remove();
          if (!grid.children.length) note.textContent = EMPTY_NOTE;
        });
      }
      li.append(img, caption, actions);
      return li;
    }

    async function show() {
      const token = ++request;
      release();
      grid.replaceChildren();
      note.textContent = "Loading…";
      if (!dialog.open) dialog.showModal();
      let open = {};
      let kept = [];
      try {
        [open, kept] = await Promise.all([board.drafts(), root.ScrawdleDrawing.myDrawings.list()]);
      } catch (err) {
        if (token === request) note.textContent = "Couldn't open your drawings in this browser.";
        return;
      }
      if (token !== request || !dialog.open) return;
      const current = ["today", "scrawl", "free", "timed"].map((slot) => open[slot] && open[slot].marked && { ...open[slot], blob: open[slot].image }).filter(Boolean);
      for (const d of current) grid.append(card(d, { open: d.slot }));
      for (const d of kept) grid.append(card(d, { open: null }));
      note.textContent = grid.children.length ? KEPT_NOTE : EMPTY_NOTE;
    }

    return { show };
  }

  root.ScrawdleSketchbook = { create };
})(typeof window !== "undefined" ? window : globalThis);
