/* Today's gallery: other players' published drawings, with votes, and your own result.
 * publish.js connects the real drawings and votes by setting:
 *   window.scrawdleGallery = async ({ day, mode, prompts }) => [{ id, imageUrl, caption, mine, votes }];
 *   window.scrawdleVote = async ({ drawingId, value }) => {};  // 1, -1, or 0 to take it back
 * `votes` is { up, down, mine } (see votes.js), or null when voting isn't available. Your own
 * drawing (mine: true) gets no vote buttons; its votes show as your result instead.
 */
(function (root) {
  "use strict";
  function createGallery(board) {
    const dialog = document.createElement("dialog");
    dialog.id = "gallery";
    dialog.setAttribute("aria-labelledby", "gallery-title");
    dialog.innerHTML = '<header class="app-header"><span class="wordmark">Scrawdle</span><button class="quiet" type="button">Back</button></header><div class="gallery-heading"><h2 id="gallery-title"></h2></div><p class="gallery-note" role="status"></p><ul class="gallery-grid"></ul>';
    const closeBtn = dialog.querySelector("button");
    closeBtn.addEventListener("click", () => dialog.close());
    const title = dialog.querySelector("h2");
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
      return li;
    }
    // Thumbs up and down under someone else's drawing. Shows the new vote straight away, and
    // puts the old one back if saving it fails.
    function addVotes(li, item) {
      const bar = document.createElement("div");
      bar.className = "vote-bar";
      const buttons = [[1, "👍", "Thumbs up"], [-1, "👎", "Thumbs down"]].map(([value, icon, name]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "vote";
        b.addEventListener("click", () => vote(value));
        bar.append(b);
        return { b, value, icon, name };
      });
      let busy = false;
      const render = () => {
        for (const { b, value, icon, name } of buttons) {
          const count = value === 1 ? item.votes.up : item.votes.down;
          b.textContent = `${icon} ${count}`;
          b.setAttribute("aria-label", `${name}, ${count} ${count === 1 ? "vote" : "votes"}`);
          b.setAttribute("aria-pressed", String(item.votes.mine === value));
          b.disabled = busy;
        }
      };
      async function vote(pressed) {
        if (busy) return;
        const before = item.votes;
        const { value, votes } = root.ScrawdleVotes.applyVote(before, pressed);
        item.votes = votes;
        busy = true;
        render();
        try {
          await root.scrawdleVote({ drawingId: item.id, value });
        } catch (err) {
          item.votes = before;
          note.textContent = err.userMessage || "Couldn't save your vote. Try again.";
        }
        busy = false;
        render();
      }
      render();
      li.append(bar);
    }
    // Report, under someone else's drawing. Three different players' reports hide it for everyone
    // (the number is set in the database's report_drawing; change this message with it). This
    // browser remembers what it reported, so the button stays "Reported".
    const REPORTED_KEY = "scrawdle-reported";
    const reportedIds = () => {
      try { return JSON.parse(localStorage.getItem(REPORTED_KEY) || "[]"); } catch (err) { return []; }
    };
    function addReport(li, item) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiet report";
      const reported = () => { b.textContent = "Reported"; b.disabled = true; };
      if (reportedIds().includes(item.id)) reported();
      else b.textContent = "Report";
      b.addEventListener("click", async () => {
        if (!confirm("Report this drawing? It's hidden from the gallery once 3 players report it.")) return;
        b.disabled = true;
        try {
          const { hidden } = await root.scrawdleReport({ drawingId: item.id });
          try { localStorage.setItem(REPORTED_KEY, JSON.stringify([...reportedIds(), item.id].slice(-200))); } catch (err) { /* private browsing */ }
          reported();
          note.textContent = hidden ? "Thanks. That drawing is hidden now." : "Thanks for reporting it.";
          if (hidden) li.remove();
        } catch (err) {
          b.disabled = false;
          note.textContent = err.userMessage || "Couldn't send your report. Try again.";
        }
      });
      li.append(b);
    }
    async function show(myImageUrl) {
      const round = board.round;
      const token = ++request;
      title.textContent = "Today's drawings";
      grid.replaceChildren();
      const myCard = addCard(myImageUrl, "Your drawing · saved locally", true);
      dialog.showModal();
      note.textContent = "Loading…";
      try {
        const items = await root.scrawdleGallery({ day: round.day, mode: round.mode, prompts: round.prompts });
        if (token !== request || !dialog.open) return;
        const mine = items.find((item) => item.mine);
        const others = items.filter((item) => !item.mine);
        // Your result: won once anyone gives your published drawing a thumbs up (see votes.js).
        if (mine) myCard.querySelector("p").textContent = "Your drawing · published";
        if (!mine || mine.votes) {
          const result = document.createElement("p");
          result.className = "vote-result";
          result.classList.toggle("won", root.ScrawdleVotes.isWin(mine && mine.votes));
          result.textContent = root.ScrawdleVotes.resultText(mine && mine.votes);
          myCard.append(result);
        }
        note.textContent = others.length ? "" : "No community drawings to show yet.";
        const canVote = typeof root.scrawdleVote === "function";
        const canReport = typeof root.scrawdleReport === "function";
        for (const item of others) {
          const li = addCard(item.imageUrl, item.caption);
          if (canVote && item.votes) addVotes(li, item);
          if (canReport && item.id) addReport(li, item);
        }
      } catch (err) {
        if (token === request && dialog.open) note.textContent = "Couldn't load today's drawings. Close and reopen the gallery to try again.";
      }
    }
    return { show };
  }
  if (typeof module === "undefined" || !module.exports) root.ScrawdleGallery = { createGallery };
})(typeof window !== "undefined" ? window : globalThis);
