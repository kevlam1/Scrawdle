/* Real community results and a clearly separate sample gallery.
 * Real drawings aren't connected yet, so only the samples show. To connect them, set:
 *   window.scrawdleGallery = async ({ day, mode, prompts }) => [{ imageUrl, caption }];
 */
(function (root) {
  "use strict";
  function createGallery(board) {
    const dialog = document.createElement("dialog");
    dialog.id = "gallery";
    dialog.setAttribute("aria-labelledby", "gallery-title");
    dialog.innerHTML = '<header class="app-header"><span class="wordmark">Scrawdle</span><button class="quiet" type="button">Back</button></header><div class="gallery-heading"><span class="sample-tag" hidden>Sample drawings</span><h2 id="gallery-title"></h2></div><p class="gallery-note" role="status"></p><ul class="gallery-grid"></ul>';
    const closeBtn = dialog.querySelector("button");
    closeBtn.addEventListener("click", () => dialog.close());
    const title = dialog.querySelector("h2");
    const tag = dialog.querySelector(".sample-tag");
    const note = dialog.querySelector(".gallery-note");
    const grid = dialog.querySelector(".gallery-grid");
    let request = 0;
    dialog.addEventListener("close", () => { request++; });
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
    function showSamples() {
      request++;
      grid.replaceChildren();
      tag.hidden = false;
      title.textContent = "A bowl of strawberries";
      note.textContent = "Six sample interpretations. These are examples, not drawings posted by players.";
      const captions = ["Colored pencil", "Graphite", "Blue ceramic", "Watercolor", "Bold shapes", "Crayon"];
      for (let i = 0; i < captions.length; i++) {
        const li = document.createElement("li");
        const art = document.createElement("div");
        art.className = "sample-art";
        art.setAttribute("role", "img");
        art.setAttribute("aria-label", `${captions[i]} sample of a bowl of strawberries`);
        art.style.setProperty("--sample-position", `${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%`);
        const caption = document.createElement("p");
        caption.textContent = captions[i];
        li.append(art, caption);
        grid.append(li);
      }
      dialog.showModal();
    }
    async function show(myImageUrl) {
      const round = board.round;
      const token = ++request;
      tag.hidden = true;
      title.textContent = "Today's drawings";
      grid.replaceChildren();
      addCard(myImageUrl, "Your drawing · saved locally", true);
      dialog.showModal();
      note.textContent = "Loading…";
      try {
        const items = await root.scrawdleGallery({ day: round.day, mode: round.mode, prompts: round.prompts });
        if (token !== request || !dialog.open) return;
        note.textContent = items.length ? "" : "No community drawings to show yet.";
        for (const item of items) addCard(item.imageUrl, item.caption);
      } catch (err) {
        if (token === request && dialog.open) note.textContent = "Couldn't load today's drawings. Close and reopen the gallery to try again.";
      }
    }
    return { show, showSamples };
  }
  if (typeof module === "undefined" || !module.exports) root.ScrawdleGallery = { createGallery };
})(typeof window !== "undefined" ? window : globalThis);
