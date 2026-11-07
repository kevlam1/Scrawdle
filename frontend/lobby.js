/* Lobbies: private rooms people join with an invite link like scrawdle.vercel.app/?BCDFG. The 5-letter
 * code in the link is how the database knows the lobby, but players never see or type it.
 *
 * What this file does: "Create Lobby" and "Join with a code" on the home screen, the lobby room
 * (the code, an invite link, who's in it), and a small contract for games to plug into. It does
 * NOT contain any game. Lobbies only exist while Supabase is configured (supabase-config.js).
 *
 * HOW IT WORKS
 *  - The code is made by the database (create_lobby() in backend/supabase/schema.sql) and checked
 *    by lobby_exists(). Nothing about WHO is in a lobby is stored: that's Supabase Realtime,
 *    one channel per lobby, using presence (who's here) and broadcast (messages).
 *  - A code is the only thing keeping a lobby private. Anyone who has it can join.
 *  - The host is whoever has been in the lobby longest. Everyone works it out from the same
 *    presence data, so everyone agrees. If the host leaves, the next one takes over.
 *  - Up to MAX_PLAYERS people per lobby.
 *
 * ADDING A GAME (this is the part other people's code uses)
 *
 *   ScrawdleLobby.registerGame({
 *     id: "pictionary",              // lowercase letters, digits, dashes
 *     title: "Pictionary",           // shown on the host's Start button
 *     description: "Guess the drawing.",   // optional
 *     minPlayers: 2,                 // optional, default 1
 *     start(ctx) {                   // called on EVERY player's page when the host presses Start
 *       ctx.container.textContent = "Game on!";   // draw your game's screen inside this element
 *       return () => { ... };        // optional: cleanup, called when the game ends
 *     },
 *   });
 *
 *   ctx.container            the full-screen element your game draws into
 *   ctx.code                 the lobby code
 *   ctx.me                   { id, name } for this player
 *   ctx.players()            [{ id, name, joinedAt, game }] in join order; players()[0] is the host
 *   ctx.isHost()             true on the host's page
 *   ctx.onPlayersChange(fn)  fn(players) when someone joins, leaves, or renames. Returns an unsubscribe.
 *   ctx.send(event, data)    send to everyone in the lobby, including yourself
 *   ctx.on(event, fn)        fn(data, fromPlayerId) for each ctx.send(event, ...). Returns an unsubscribe.
 *   ctx.end()                end the game for everyone and return to the lobby
 *
 * Load your game's <script> AFTER lobby.js in index.html, so ScrawdleLobby exists when it runs.
 *
 * LIMITS you'll feel (Supabase free plan, per its Realtime limits page, read 2026-11-04):
 * 100 messages per second for the whole project, 256 KB per message, 200 connections at once (one
 * per player). So don't send every pointer movement: batch strokes, and send them a few times a
 * second at most. If the database or this file needs a change, ask Kevin; he runs the SQL.
 */
(function (root) {
  "use strict";

  /* ---------- Pure helpers (tested in tests/lobby.test.js) ---------- */
  const MAX_PLAYERS = 8;
  const NAME_MAX = 20;
  const GAME_ID_RE = /^[a-z0-9][a-z0-9-]{0,30}$/;

  // "abcde", " BCDFG " -> "ABCDE", "BCDFG"; anything that isn't exactly five letters -> null.
  function normalizeCode(input) {
    const code = String(input == null ? "" : input).trim().toUpperCase();
    return /^[A-Z]{5}$/.test(code) ? code : null;
  }

  // "?BCDFG" -> "BCDFG". Only a bare five-letter query counts, so other links are left alone.
  function codeFromSearch(search) {
    const match = /^\?([A-Za-z]{5})\/?$/.exec(String(search == null ? "" : search));
    return match ? match[1].toUpperCase() : null;
  }

  function lobbyLink(origin, pathname, code) {
    return `${origin}${pathname || "/"}?${code}`;
  }

  function cleanName(input) {
    return String(input == null ? "" : input)
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, NAME_MAX)
      .trim();
  }

  const ADJECTIVES = ["Brave", "Sleepy", "Wobbly", "Sneaky", "Jolly", "Fuzzy", "Speedy", "Grumpy", "Dizzy", "Bouncy", "Cosmic", "Tiny"];
  const ANIMALS = ["Otter", "Gecko", "Moth", "Heron", "Newt", "Lynx", "Toad", "Finch", "Yak", "Wombat", "Crab", "Mole"];
  function randomName(rand = Math.random) {
    const pick = (list) => list[Math.min(list.length - 1, Math.floor(rand() * list.length))];
    return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
  }

  // Supabase's presenceState() is { key: [meta, ...] }. Keep each player's newest meta, drop
  // anything malformed, and sort by how long they've been here (the first one is the host).
  function playersFromState(state) {
    const players = [];
    for (const metas of Object.values(state || {})) {
      const meta = Array.isArray(metas) ? metas[metas.length - 1] : null;
      if (!meta || typeof meta.id !== "string" || typeof meta.name !== "string") continue;
      players.push({
        id: meta.id,
        name: cleanName(meta.name) || "Player",
        joinedAt: Number(meta.joinedAt) || 0,
        game: typeof meta.game === "string" ? meta.game : null,
      });
    }
    players.sort((a, b) => a.joinedAt - b.joinedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return players;
  }

  function isOverCap(players, myId, max = MAX_PLAYERS) {
    const index = players.findIndex((p) => p.id === myId);
    return index >= max;
  }

  function activeGameOf(players) {
    const found = players.find((p) => p.game);
    return found ? found.game : null;
  }

  // The callback argument of a broadcast may be the whole message or just its payload.
  function unwrap(message) {
    if (message && typeof message === "object" && "payload" in message && "event" in message) return message.payload;
    return message;
  }

  /* ----- Kicking (the host kicks, or everyone else votes someone out) ----- */
  const VOTE_MS = 30000;        // how long a vote to kick stays open
  const VOTE_COOLDOWN_MS = 60000; // after a vote fails, how long before the same player can be voted on again
  const VOTE_MIN_PLAYERS = 3;   // with two, one person would decide alone, and the host can already kick

  // A kick counts if the current host sent it, or if it carries out a vote this page saw pass.
  // (Messages say who sent them, and the lobby can't check that, so this keeps out honest
  // mistakes and other pages' bugs, not someone set on faking messages.)
  function mayKick(players, body, passedVotes) {
    if (!body || typeof body.target !== "string" || typeof body.by !== "string" || body.target === body.by) return false;
    if (body.reason === "vote") return Boolean(passedVotes && passedVotes.has && passedVotes.has(`${body.voteId}|${body.target}`));
    return players.length > 0 && players[0].id === body.by;
  }

  // Why this player can't call a vote on that one right now, or null if they can.
  function voteBlocker({ players, me, target, active, cooldownUntil = 0, now = Date.now(), inGame = false }) {
    if (inGame) return "Votes to kick happen in the lobby, not during a game.";
    if (active) return "A vote is already going.";
    if (players.length < VOTE_MIN_PLAYERS) return `Votes to kick need at least ${VOTE_MIN_PLAYERS} players.`;
    if (target === me) return "You can't vote to kick yourself.";
    if (!players.some((p) => p.id === target) || !players.some((p) => p.id === me)) return "That player isn't here.";
    if (now < cooldownUntil) return "That player was just voted on. Try again in a minute.";
    return null;
  }

  // Everyone in the lobby except the player being voted on has a say, and it takes all of them.
  // One No ends it; so does the time running out. Players who leave stop counting.
  // A vote everyone agreed to still passes if its target's own page saw that first and left
  // before this page heard about it; only a target who left mid-vote ends it as "gone".
  function voteOutcome(players, vote, now = Date.now()) {
    const ids = players.map((p) => p.id);
    const voters = ids.filter((id) => id !== vote.target);
    if (voters.length >= VOTE_MIN_PLAYERS - 1 && !voters.some((id) => vote.no.has(id)) && voters.every((id) => vote.yes.has(id))) return "pass";
    if (!ids.includes(vote.target)) return "gone";
    if (voters.length < VOTE_MIN_PLAYERS - 1) return "fail";
    if (voters.some((id) => vote.no.has(id))) return "fail";
    return now >= vote.endsAt ? "fail" : "open";
  }

  // Who carries out a kick once a vote passes: the longest-present player other than the one
  // voted out. Usually the host; the next in line when the host is the one voted out.
  function voteEnforcer(players, target) {
    const next = players.find((p) => p.id !== target);
    return next ? next.id : null;
  }

  // Lobbies this browser was kicked from, as { CODE: "YYYY-MM-DD" }. A kick lasts for that day.
  function wasKicked(kicks, code, day) {
    return Boolean(kicks && typeof kicks === "object" && kicks[code] === day);
  }
  function rememberKick(kicks, code, day) {
    const out = {};
    for (const [c, d] of Object.entries(kicks && typeof kicks === "object" ? kicks : {})) if (d === day) out[c] = d;
    out[code] = day;
    return out;
  }

  const pure = { MAX_PLAYERS, normalizeCode, codeFromSearch, lobbyLink, cleanName, randomName, playersFromState, isOverCap, activeGameOf, unwrap, VOTE_MS, VOTE_COOLDOWN_MS, VOTE_MIN_PLAYERS, mayKick, voteBlocker, voteOutcome, voteEnforcer, wasKicked, rememberKick };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  /* ---------- Browser side ---------- */
  const cfg = root.SCRAWDLE_SUPABASE || {};
  const games = new Map();
  let renderGames = () => {};

  // Games can register even when lobbies are switched off; they just never start.
  function registerGame(def) {
    if (!def || !GAME_ID_RE.test(def.id || "") || typeof def.title !== "string" || typeof def.start !== "function") {
      throw new Error("registerGame needs { id (lowercase letters, digits, dashes), title (string), start(ctx) (function) }");
    }
    games.set(def.id, { description: "", minPlayers: 1, ...def });
    renderGames();
  }
  root.ScrawdleLobby = { registerGame, MAX_PLAYERS };

  if (!cfg.url || !cfg.anonKey) return;
  if (!root.supabase || typeof root.supabase.createClient !== "function") {
    console.error("lobby.js: supabase-js didn't load (check the CDN <script> tag in index.html)");
    return;
  }
  const client = root.supabase.createClient(cfg.url, cfg.anonKey);

  const ID_KEY = "scrawdle-player-id";     // sessionStorage: one id per tab, so two tabs are two players
  const NAME_KEY = "scrawdle-player-name"; // localStorage: your name, kept between visits
  function storedId() {
    let id = null;
    try { id = sessionStorage.getItem(ID_KEY); } catch (err) { /* private mode */ }
    if (!id) {
      // randomUUID only exists on secure pages (https or localhost); a LAN test address has none.
      id = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      try { sessionStorage.setItem(ID_KEY, id); } catch (err) { /* private mode */ }
    }
    return id;
  }
  function storedName() {
    let name = "";
    try { name = cleanName(localStorage.getItem(NAME_KEY)); } catch (err) { /* private mode */ }
    if (!name) {
      name = randomName();
      try { localStorage.setItem(NAME_KEY, name); } catch (err) { /* private mode */ }
    }
    return name;
  }

  const JOIN_WINDOW_MS = 4000; // how long after arriving you can be dropped into a game already running
  const me = { id: storedId(), name: storedName() };
  const lobby = { code: null, channel: null, joinedAt: 0, players: [], game: null, cleanup: null, listeners: new Map(), watchers: new Set(), gameDef: null, ready: false,
    kicked: new Set(), passedVotes: new Set(), vote: null, voteTimer: 0, cooldowns: new Map(), rekickedAt: new Map() };

  // Lobbies this browser was kicked from today, so the same invite link can't put it back in.
  const KICKS_KEY = "scrawdle-lobby-kicks"; // localStorage: { CODE: "YYYY-MM-DD" }
  const today = () => { const d = new Date(); const pad = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const readKicks = () => { try { return JSON.parse(localStorage.getItem(KICKS_KEY) || "{}"); } catch (err) { return {}; } };
  const noteKicked = (code) => { try { localStorage.setItem(KICKS_KEY, JSON.stringify(rememberKick(readKicks(), code, today()))); } catch (err) { /* private mode */ } };
  const newId = () => (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

  /* ----- the screens ----- */
  const $ = (root_, sel) => root_.querySelector(sel);
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const room = el("dialog", "lobby");
  room.id = "lobby";
  room.setAttribute("aria-labelledby", "lobby-code");
  room.innerHTML = `
    <header class="app-header"><span class="wordmark">Scrawdle</span><button type="button" class="quiet" data-act="leave">Leave lobby</button></header>
    <div class="lobby-body">
      <p class="eyebrow">Private lobby</p>
      <h1 id="lobby-code" class="lobby-title">Invite your friends</h1>
      <div class="lobby-share">
        <div class="lobby-link-box">
          <input class="lobby-link" readonly aria-label="Invite link">
          <button type="button" class="lobby-copy" data-act="copy" aria-label="Copy link" title="Copy link"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg></button>
        </div>
        <div class="lobby-invite">
          <button type="button" class="btn primary" data-act="invite" aria-expanded="false" aria-haspopup="menu">Invite friends</button>
          <div class="lobby-invite-menu" role="menu" hidden>
            <a role="menuitem" data-invite="sms"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Text message</a>
            <a role="menuitem" data-invite="whatsapp" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/></svg>WhatsApp</a>
            <a role="menuitem" data-invite="email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>Email</a>
            <button type="button" role="menuitem" data-invite="copy"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg><span>Copy invite</span></button>
          </div>
        </div>
      </div>
      <p class="lobby-status" role="status"></p>
      <h2>Players <span class="lobby-count"></span></h2>
      <ul class="lobby-players"></ul>
      <div class="lobby-vote" role="status" hidden><p class="lobby-vote-text"></p><div class="lobby-vote-actions"><button type="button" class="btn" data-vote="yes">Yes, kick</button><button type="button" class="btn" data-vote="no">No</button></div></div>
      <label class="lobby-name">Your name <input maxlength="${NAME_MAX}" autocomplete="off" spellcheck="false"></label>
      <h2>Games</h2>
      <ul class="lobby-games"></ul>
      <p class="lobby-games-empty">No games here yet. Anyone you invite can join and see the player list.</p>
    </div>`;
  const stage = el("dialog", "lobby-stage");
  stage.id = "lobby-game";
  const stageRoot = el("div", "lobby-stage-root");
  // During a game the lobby room is hidden, so the host gets a small Players button on the game's
  // screen to kick someone from there.
  const stagePlayersBtn = el("button", "lobby-stage-players quiet", "Players");
  stagePlayersBtn.type = "button";
  stagePlayersBtn.setAttribute("aria-expanded", "false");
  stagePlayersBtn.hidden = true;
  const stageMenu = el("ul", "lobby-stage-menu");
  stageMenu.hidden = true;
  stageMenu.setAttribute("aria-label", "Players");
  stage.append(stageRoot, stagePlayersBtn, stageMenu);
  document.body.append(room, stage);
  for (const d of [room, stage]) d.addEventListener("cancel", (e) => e.preventDefault()); // Esc shouldn't drop you out
  // Browsers let a second Esc close a dialog anyway. If that happens mid-lobby, put it back.
  room.addEventListener("close", () => { if (lobby.code && !room.open) room.showModal(); });
  stage.addEventListener("close", () => { if (lobby.game && !stage.open) stage.showModal(); });

  const linkEl = $(room, ".lobby-link");
  const statusEl = $(room, ".lobby-status");
  const playersEl = $(room, ".lobby-players");
  const countEl = $(room, ".lobby-count");
  const nameEl = $(room, ".lobby-name input");
  const gamesEl = $(room, ".lobby-games");
  const gamesEmptyEl = $(room, ".lobby-games-empty");
  const copyBtn = $(room, '[data-act="copy"]');
  const voteEl = $(room, ".lobby-vote");
  const voteTextEl = $(room, ".lobby-vote-text");
  const voteActionsEl = $(room, ".lobby-vote-actions");

  const setStatus = (text) => { statusEl.textContent = text || ""; };
  const isHost = () => lobby.players.length > 0 && lobby.players[0].id === me.id;
  const nameOf = (id) => (lobby.players.find((p) => p.id === id) || {}).name || "A player";

  // Next to each other player: Kick for the host, Vote to kick for everyone else.
  function kickButton(p) {
    if (isHost()) {
      const b = el("button", "quiet lobby-kick", "Kick");
      b.type = "button";
      b.setAttribute("aria-label", `Kick ${p.name}`);
      b.addEventListener("click", () => hostKick(p.id));
      return b;
    }
    const b = el("button", "quiet lobby-kick", "Vote to kick");
    b.type = "button";
    b.setAttribute("aria-label", `Start a vote to kick ${p.name}`);
    const why = voteBlocker({ players: lobby.players, me: me.id, target: p.id, active: Boolean(lobby.vote), cooldownUntil: lobby.cooldowns.get(p.id) || 0, inGame: Boolean(lobby.game) });
    b.disabled = Boolean(why);
    if (why) b.title = why;
    b.addEventListener("click", () => callVote(p.id));
    return b;
  }

  function renderPlayers() {
    countEl.textContent = `${lobby.players.length} of ${MAX_PLAYERS}`;
    playersEl.replaceChildren(...lobby.players.map((p, i) => {
      const li = el("li");
      li.append(el("span", "lobby-player-name", p.name));
      if (p.id === me.id) li.append(el("span", "lobby-tag", "you"));
      if (i === 0) li.append(el("span", "lobby-tag host", "host"));
      if (p.id !== me.id && lobby.ready) li.append(kickButton(p));
      return li;
    }));
    renderStageMenu();
  }

  function renderStageMenu() {
    const show = Boolean(lobby.game) && isHost() && lobby.players.length > 1;
    stagePlayersBtn.hidden = !show;
    if (!show) { stageMenu.hidden = true; stagePlayersBtn.setAttribute("aria-expanded", "false"); }
    stageMenu.replaceChildren(...lobby.players.filter((p) => p.id !== me.id).map((p) => {
      const li = el("li");
      li.append(el("span", "lobby-player-name", p.name), kickButton(p));
      return li;
    }));
  }
  stagePlayersBtn.addEventListener("click", () => {
    stageMenu.hidden = !stageMenu.hidden;
    stagePlayersBtn.setAttribute("aria-expanded", String(!stageMenu.hidden));
  });

  /* ----- kicking ----- */
  function hostKick(target) {
    if (!isHost() || target === me.id) return;
    if (!confirm(`Kick ${nameOf(target)} from the lobby? They won't be able to rejoin it today.`)) return;
    lobby.kicked.add(target);
    send("lobby:kick", { target, by: me.id });
  }

  function beKicked(byVote) {
    const code = lobby.code;
    leave();
    if (code) noteKicked(code);
    homeError(byVote ? "You were voted out of that lobby." : "You were removed from that lobby.");
  }

  function onKick(message) {
    const body = unwrap(message) || {};
    if (!mayKick(lobby.players, body, lobby.passedVotes)) return;
    lobby.kicked.add(body.target);
    if (body.target === me.id) { beKicked(body.reason === "vote"); return; }
    if (body.reason !== "vote") setStatus(`${nameOf(body.target)} was removed from the lobby.`);
  }

  // Someone kicked earlier who shows up again (the same tab, after clearing what this browser
  // remembers) is kicked again by the host. Not more than once every few seconds per player.
  function rekickReturning() {
    if (!isHost()) return;
    for (const p of lobby.players) {
      if (p.id === me.id || !lobby.kicked.has(p.id) || Date.now() - (lobby.rekickedAt.get(p.id) || 0) < 5000) continue;
      lobby.rekickedAt.set(p.id, Date.now());
      send("lobby:kick", { target: p.id, by: me.id });
    }
  }

  /* ----- votes to kick ----- */
  function callVote(target) {
    const why = voteBlocker({ players: lobby.players, me: me.id, target, active: Boolean(lobby.vote), cooldownUntil: lobby.cooldowns.get(target) || 0, inGame: Boolean(lobby.game) });
    if (why) { setStatus(why); return; }
    if (!confirm(`Start a vote to kick ${nameOf(target)}? Everyone else in the lobby has to agree.`)) return;
    send("lobby:votekick", { id: newId(), target, by: me.id });
  }

  function onVoteKick(message) {
    const body = unwrap(message) || {};
    if (typeof body.id !== "string" || typeof body.target !== "string" || typeof body.by !== "string") return;
    const why = voteBlocker({ players: lobby.players, me: body.by, target: body.target, active: Boolean(lobby.vote), cooldownUntil: lobby.cooldowns.get(body.target) || 0, inGame: Boolean(lobby.game) });
    if (why) return;
    lobby.vote = { id: body.id, target: body.target, by: body.by, targetName: nameOf(body.target), byName: nameOf(body.by), yes: new Set([body.by]), no: new Set(), endsAt: Date.now() + VOTE_MS };
    clearInterval(lobby.voteTimer);
    lobby.voteTimer = setInterval(checkVote, 1000);
    setStatus("");
    renderPlayers();
    checkVote();
  }

  function castBallot(yes) {
    const v = lobby.vote;
    if (!v || v.target === me.id) return;
    send("lobby:ballot", { id: v.id, voter: me.id, yes });
  }

  function onBallot(message) {
    const body = unwrap(message) || {};
    const v = lobby.vote;
    if (!v || body.id !== v.id || typeof body.voter !== "string" || body.voter === v.target || typeof body.yes !== "boolean") return;
    v.yes.delete(body.voter);
    v.no.delete(body.voter);
    (body.yes ? v.yes : v.no).add(body.voter);
    checkVote();
  }

  // Every page works out the result from the same votes, so they all agree on it.
  function checkVote() {
    const v = lobby.vote;
    if (!v) return;
    const outcome = voteOutcome(lobby.players, v);
    if (outcome === "open") { renderVote(); return; }
    endVote();
    if (outcome === "pass") {
      lobby.passedVotes.add(`${v.id}|${v.target}`);
      lobby.kicked.add(v.target);
      if (v.target === me.id) { beKicked(true); return; }
      setStatus(`${v.targetName} was voted out of the lobby.`);
      if (voteEnforcer(lobby.players, v.target) === me.id) send("lobby:kick", { target: v.target, by: me.id, reason: "vote", voteId: v.id });
    } else if (outcome === "fail") {
      lobby.cooldowns.set(v.target, Date.now() + VOTE_COOLDOWN_MS);
      renderPlayers(); // again, now that the wait is set, so that player's Vote to kick button is off
      setTimeout(renderPlayers, VOTE_COOLDOWN_MS + 50); // and it comes back once the wait is over
      setStatus(v.target === me.id ? "The vote to kick you didn't pass." : `The vote to kick ${v.targetName} didn't pass.`);
    } else {
      setStatus(`${v.targetName} left, so the vote ended.`);
    }
  }

  function endVote() {
    clearInterval(lobby.voteTimer);
    lobby.voteTimer = 0;
    lobby.vote = null;
    renderVote();
    renderPlayers();
  }

  function renderVote() {
    const v = lobby.vote;
    voteEl.hidden = !v;
    if (!v) return;
    const left = Math.max(0, Math.ceil((v.endsAt - Date.now()) / 1000));
    const voters = lobby.players.filter((p) => p.id !== v.target);
    const agreed = voters.filter((p) => v.yes.has(p.id)).length;
    const tally = `${agreed} of ${voters.length} agree · ${left}s left`;
    const mine = v.yes.has(me.id) ? "yes" : v.no.has(me.id) ? "no" : null;
    if (v.target === me.id) voteTextEl.textContent = `${v.byName} started a vote to kick you. ${tally}.`;
    else if (v.by === me.id) voteTextEl.textContent = `You started a vote to kick ${v.targetName}. ${tally}.`;
    else voteTextEl.textContent = `${v.byName} wants to kick ${v.targetName}. Everyone else has to agree. ${tally}.`;
    voteActionsEl.hidden = v.target === me.id || v.by === me.id;
    for (const b of voteActionsEl.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.vote === mine));
  }
  for (const b of voteActionsEl.querySelectorAll("button")) b.addEventListener("click", () => castBallot(b.dataset.vote === "yes"));

  renderGames = function () {
    const list = [...games.values()];
    gamesEmptyEl.hidden = list.length > 0;
    gamesEl.replaceChildren(...list.map((game) => {
      const li = el("li");
      const text = el("span", "lobby-game-text");
      text.append(el("b", "", game.title));
      if (game.description) text.append(el("small", "", game.description));
      li.append(text);
      const short = lobby.players.length < game.minPlayers;
      if (isHost()) {
        const start = el("button", "btn", short ? `Needs ${game.minPlayers} players` : "Start");
        start.type = "button";
        start.disabled = short || !lobby.ready;
        start.addEventListener("click", () => send("lobby:start", { game: game.id }));
        li.append(start);
      } else {
        li.append(el("small", "lobby-wait", "The host starts games"));
      }
      return li;
    }));
  };

  /* ----- talking to the lobby's channel ----- */
  function send(event, payload) {
    if (!lobby.channel) return Promise.resolve();
    return lobby.channel.send({ type: "broadcast", event, payload });
  }
  const myMeta = () => ({ id: me.id, name: me.name, joinedAt: lobby.joinedAt, game: lobby.game });
  const track = () => (lobby.channel ? lobby.channel.track(myMeta()) : Promise.resolve());

  function onSync() {
    lobby.players = playersFromState(lobby.channel.presenceState());
    if (!lobby.players.some((p) => p.id === me.id)) return; // our own entry hasn't arrived yet
    if (isOverCap(lobby.players, me.id)) {
      leave();
      homeError(`That lobby is full (${MAX_PLAYERS} players).`);
      return;
    }
    lobby.ready = true;
    renderPlayers();
    renderGames();
    rekickReturning();
    checkVote(); // someone leaving can settle a vote
    for (const fn of lobby.watchers) fn(lobby.players.slice());
    // Joining while a game is already on drops you into it. That only counts for a few seconds
    // after arriving (the other players' entries can trickle in after your own), and stops as soon
    // as any game starts or ends here, so a stale entry can't pull someone back into a finished game.
    const running = activeGameOf(lobby.players);
    if (lobby.autoLaunch && Date.now() - lobby.joinedAt < JOIN_WINDOW_MS && running && !lobby.game && games.has(running)) launch(running);
  }

  function onStart(message) {
    const body = unwrap(message) || {};
    if (typeof body.game === "string") launch(body.game);
  }

  function onGameMessage(message) {
    const body = unwrap(message) || {};
    if (body.game !== lobby.game || typeof body.event !== "string") return;
    for (const fn of lobby.listeners.get(body.event) || []) fn(body.data, body.from);
  }

  function makeContext() {
    const gameId = lobby.game;
    const subscriptions = [];
    return {
      container: stageRoot,
      code: lobby.code,
      me: { id: me.id, name: me.name },
      players: () => lobby.players.map((p) => ({ ...p })),
      isHost,
      onPlayersChange(fn) {
        lobby.watchers.add(fn);
        const off = () => lobby.watchers.delete(fn);
        subscriptions.push(off);
        return off;
      },
      send: (event, data) => send("game", { game: gameId, event, data, from: me.id }),
      on(event, fn) {
        if (!lobby.listeners.has(event)) lobby.listeners.set(event, new Set());
        lobby.listeners.get(event).add(fn);
        const off = () => lobby.listeners.get(event) && lobby.listeners.get(event).delete(fn);
        subscriptions.push(off);
        return off;
      },
      end: () => send("lobby:end", {}),
      _unsubscribeAll: () => subscriptions.forEach((off) => off()),
    };
  }

  async function launch(gameId) {
    const game = games.get(gameId);
    if (!game || lobby.game) return; // unknown game, or one is already running
    lobby.autoLaunch = false;
    lobby.game = gameId;
    lobby.gameDef = game;
    // Votes to kick happen in the lobby room, which the game covers, so one in progress stops here.
    if (lobby.vote) { endVote(); setStatus("The vote to kick was called off because a game started."); }
    renderPlayers();
    stageRoot.replaceChildren();
    if (!stage.open) stage.showModal();
    track();
    const context = makeContext();
    lobby.context = context;
    try {
      const cleanup = await game.start(context);
      lobby.cleanup = typeof cleanup === "function" ? cleanup : null;
    } catch (err) {
      console.error(`lobby.js: game "${gameId}" failed to start`, err);
      setStatus(`${game.title} couldn't start. Try again, or refresh the page.`);
      send("lobby:end", {});
    }
  }

  function stopGame() {
    lobby.autoLaunch = false;
    if (!lobby.game) return;
    try { if (lobby.cleanup) lobby.cleanup(); } catch (err) { console.error("lobby.js: game cleanup failed", err); }
    if (lobby.context) lobby.context._unsubscribeAll();
    lobby.cleanup = null;
    lobby.context = null;
    lobby.game = null;
    lobby.gameDef = null;
    lobby.listeners.clear();
    lobby.watchers.clear();
    stageRoot.replaceChildren();
    if (stage.open) stage.close();
    track();
    renderPlayers();
    renderGames();
  }

  /* ----- entering and leaving ----- */
  function enter(code) {
    if (lobby.code) leave();
    lobby.code = code;
    lobby.joinedAt = Date.now();
    lobby.players = [];
    lobby.ready = false;
    lobby.autoLaunch = true;
    lobby.kicked = new Set();
    lobby.passedVotes = new Set();
    lobby.cooldowns = new Map();
    lobby.rekickedAt = new Map();
    linkEl.value = lobbyLink(location.origin, location.pathname, code);
    nameEl.value = me.name;
    setStatus("Connecting…");
    showCopied(false);
    renderPlayers();
    renderGames();
    history.replaceState(null, "", `${location.pathname}?${code}`);

    const channel = client.channel(`lobby-${code}`, { config: { presence: { key: me.id }, broadcast: { self: true } } });
    lobby.channel = channel;
    // Events can still arrive from a channel we've already left (untracking fires one more sync),
    // so every handler checks this is still the lobby we're in.
    const live = (fn) => (...args) => { if (lobby.channel === channel) fn(...args); };
    channel.on("presence", { event: "sync" }, live(onSync));
    channel.on("broadcast", { event: "lobby:start" }, live(onStart));
    channel.on("broadcast", { event: "lobby:end" }, live(stopGame));
    channel.on("broadcast", { event: "game" }, live(onGameMessage));
    channel.on("broadcast", { event: "lobby:kick" }, live(onKick));
    channel.on("broadcast", { event: "lobby:votekick" }, live(onVoteKick));
    channel.on("broadcast", { event: "lobby:ballot" }, live(onBallot));
    channel.subscribe(async (status) => {
      if (lobby.channel !== channel) return;
      if (status === "SUBSCRIBED") {
        setStatus("");
        await track();
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setStatus("Connection trouble. Trying to reconnect…");
      }
    });
    if (!room.open) room.showModal();
  }

  function leave() {
    stopGame();
    if (lobby.vote) endVote();
    setStatus("");
    const channel = lobby.channel;
    lobby.channel = null;
    lobby.code = null;
    lobby.players = [];
    lobby.ready = false;
    if (channel) {
      Promise.resolve(channel.untrack()).catch(() => {});
      client.removeChannel(channel);
    }
    if (room.open) room.close();
    history.replaceState(null, "", location.pathname);
  }

  /* ----- the home screen's Lobby card ----- */
  const card = el("section", "home-choice lobby-card");
  card.innerHTML = `
    <h2>Lobby</h2>
    <p>Make a private room, then invite friends with a link.</p>
    <button type="button" class="btn primary" data-act="create">Create Lobby</button>
    <p class="lobby-error" role="alert" hidden></p>`;
  const createBtn = $(card, '[data-act="create"]');
  const errorEl = $(card, ".lobby-error");

  function homeError(text) {
    errorEl.textContent = text || "";
    errorEl.hidden = !text;
  }
  function busy(on) {
    createBtn.disabled = on;
  }

  async function createLobby() {
    homeError("");
    busy(true);
    try {
      const { data, error } = await client.rpc("create_lobby");
      const code = normalizeCode(data);
      if (error || !code) throw error || new Error("no code returned");
      enter(code);
    } catch (err) {
      console.error("lobby.js: create_lobby failed", err);
      homeError("Couldn't make a lobby. Check your connection and try again.");
    } finally {
      busy(false);
    }
  }

  async function joinLobby(raw) {
    homeError("");
    const code = normalizeCode(raw);
    if (!code) { homeError("Lobby codes are 5 letters, like BCDFG."); return false; }
    if (wasKicked(readKicks(), code, today())) { homeError("You were removed from that lobby, so you can't rejoin it today."); return false; }
    busy(true);
    try {
      const { data, error } = await client.rpc("lobby_exists", { lobby_code: code });
      if (error) throw error;
      if (!data) { homeError("No lobby has that code. Check the letters and try again."); return false; }
      enter(code);
      return true;
    } catch (err) {
      console.error("lobby.js: lobby_exists failed", err);
      homeError("Couldn't check that code. Check your connection and try again.");
      return false;
    } finally {
      busy(false);
    }
  }

  createBtn.addEventListener("click", createLobby);

  $(room, '[data-act="leave"]').addEventListener("click", leave);
  // A copy icon at the end of the link box, like GitHub's. It turns into a check for a moment once copied.
  const COPY_ICON = copyBtn.innerHTML;
  const CHECK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  let copiedTimer = 0;
  function showCopied(on, label = "Copied!") {
    clearTimeout(copiedTimer);
    copyBtn.innerHTML = on ? CHECK_ICON : COPY_ICON;
    copyBtn.classList.toggle("copied", on);
    copyBtn.title = on ? label : "Copy link";
    copyBtn.setAttribute("aria-label", on ? label : "Copy link");
    if (on) copiedTimer = setTimeout(() => showCopied(false), 2000);
  }
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(linkEl.value);
      showCopied(true);
    } catch (err) {
      linkEl.select();
      showCopied(true, "Press Ctrl+C to copy");
    }
  });
  linkEl.addEventListener("focus", () => linkEl.select());
  // Invite friends, with the invite already written. Where the browser has a share menu (phones, and
  // some laptop browsers), it opens that, so a friend can be picked in Messages, WhatsApp, and so on.
  // Elsewhere it opens a small menu of its own: a text message, WhatsApp, email, or copying the invite.
  // No phone numbers or addresses ever reach the game; the player's own apps handle who it goes to.
  const inviteBtn = $(room, '[data-act="invite"]');
  const inviteMenu = $(room, ".lobby-invite-menu");
  const inviteText = () => `Join my Scrawdle lobby! ${linkEl.value}`; // the link is enough; no code to type
  // A small pop-up under the button. It closes when an option is picked, on a click outside it, or on Esc.
  const showInviteMenu = (open) => {
    inviteMenu.hidden = !open;
    inviteBtn.setAttribute("aria-expanded", String(open));
    if (open) inviteMenu.querySelector("[role=menuitem]").focus();
  };
  document.addEventListener("pointerdown", (e) => {
    if (!inviteMenu.hidden && !e.target.closest(".lobby-invite")) showInviteMenu(false);
  });
  room.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !inviteMenu.hidden) { showInviteMenu(false); inviteBtn.focus(); }
  });
  for (const link of inviteMenu.querySelectorAll("a")) link.addEventListener("click", () => setTimeout(() => showInviteMenu(false), 0));
  inviteBtn.addEventListener("click", async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Join my Scrawdle lobby", text: "Join my Scrawdle lobby!", url: linkEl.value });
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // they closed the share menu
      }
    }
    const text = encodeURIComponent(inviteText());
    $(inviteMenu, '[data-invite="sms"]').href = `sms:?&body=${text}`; // "?&" works on both iPhone and Android
    $(inviteMenu, '[data-invite="whatsapp"]').href = `https://wa.me/?text=${text}`;
    $(inviteMenu, '[data-invite="email"]').href = `mailto:?subject=${encodeURIComponent("Join my Scrawdle lobby")}&body=${text}`;
    showInviteMenu(inviteMenu.hidden);
  });
  const copyInviteBtn = $(inviteMenu, '[data-invite="copy"]');
  const copyInviteLabel = $(copyInviteBtn, "span");
  copyInviteBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(inviteText());
      copyInviteLabel.textContent = "Copied!";
      setTimeout(() => { showInviteMenu(false); copyInviteLabel.textContent = "Copy invite"; }, 700);
    } catch (err) {
      linkEl.select();
      copyInviteLabel.textContent = "Press Ctrl+C";
    }
  });
  room.addEventListener("close", () => { inviteMenu.hidden = true; inviteBtn.setAttribute("aria-expanded", "false"); copyInviteLabel.textContent = "Copy invite"; });
  nameEl.addEventListener("change", () => {
    const name = cleanName(nameEl.value) || me.name;
    nameEl.value = name;
    if (name === me.name) return;
    me.name = name;
    try { localStorage.setItem(NAME_KEY, name); } catch (err) { /* private mode */ }
    track(); // Supabase allows only a few presence updates every 30 seconds, so this is on change, not each keystroke
  });
  window.addEventListener("pagehide", () => { if (lobby.channel) client.removeChannel(lobby.channel); });

  const slot = document.querySelector(".home-actions") || document.querySelector("#setup .home-body") || document.getElementById("setup");
  if (slot) slot.append(card);

  // A link like /?BCDFG goes straight into that lobby.
  const linked = codeFromSearch(location.search);
  if (linked) {
    joinLobby(linked).then((joined) => {
      if (!joined) history.replaceState(null, "", location.pathname);
    });
  }
})(typeof window !== "undefined" ? window : globalThis);
