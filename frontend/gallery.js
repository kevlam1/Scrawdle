/* Today's gallery: other players' published drawings, with votes, and your own result.
 * publish.js connects the real drawings and votes by setting:
 *   window.scrawdleGallery = async ({ day, mode, prompts }) => [{ id, imageUrl, caption, mine, votes }];
 *   window.scrawdleVote = async ({ drawingId, value }) => {};  // 1, -1, or 0 to take it back
 * `votes` is { up, down, mine } (see votes.js), or null when voting isn't available. Your own
 * drawing (mine: true) gets no vote buttons; its votes show as your result instead.
 */
(function (root) {
  "use strict";
  // With no options the gallery is a dialog over the page (today's drawings, opened from the finish screen).
  // With { container } it is the page itself: the Public drawings route (frontend/public-drawings/) puts it
  // in that element, and Back leaves the page instead of closing a dialog.
  function createGallery(board, { container } = {}) {
    const page = Boolean(container);
    const dialog = document.createElement(page ? "main" : "dialog");
    dialog.id = "gallery";
    dialog.setAttribute("aria-labelledby", "gallery-title");
    if (page) dialog.className = "gallery-page";
    const wordmark = page ? '<a class="wordmark" href="../" aria-label="Scrawdle, back to the home screen">Scrawdle</a>' : '<span class="wordmark">Scrawdle</span>';
    dialog.innerHTML = '<header class="app-header">' + wordmark + '<button class="quiet" type="button">Back</button></header><div class="gallery-heading"><h2 id="gallery-title"></h2><p class="gallery-sub">Today\u2019s drawings, posted without names. They leave this page at midnight and are deleted within two days.</p></div><div class="public-filters" hidden></div><p class="gallery-note" role="status"></p><ul class="gallery-grid"></ul>';
    const closeBtn = dialog.querySelector("button");
    const open = () => { if (!page) dialog.showModal(); };
    const isOpen = () => page || dialog.open;
    // On the page, Back goes to where you came from on this site (like the browser's Back), or home if you
    // arrived some other way, such as a pasted link.
    function leavePage() {
      let fromThisSite = false;
      try { fromThisSite = Boolean(document.referrer) && new URL(document.referrer).origin === location.origin; } catch (err) { /* no usable referrer */ }
      if (fromThisSite && history.length > 1) history.back();
      else location.href = "../";
    }
    closeBtn.addEventListener("click", () => (page ? leavePage() : dialog.close()));
    const title = dialog.querySelector("h2");
    const note = dialog.querySelector(".gallery-note");
    const filters = dialog.querySelector(".public-filters");
    const grid = dialog.querySelector(".gallery-grid");
    let request = 0;
    dialog.addEventListener("close", () => { request++; });
    (page ? container : document.body).appendChild(dialog);
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
    // A small heart in the corner of someone else's drawing: press it to like the drawing (it fills red),
    // press again to take it back. The number is how many players like it. Shows the change straight away,
    // and puts the old one back if saving it fails.
    function addVotes(li, item) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "like";
      b.addEventListener("click", vote);
      let busy = false;
      const render = () => {
        const liked = item.votes.mine === 1;
        const count = item.votes.up;
        b.replaceChildren(root.ScrawdleVotes.heartIcon(liked), String(count));
        b.setAttribute("aria-label", `Like, ${count} ${count === 1 ? "like" : "likes"}`);
        b.setAttribute("aria-pressed", String(liked));
        b.disabled = busy;
      };
      async function vote() {
        if (busy) return;
        const before = item.votes;
        const { value, votes } = root.ScrawdleVotes.applyVote(before, 1);
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
      li.append(b);
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
      open();
      note.textContent = "Loading…";
      try {
        const items = await root.scrawdleGallery({ day: round.day, mode: round.mode, prompts: round.prompts });
        if (token !== request || !isOpen()) return;
        const mine = items.find((item) => item.mine);
        const others = items.filter((item) => !item.mine);
        // Your result: its likes, and won once anyone likes your published drawing (see votes.js).
        if (mine) myCard.querySelector("p").textContent = "Your drawing · published";
        if (!mine || mine.votes) addResult(myCard, mine && mine.votes);
        note.textContent = others.length ? "" : "No community drawings to show yet.";
        const canVote = typeof root.scrawdleVote === "function";
        const canReport = typeof root.scrawdleReport === "function";
        for (const item of others) {
          const li = addCard(item.imageUrl, item.caption);
          if (canVote && item.votes) addVotes(li, item);
          if (canReport && item.id) addReport(li, item);
        }
      } catch (err) {
        if (token === request && isOpen()) note.textContent = "Couldn't load today's drawings. Close and reopen the gallery to try again.";
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
    // A padlock drawn in two halves, so it can break: the shackle pops off and the body splits (see home.css).
    const LOCK_SVG = '<svg class="lock-icon" viewBox="0 0 24 24" aria-hidden="true"><path class="lock-shackle" d="M7.5 11V8a4.5 4.5 0 0 1 9 0v3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path class="lock-half left" d="M4.5 11H12v10H6.5a2 2 0 0 1-2-2z" fill="currentColor"/><path class="lock-half right" d="M12 11h7.5v8a2 2 0 0 1-2 2H12z" fill="currentColor"/></svg>';
    // The breaking lock plays once for each day's unlock, the first time the page opens after you've posted. This
    // browser remembers which day it last played for.
    const UNLOCK_SEEN_KEY = "scrawdle-unlock-seen";
    const BREAK_MS = 1150;
    const localDay = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };
    // Your own drawing on the public page shows how it did, like the old Today's drawings page did.
    function addResult(li, votes) {
      if (votes) li.append(root.ScrawdleVotes.likeCount(votes.up, votes.up > 0));
      const text = root.ScrawdleVotes.resultText(votes);
      if (!text) return;
      const result = document.createElement("p");
      result.className = "vote-result";
      result.classList.toggle("won", root.ScrawdleVotes.isWin(votes));
      result.textContent = text;
      li.append(result);
    }
    // `focus` ("daily" or "free") starts with only that kind showing, for opening the page from a finished drawing.
    // From the home screen there is no focus, so every unlocked kind shows.
    async function showPublic({ focus } = {}) {
      const token = ++request;
      const posted = typeof root.scrawdleHasPosted === "function" && root.scrawdleHasPosted();
      title.textContent = "Public drawings";
      grid.replaceChildren();
      filters.replaceChildren();
      filters.hidden = false;
      // Opened for Daily Scrawl before posting one, there's nothing to see behind the lock, so what's open shows too.
      const lockedOut = focus === "daily" && !posted;
      const startsOn = (id) => !focus || focus === id || lockedOut;
      let seenDay = null;
      try { seenDay = localStorage.getItem(UNLOCK_SEEN_KEY); } catch (err) { /* private browsing: it just plays each time */ }
      const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const breaking = posted && seenDay !== localDay() && !reduceMotion;
      const on = { daily: posted && !breaking && startsOn("daily"), free: startsOn("free") }; // Daily Scrawl joins in when the lock has broken
      if (posted && seenDay !== localDay()) {
        try { localStorage.setItem(UNLOCK_SEEN_KEY, localDay()); } catch (err) { /* see above */ }
      }
      let items = null;
      let lockBreaking = breaking; // true until the lock has finished breaking
      const bubbles = {};
      const why = document.createElement("p");
      why.className = "lock-why";
      why.textContent = LOCK_WHY;
      why.hidden = !lockedOut; // say why straight away when Daily Scrawl was what they came for
      for (const g of GROUPS) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "bubble";
        b.textContent = g.label;
        let locked = g.id === "daily" && (!posted || breaking); // while it breaks, it still looks locked
        if (locked) { b.classList.add("locked"); b.setAttribute("aria-disabled", "true"); b.setAttribute("aria-label", `${g.label}, locked`); b.insertAdjacentHTML("beforeend", LOCK_SVG); }
        b.setAttribute("aria-pressed", String(on[g.id]));
        b.addEventListener("click", () => {
          if (locked) { why.hidden = false; return; }
          on[g.id] = !on[g.id];
          b.setAttribute("aria-pressed", String(on[g.id]));
          render();
        });
        bubbles[g.id] = b;
        filters.append(b);
        if (locked && !breaking) {
          const q = document.createElement("button");
          q.type = "button";
          q.className = "help-dot";
          q.textContent = "?";
          q.title = LOCK_WHY;
          q.setAttribute("aria-label", "Why is Daily Scrawl locked?");
          q.addEventListener("click", () => { why.hidden = !why.hidden; });
          filters.append(q);
        }
        if (g.id === "daily" && breaking) {
          // The lock shakes, breaks, and the bubble opens up.
          requestAnimationFrame(() => b.classList.add("breaking"));
          setTimeout(() => {
            if (token !== request) return;
            locked = false;
            lockBreaking = false;
            b.classList.remove("locked", "breaking");
            b.removeAttribute("aria-disabled");
            b.removeAttribute("aria-label");
            b.querySelector(".lock-icon").remove();
            on.daily = startsOn("daily");
            b.setAttribute("aria-pressed", String(on.daily));
            b.classList.add("unlocked-pop");
            for (let i = 0; i < 8; i++) {
              const spark = document.createElement("i");
              spark.className = "spark";
              spark.style.setProperty("--angle", `${i * 45}deg`);
              b.append(spark);
            }
            why.textContent = "Unlocked! Everyone's Daily Scrawl drawings are here now.";
            why.hidden = false;
            render();
            setTimeout(() => {
              b.classList.remove("unlocked-pop");
              b.querySelectorAll(".spark").forEach((s) => s.remove());
              if (token === request) why.hidden = true;
            }, 3500);
          }, BREAK_MS);
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
          // Daily Scrawl drawings (and the older Basic and Detailed) go under Daily Scrawl; Daily Free Play under its own.
          const kind = GROUPS.find((g) => g.modes.includes(item.mode)).label;
          const li = addCard(item.imageUrl, item.mine ? `Your drawing · ${kind}` : kind, item.mine);
          if (item.mine) { // your own drawing has no vote or report buttons; its votes show as your result
            if (item.votes) addResult(li, item.votes);
            continue;
          }
          if (canVote && item.votes) addVotes(li, item);
          if (canReport && item.id) addReport(li, item);
        }
        note.textContent = shown.length || lockBreaking ? "" : !on.daily && !on.free ? "Turn on a bubble to see drawings." : posted ? "No drawings to show yet." : "No Daily Free Play drawings yet today.";
      }
      open();
      note.textContent = "Loading\u2026";
      try {
        items = await root.scrawdlePublicGallery({ modes: posted ? GROUPS.flatMap((g) => g.modes) : GROUPS[1].modes });
        if (token !== request || !isOpen()) return;
        render();
      } catch (err) {
        if (token === request && isOpen()) note.textContent = page ? "Couldn't load the public drawings. Reload this page to try again." : "Couldn't load the public drawings. Close and reopen this page to try again.";
      }
    }
    return { show, showPublic };
  }
  if (typeof module === "undefined" || !module.exports) root.ScrawdleGallery = { createGallery };
})(typeof window !== "undefined" ? window : globalThis);
