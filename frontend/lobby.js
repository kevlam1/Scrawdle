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

  const pure = { MAX_PLAYERS, normalizeCode, codeFromSearch, lobbyLink, cleanName, randomName, playersFromState, isOverCap, activeGameOf, unwrap };
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
  const lobby = { code: null, channel: null, joinedAt: 0, players: [], game: null, cleanup: null, listeners: new Map(), watchers: new Set(), gameDef: null, ready: false };

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
        <input class="lobby-link" readonly aria-label="Invite link">
        <button type="button" class="btn primary" data-act="invite" aria-expanded="false">Invite friends</button>
        <button type="button" class="btn" data-act="copy">Copy link</button>
      </div>
      <div class="lobby-invite-menu" hidden>
        <a class="btn" data-invite="sms">Text message</a>
        <a class="btn" data-invite="whatsapp" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn" data-invite="email">Email</a>
        <button type="button" class="btn" data-invite="copy">Copy invite</button>
      </div>
      <p class="lobby-status" role="status"></p>
      <h2>Players <span class="lobby-count"></span></h2>
      <ul class="lobby-players"></ul>
      <label class="lobby-name">Your name <input maxlength="${NAME_MAX}" autocomplete="off" spellcheck="false"></label>
      <h2>Games</h2>
      <ul class="lobby-games"></ul>
      <p class="lobby-games-empty">No games here yet. Anyone you invite can join and see the player list.</p>
    </div>`;
  const stage = el("dialog", "lobby-stage");
  stage.id = "lobby-game";
  const stageRoot = el("div", "lobby-stage-root");
  stage.append(stageRoot);
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

  const setStatus = (text) => { statusEl.textContent = text || ""; };
  const isHost = () => lobby.players.length > 0 && lobby.players[0].id === me.id;

  function renderPlayers() {
    countEl.textContent = `${lobby.players.length} of ${MAX_PLAYERS}`;
    playersEl.replaceChildren(...lobby.players.map((p, i) => {
      const li = el("li");
      li.append(el("span", "lobby-player-name", p.name));
      if (p.id === me.id) li.append(el("span", "lobby-tag", "you"));
      if (i === 0) li.append(el("span", "lobby-tag host", "host"));
      return li;
    }));
  }

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
    linkEl.value = lobbyLink(location.origin, location.pathname, code);
    nameEl.value = me.name;
    setStatus("Connecting…");
    copyBtn.textContent = "Copy link";
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
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(linkEl.value);
      copyBtn.textContent = "Copied!";
    } catch (err) {
      linkEl.select();
      copyBtn.textContent = "Press Ctrl+C";
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
  const showInviteMenu = (open) => {
    inviteMenu.hidden = !open;
    inviteBtn.setAttribute("aria-expanded", String(open));
  };
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
  copyInviteBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(inviteText());
      copyInviteBtn.textContent = "Copied!";
    } catch (err) {
      linkEl.select();
      copyInviteBtn.textContent = "Press Ctrl+C";
    }
  });
  room.addEventListener("close", () => { showInviteMenu(false); copyInviteBtn.textContent = "Copy invite"; });
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
