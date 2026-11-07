/* Scrawdle Party: the first lobby game. Everyone in the lobby draws the same random parts at the
 * same time, then gives each other's drawings a thumbs up or down, over a few rounds.
 * Rules (scoring, winners, when a phase ends) are in party-rules.js; the lobby contract is at the
 * top of lobby.js. Nothing is stored: drawings and votes only travel as lobby messages.
 *
 * The host's page runs the game: it picks the settings, rolls the parts, ends each phase, counts
 * the votes and sends the results, so every player sees the same outcome. Every page (the host's
 * too) draws its screens from the messages it receives.
 *
 * Messages (ctx.send / ctx.on):
 *   round   host -> all   { round, total, parts, seconds, players }   start drawing
 *   drawing any  -> all   { round, image }                             a finished drawing (null if blank)
 *   vote    host -> all   { round, order }                             start voting; order hides who drew what
 *   ballot  any  -> host  { round, ballot, done }                      ballot: { drawingOwnerId: 1 | -1 | 0 }
 *   results host -> all   { round, total, votes, winners, top, scores, names }
 *   final   host -> all   { scores, names }
 *   sync    host -> all   { round, total, scores, names }              for someone who joins mid-game
 */
(function (root) {
  "use strict";
  const R = root.ScrawdlePartyRules;
  if (!root.ScrawdleLobby || !R || !root.ScrawdleDrawing || !root.ScrawdleTimer) return;

  const REVEAL_MS = 3500; // the parts show on their own before the timer starts
  const SEND_SPREAD_MS = 1200; // when the timer runs out, drawings go out over this long, not all at once

  let promptData = null;
  async function loadPrompts() {
    if (promptData) return promptData;
    const res = await fetch("prompts.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    promptData = await res.json();
    return promptData;
  }

  const el = (tag, props, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    n.append(...kids.filter((k) => k != null));
    return n;
  };

  // One drawing board for the page, made the first time a party starts and moved into each game's
  // screen. It's never given a round, so it never saves over the player's own drawings.
  let drawView = null;
  function getDrawView() {
    if (drawView) return drawView;
    const canvas = el("canvas", { className: "party-board", width: 1800, height: 1200 });
    canvas.setAttribute("aria-label", "Party drawing canvas");
    const parts = el("p", { className: "party-parts" });
    const timer = el("p", { className: "party-timer", role: "timer" });
    const settings = el("aside", { className: "party-settings" });
    settings.setAttribute("aria-label", "Drawing settings");
    const tools = el("div", { className: "party-tools" });
    const root_ = el("section", { className: "party-draw" },
      el("header", { className: "party-top" }, parts, timer),
      el("div", { className: "party-stage" }, canvas), settings, tools);
    const board = root.ScrawdleDrawing.createBoard({ canvas, toolbar: tools, settings, idPrefix: "party-" });
    drawView = { root: root_, board, canvas, parts, timer };
    return drawView;
  }

  // The drawing at 900 by 600 as a data: URL small enough for one message, or null if even the
  // smallest step is too big.
  function encodeDrawing(canvas) {
    for (const step of R.ENCODE_STEPS) {
      const small = el("canvas", { width: step.width, height: Math.round((step.width * 2) / 3) });
      const c = small.getContext("2d");
      c.fillStyle = "#fff";
      c.fillRect(0, 0, small.width, small.height);
      c.drawImage(canvas, 0, 0, small.width, small.height);
      const url = small.toDataURL(step.type, step.quality);
      if (!url.startsWith(`data:${step.type}`)) continue; // this browser can't make that type
      if (url.length <= R.MAX_IMAGE_CHARS) return url;
    }
    return null;
  }
  const isImage = (x) => typeof x === "string" && /^data:image\/(webp|jpeg|png);base64,/.test(x) && x.length <= R.MAX_IMAGE_CHARS;

  function start(ctx) {
    const timers = new Set();
    const later = (ms, fn) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const every = (ms, fn) => { const t = setInterval(fn, ms); timers.add(t); return t; };
    const stop = (t) => { clearTimeout(t); clearInterval(t); timers.delete(t); };

    const me = ctx.me.id;
    const hostId = ctx.players()[0] ? ctx.players()[0].id : me;
    const amHost = () => hostId === me;
    const names = {};
    const rememberNames = (players) => { for (const p of players) names[p.id] = p.name; };
    rememberNames(ctx.players());
    const present = () => ctx.players().map((p) => p.id);

    // What this page knows. `host` is only used on the host's page.
    const game = { phase: "wait", round: 0, total: 0, parts: [], players: [], drawings: {}, order: [], ballot: {}, scores: {}, ended: false };
    const host = { settings: null, submitted: new Set(), ballots: {}, doneVoting: new Set(), voters: [], phaseTimer: null, seen: new Set(present()) };

    /* ---------- screens ---------- */
    const view = el("div", { className: "party" });
    ctx.container.replaceChildren(view);
    function screen(title, ...body) {
      const bar = el("header", { className: "party-bar" },
        el("span", { className: "party-name", textContent: "Scrawdle Party" }),
        el("span", { className: "party-round", textContent: game.total ? `Round ${game.round} of ${game.total}` : "" }),
        amHost() && !game.ended ? el("button", { type: "button", className: "quiet", textContent: "End game", onclick: () => { if (confirm("End the game for everyone?")) ctx.end(); } }) : el("span"));
      const main = el("main", { className: "party-screen" }, title ? el("h2", { textContent: title }) : null, ...body);
      view.replaceChildren(bar, main);
      return main;
    }
    const note = (text) => el("p", { className: "party-note", textContent: text });
    const button = (text, onclick, primary = true) => el("button", { type: "button", className: primary ? "btn primary" : "btn", textContent: text, onclick });
    const partsLine = (parts) => parts.map((p) => `${p.label}: ${p.value}${p.optional ? " (optional)" : ""}`).join(" · ");
    // The countdown math is shared with the Time Challenge (timer.js); the interval stays here, in this
    // game's own timers, so ending the game stops it.
    function countdown(target, seconds, onEnd) {
      const T = root.ScrawdleTimer;
      const endsAt = Date.now() + seconds * 1000;
      const tick = () => {
        const left = T.secondsLeft(endsAt, Date.now());
        target.textContent = T.clockText(left);
        target.classList.toggle("hurry", left <= T.HURRY);
        if (left === 0) { stop(t); if (onEnd) onEnd(); }
      };
      const t = every(250, tick);
      tick();
      return t;
    }
    function scoreboard(scores) {
      const list = el("ol", { className: "party-scores" });
      for (const row of R.standings(scores, names)) {
        list.append(el("li", { className: row.id === me ? "me" : "" },
          el("span", { className: "place", textContent: `${row.place}.` }),
          el("span", { className: "who", textContent: row.id === me ? `${row.name} (you)` : row.name }),
          el("span", { className: "points", textContent: `${row.points} ${row.points === 1 ? "point" : "points"}` })));
      }
      return list;
    }

    function showWaiting(text) {
      game.phase = "wait";
      const list = el("ul", { className: "party-players" }, ...ctx.players().map((p) => el("li", { textContent: p.id === hostId ? `${p.name} (host)` : p.name })));
      screen("Get ready to draw", note(text), list);
    }

    function showSetup() {
      game.phase = "setup";
      const chosen = { ...R.DEFAULTS };
      const group = (label, key, options, show) => {
        const row = el("div", { className: "party-choice", role: "radiogroup" });
        row.setAttribute("aria-label", label);
        const buttons = options.map((value) => {
          const b = el("button", { type: "button", className: "chip", textContent: show(value), onclick: () => { chosen[key] = value; sync(); } });
          return [value, b];
        });
        const sync = () => buttons.forEach(([value, b]) => b.setAttribute("aria-pressed", String(chosen[key] === value)));
        row.append(...buttons.map(([, b]) => b));
        sync();
        return el("fieldset", { className: "party-field" }, el("legend", { textContent: label }), row);
      };
      const players = el("ul", { className: "party-players" });
      // Kept up to date as players come and go, without resetting the settings already chosen.
      game.renderSetupPlayers = () => players.replaceChildren(...ctx.players().map((p) => el("li", { textContent: p.id === me ? `${p.name} (you, host)` : p.name })));
      game.renderSetupPlayers();
      screen("Set up the game",
        note("Everyone draws the same random parts, then votes on each other's drawings. Each thumbs up is a point."),
        group("Parts", "mode", R.OPTIONS.mode, (m) => (m === "basic" ? "Basic" : "Detailed")),
        group("Rounds", "rounds", R.OPTIONS.rounds, String),
        group("Time to draw", "seconds", R.OPTIONS.seconds, (s) => `${s} seconds`),
        players,
        button("Start round 1", () => { host.settings = R.cleanSettings(chosen); game.total = host.settings.rounds; nextRound(); }));
    }

    /* ---------- drawing ---------- */
    function onRound(d, from) {
      if (from !== hostId || !d || !Number.isInteger(d.round) || !Array.isArray(d.parts) || !Array.isArray(d.players)) return;
      Object.assign(game, { phase: "reveal", round: d.round, total: d.total, parts: d.parts, players: d.players, drawings: {}, order: [], ballot: {} });
      if (!game.players.includes(me)) {
        screen(`Round ${d.round}`, note("This round started before you joined, so sit this one out. You'll join at the next round."), el("p", { className: "party-parts-big", textContent: partsLine(d.parts) }));
        return;
      }
      screen("Your parts", el("p", { className: "party-parts-big", textContent: partsLine(d.parts) }), note("Get ready…"));
      later(REVEAL_MS, () => {
        if (game.round !== d.round || game.phase !== "reveal") return;
        game.phase = "draw";
        const v = getDrawView();
        v.board.discard();
        v.parts.textContent = partsLine(d.parts);
        v.board.onDone = () => submit(false);
        view.replaceChildren(v.root);
        game.drawTimer = countdown(v.timer, d.seconds, () => submit(true));
      });
    }

    function submit(timeUp) {
      if (game.phase !== "draw") return;
      game.phase = "sent";
      stop(game.drawTimer);
      const v = getDrawView();
      const image = v.board.isEmpty ? null : encodeDrawing(v.canvas);
      game.drawings[me] = image;
      const round = game.round;
      later(timeUp ? Math.random() * SEND_SPREAD_MS : 0, () => ctx.send("drawing", { round, image }));
      showSent();
    }
    function showSent() {
      const done = game.players.filter((id) => id in game.drawings);
      const mine = game.drawings[me];
      screen("Sent!",
        mine ? el("img", { className: "party-mine", src: mine, alt: "Your drawing" }) : note("Your canvas was empty, so there's nothing to vote on this time."),
        note(`Waiting for the others… ${done.length} of ${game.players.length} done.`));
    }

    function onDrawing(d, from) {
      if (!d || d.round !== game.round || !game.players.includes(from)) return;
      if (from !== me) game.drawings[from] = isImage(d.image) ? d.image : null;
      if (game.phase === "sent") showSent();
      if (amHost()) {
        host.submitted.add(from);
        if (R.everyoneDone(game.players, present(), [...host.submitted])) startVote();
      }
    }

    /* ---------- voting ---------- */
    function startVote() {
      if (!amHost() || host.voteStarted === game.round) return;
      host.voteStarted = game.round;
      stop(host.phaseTimer);
      const withDrawings = [...host.submitted].filter((id) => game.players.includes(id) && game.drawings[id] !== null);
      host.ballots = {};
      host.doneVoting = new Set();
      // Someone who joined mid-round never got the drawings, so only the round's players vote.
      host.voters = game.players.slice();
      ctx.send("vote", { round: game.round, order: R.shuffled(withDrawings) });
      host.phaseTimer = later((R.VOTE_SECONDS + R.GRACE_SECONDS) * 1000, finishRound);
    }

    function onVote(d, from) {
      if (from !== hostId || !d || d.round !== game.round || !Array.isArray(d.order)) return;
      stop(game.drawTimer);
      game.phase = "vote";
      game.order = d.order;
      game.ballot = {};
      let sendTimer = null;
      const sendBallot = (done) => {
        stop(sendTimer);
        ctx.send("ballot", { round: game.round, ballot: { ...game.ballot }, done });
      };
      const grid = el("ul", { className: "party-grid" });
      for (const id of game.order) {
        const image = game.drawings[id];
        const card = el("li", { className: id === me ? "mine" : "" },
          image ? el("img", { src: image, alt: id === me ? "Your drawing" : "A player's drawing" }) : el("div", { className: "party-missing", textContent: "This drawing didn't reach you." }));
        if (id === me) card.append(el("p", { className: "party-card-note", textContent: "Yours" }));
        else if (image) {
          const bar = el("div", { className: "vote-bar" });
          const buttons = [[1, "👍", "Thumbs up"], [-1, "👎", "Thumbs down"]].map(([value, icon, label]) => {
            const b = el("button", { type: "button", className: "vote", textContent: icon });
            b.setAttribute("aria-label", label);
            b.addEventListener("click", () => {
              game.ballot[id] = game.ballot[id] === value ? 0 : value;
              buttons.forEach(([v, btn]) => btn.setAttribute("aria-pressed", String(game.ballot[id] === v)));
              stop(sendTimer);
              sendTimer = later(250, () => sendBallot(false));
            });
            b.setAttribute("aria-pressed", "false");
            bar.append(b);
            return [value, b];
          });
          card.append(bar);
        }
        grid.append(card);
      }
      const timer = el("p", { className: "party-timer", role: "timer" });
      const doneBtn = button("Done voting", () => { sendBallot(true); doneBtn.disabled = true; doneBtn.textContent = "Waiting for the others…"; });
      screen("Vote!", note("Names stay hidden until the results. Give each drawing a thumbs up or down; press again to take it back."), timer, grid, doneBtn);
      countdown(timer, R.VOTE_SECONDS, () => { if (game.phase === "vote") sendBallot(true); });
    }

    function onBallot(d, from) {
      if (!amHost() || !d || d.round !== game.round || host.finished === game.round) return;
      const ballot = {};
      for (const [id, value] of Object.entries(d.ballot || {})) if ([1, -1, 0].includes(value)) ballot[id] = value;
      host.ballots[from] = ballot;
      if (d.done) host.doneVoting.add(from);
      if (R.everyoneDone(host.voters, present(), [...host.doneVoting])) finishRound();
    }

    function finishRound() {
      if (!amHost() || host.finished === game.round) return;
      host.finished = game.round;
      stop(host.phaseTimer);
      const owners = game.order.length ? game.order : [...host.submitted];
      const result = R.roundResults(owners, host.ballots);
      game.scores = R.addScores(game.scores, result.votes);
      for (const id of game.players) if (!(id in game.scores)) game.scores[id] = 0;
      ctx.send("results", { round: game.round, total: game.total, ...result, scores: game.scores, names });
    }

    /* ---------- results ---------- */
    function onResults(d, from) {
      if (from !== hostId || !d || d.round !== game.round) return;
      game.phase = "results";
      Object.assign(names, d.names || {});
      game.scores = d.scores || {};
      const grid = el("ul", { className: "party-grid results" });
      for (const id of Object.keys(d.votes || {})) {
        const v = d.votes[id];
        const won = (d.winners || []).includes(id);
        const top = (d.top || []).includes(id);
        const image = game.drawings[id];
        grid.append(el("li", { className: [id === me ? "mine" : "", won ? "won" : ""].join(" ").trim() },
          image ? el("img", { src: image, alt: `${names[id] || "A player"}'s drawing` }) : el("div", { className: "party-missing", textContent: "This drawing didn't reach you." }),
          el("p", { className: "party-card-name", textContent: `${names[id] || "Player"}${id === me ? " (you)" : ""}` }),
          el("p", { className: "party-card-votes", textContent: `👍 ${v.up} · 👎 ${v.down}${top ? " · Top drawing!" : won ? " · Won the round" : ""}` })));
      }
      const last = d.round >= d.total;
      const next = amHost()
        ? button(last ? "See final scores" : `Start round ${d.round + 1}`, () => (last ? ctx.send("final", { scores: game.scores, names }) : nextRound()))
        : note("Waiting for the host…");
      const mineWon = (d.winners || []).includes(me);
      screen(mineWon ? "You won the round!" : `Round ${d.round} results`, grid.childElementCount ? grid : note("No drawings this round."), el("h3", { textContent: "Scores" }), scoreboard(game.scores), next);
    }

    function onFinal(d, from) {
      if (from !== hostId || !d) return;
      game.phase = "final";
      game.ended = true;
      Object.assign(names, d.names || {});
      const rows = R.standings(d.scores || {}, names);
      const winners = rows.filter((r) => r.place === 1 && r.points > 0);
      const title = !winners.length ? "Game over" : winners.some((w) => w.id === me) ? "You win the game!" : `${winners.map((w) => w.name).join(" and ")} ${winners.length > 1 ? "win" : "wins"}!`;
      screen(title, scoreboard(d.scores || {}), amHost() ? button("Back to lobby", () => ctx.end()) : note("The host will take everyone back to the lobby."));
    }

    /* ---------- host: rounds ---------- */
    async function nextRound() {
      if (!amHost()) return;
      let data;
      try { data = await loadPrompts(); } catch (err) {
        screen("Couldn't load the parts", note("Check your connection, then try again."), button("Try again", nextRound));
        return;
      }
      game.round += 1;
      host.submitted = new Set();
      const players = present();
      const seconds = host.settings.seconds;
      ctx.send("round", { round: game.round, total: game.total, parts: R.rollParts(data, host.settings.mode), seconds, players });
      stop(host.phaseTimer);
      host.phaseTimer = later(REVEAL_MS + (seconds + R.GRACE_SECONDS) * 1000 + SEND_SPREAD_MS, startVote);
    }

    /* ---------- players coming and going ---------- */
    function onPlayersChange(players) {
      rememberNames(players);
      const ids = players.map((p) => p.id);
      if (!ids.includes(hostId) && !game.ended) {
        game.ended = true;
        screen("The host left", note("So this game is over. Taking everyone back to the lobby…"));
        if (ctx.isHost()) later(3500, () => ctx.end());
        return;
      }
      if (game.phase === "wait") showWaiting(game.round ? "A game is on. You'll join at the next round." : "The host is choosing the settings.");
      if (game.phase === "setup" && game.renderSetupPlayers) game.renderSetupPlayers();
      if (!amHost()) return;
      const arrived = ids.filter((id) => !host.seen.has(id));
      arrived.forEach((id) => host.seen.add(id));
      if (arrived.length && game.round) ctx.send("sync", { round: game.round, total: game.total, scores: game.scores, names });
      // Someone leaving can mean everyone left is now done.
      if (game.phase === "sent" || game.phase === "draw") if (R.everyoneDone(game.players, ids, [...host.submitted])) startVote();
      if (game.phase === "vote" && R.everyoneDone(host.voters, ids, [...host.doneVoting])) finishRound();
    }
    function onSync(d, from) {
      if (from !== hostId || !d || game.round) return;
      Object.assign(names, d.names || {});
      game.total = d.total;
      showWaiting(`A game is on: round ${d.round} of ${d.total}. You'll join at the next round.`);
    }

    ctx.on("round", onRound);
    ctx.on("drawing", onDrawing);
    ctx.on("vote", onVote);
    ctx.on("ballot", onBallot);
    ctx.on("results", onResults);
    ctx.on("final", onFinal);
    ctx.on("sync", onSync);
    ctx.onPlayersChange(onPlayersChange);

    if (amHost()) showSetup();
    else showWaiting("The host is choosing the settings.");

    return () => {
      game.ended = true;
      for (const t of timers) { clearTimeout(t); clearInterval(t); }
      timers.clear();
      if (drawView) { drawView.board.onDone = () => {}; drawView.board.discard(); drawView.root.remove(); }
    };
  }

  root.ScrawdleLobby.registerGame({
    id: "party",
    title: "Scrawdle Party",
    description: "Everyone draws the same random parts, then votes. Each thumbs up is a point.",
    minPlayers: 2,
    start,
  });
})(typeof window !== "undefined" ? window : globalThis);
