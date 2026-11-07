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
    dialog.innerHTML = '<header class="app-header"><span class="wordmark">Scrawdle</span><button class="quiet" type="button">Back</button></header><div class="gallery-heading"><h2 id="gallery-title"></h2></div><div class="public-filters" hidden></div><p class="gallery-note" role="status"></p><ul class="gallery-grid"></ul>';
    const closeBtn = dialog.querySelector("button");
    closeBtn.addEventListener("click", () => dialog.close());
    const title = dialog.querySelector("h2");
    const note = dialog.querySelector(".gallery-note");
    const filters = dialog.querySelector(".public-filters");
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
      img.loading = "lazy"; // the public page can hold a lot of drawings
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
      filters.hidden = true;
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
    // Public drawings: everything posted, with a bubble for each kind. Daily Scrawl stays locked until
    // this player has posted their own (publish.js's scrawdleHasPosted). That's a courtesy in the page,
    // not security: the database lets anyone read published drawings.
    const GROUPS = [
      { id: "daily", label: "Daily Scrawl", modes: ["daily", "basic", "detailed"] },
      { id: "free", label: "Daily Free Play", modes: ["scrawl"] },
    ];
    const LOCK_WHY = "Post your own Daily Scrawl drawing to unlock everyone else's.";
    async function showPublic() {
      const token = ++request;
      const posted = typeof root.scrawdleHasPosted === "function" && root.scrawdleHasPosted();
      title.textContent = "Public drawings";
      grid.replaceChildren();
      filters.replaceChildren();
      filters.hidden = false;
      const on = { daily: posted, free: true };
      let items = null;
      const bubbles = {};
      const why = document.createElement("p");
      why.className = "lock-why";
      why.textContent = LOCK_WHY;
      why.hidden = true;
      for (const g of GROUPS) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "bubble";
        b.textContent = g.label;
        const locked = g.id === "daily" && !posted;
        if (locked) { b.classList.add("locked"); b.setAttribute("aria-disabled", "true"); b.textContent = `${g.label} \u{1F512}`; }
        b.setAttribute("aria-pressed", String(on[g.id]));
        b.addEventListener("click", () => {
          if (locked) { why.hidden = false; return; }
          on[g.id] = !on[g.id];
          b.setAttribute("aria-pressed", String(on[g.id]));
          render();
        });
        bubbles[g.id] = b;
        filters.append(b);
        if (locked) {
          const q = document.createElement("button");
          q.type = "button";
          q.className = "help-dot";
          q.textContent = "?";
          q.title = LOCK_WHY;
          q.setAttribute("aria-label", "Why is Daily Scrawl locked?");
          q.addEventListener("click", () => { why.hidden = !why.hidden; });
          filters.append(q);
        }
      }
      filters.append(why);
      function render() {
        grid.replaceChildren();
        if (!items) return;
        const shown = items.filter((item) => GROUPS.some((g) => on[g.id] && g.modes.includes(item.mode)));
        const canVote = typeof root.scrawdleVote === "function";
        const canReport = typeof root.scrawdleReport === "function";
        for (const item of shown) {
          const kind = GROUPS.find((g) => g.modes.includes(item.mode)).label;
          const li = addCard(item.imageUrl, item.mine ? `Your drawing · ${kind}` : kind, item.mine);
          if (item.mine) continue; // your own drawing has no vote or report buttons, as in today's gallery
          if (canVote && item.votes) addVotes(li, item);
          if (canReport && item.id) addReport(li, item);
        }
        note.textContent = shown.length ? "" : !on.daily && !on.free ? "Turn on a bubble to see drawings." : "No drawings to show yet.";
      }
      dialog.showModal();
      note.textContent = "Loading\u2026";
      try {
        items = await root.scrawdlePublicGallery({ modes: posted ? GROUPS.flatMap((g) => g.modes) : GROUPS[1].modes });
        if (token !== request || !dialog.open) return;
        render();
      } catch (err) {
        if (token === request && dialog.open) note.textContent = "Couldn't load the public drawings. Close and reopen this page to try again.";
      }
    }
    return { show, showPublic };
  }
  if (typeof module === "undefined" || !module.exports) root.ScrawdleGallery = { createGallery };
})(typeof window !== "undefined" ? window : globalThis);
