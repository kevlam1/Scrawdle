// Run with: node --test tests/publish-votes.test.js
// Loads the real frontend/publish.js against an in-memory stand-in for Supabase, so publishing,
// the gallery's vote counts, and voting can be checked without touching the live project.
// The stand-in's cast_vote and vote_counts copy what backend/supabase/updates/002-votes.sql does;
// this checks the frontend's wiring, not the SQL itself.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

function fakeSupabase({ votingReady = true } = {}) {
  const db = { drawings: [], votes: new Map(), uploads: [] };
  const query = (rows) => {
    const q = {
      filters: [],
      select() { return q; },
      eq(col, val) { q.filters.push((r) => r[col] === val); return q; },
      in(col, vals) { q.filters.push((r) => vals.includes(r[col])); return q; },
      order() { return q; },
      limit(n) { q.n = n; return q; },
      then(resolve) {
        const data = rows().filter((r) => q.filters.every((f) => f(r))).reverse().slice(0, q.n || Infinity);
        resolve({ data, error: null });
      },
    };
    return q;
  };
  const client = {
    from(table) {
      return {
        select: (...a) => query(() => db[table]).select(...a),
        insert: async (row) => { db[table].push({ ...row }); return { error: null }; },
      };
    },
    storage: {
      from: () => ({
        upload: async (p) => { db.uploads.push(p); return { error: null }; },
        getPublicUrl: (p) => ({ data: { publicUrl: `https://example.test/${p}` } }),
      }),
    },
    async rpc(name, args) {
      if (!votingReady) return { data: null, error: { message: `function ${name} does not exist` } };
      if (name === "cast_vote") {
        if (!db.drawings.some((d) => d.id === args.target_drawing)) return { data: null, error: { message: "that drawing is not open for votes" } };
        const key = `${args.target_drawing}|${args.voter}`;
        if (args.vote === 0) db.votes.delete(key); else db.votes.set(key, args.vote);
        return { data: null, error: null };
      }
      if (name === "vote_counts") {
        const data = args.drawing_ids.map((id) => {
          const mine = [...db.votes].filter(([k]) => k.startsWith(`${id}|`));
          return {
            drawing_id: id,
            up: mine.filter(([, v]) => v === 1).length,
            down: mine.filter(([, v]) => v === -1).length,
            my_vote: db.votes.get(`${id}|${args.voter}`) || 0,
          };
        });
        return { data, error: null };
      }
      throw new Error(`unexpected rpc ${name}`);
    },
  };
  return { db, client };
}

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

// Loads publish.js as one player in one browser.
function player(client) {
  const file = path.join(__dirname, "../frontend/publish.js");
  delete require.cache[require.resolve(file)];
  globalThis.SCRAWDLE_SUPABASE = { url: "https://example.test", anonKey: "test" };
  globalThis.supabase = { createClient: () => client };
  globalThis.localStorage = fakeStorage();
  globalThis.ScrawdleVotes = require("../frontend/votes.js");
  delete globalThis.scrawdlePublish; delete globalThis.scrawdleGallery; delete globalThis.scrawdleVote; delete globalThis.scrawdleHasPosted; delete globalThis.scrawdlePublicGallery;
  require(file);
  const p = { publish: globalThis.scrawdlePublish, gallery: globalThis.scrawdleGallery, vote: globalThis.scrawdleVote, hasPosted: globalThis.scrawdleHasPosted, publicGallery: globalThis.scrawdlePublicGallery };
  const storage = globalThis.localStorage;
  // Each player keeps their own browser storage.
  return Object.fromEntries(Object.entries(p).map(([k, fn]) => [k, (...a) => { globalThis.localStorage = storage; return fn(...a); }]));
}

const round = { day: "2026-11-05", mode: "basic", prompts: [{ key: "head", label: "Head", value: "Cat", optional: false }] };
const blob = { size: 1 };

test("a published drawing shows as yours to its player, and as someone else's to everyone else", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  const ben = player(client);
  await ana.publish({ blob, ...round });
  assert.equal(db.drawings.length, 1);
  const id = db.drawings[0].id;
  assert.match(id, /^[0-9a-f-]{36}$/);
  assert.equal(db.drawings[0].image_path, `2026-11-05/basic/${id}.png`, "the file is named after the drawing's id");

  const anaView = await ana.gallery(round);
  assert.deepEqual(anaView.map((c) => [c.id, c.mine, c.votes]), [[id, true, { up: 0, down: 0, mine: 0 }]]);

  const benView = await ben.gallery(round);
  assert.deepEqual(benView.map((c) => [c.id, c.mine, c.votes]), [[id, false, { up: 0, down: 0, mine: 0 }]]);
});

test("one thumbs up from someone else is a win, and each player's own vote comes back", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  const ben = player(client);
  const cal = player(client);
  await ana.publish({ blob, ...round });
  const id = db.drawings[0].id;

  await ben.vote({ drawingId: id, value: 1 });
  await cal.vote({ drawingId: id, value: -1 });
  const mine = (await ana.gallery(round)).find((c) => c.mine);
  assert.deepEqual(mine.votes, { up: 1, down: 1, mine: 0 });
  assert.equal(globalThis.ScrawdleVotes.isWin(mine.votes), true);
  assert.deepEqual((await ben.gallery(round))[0].votes, { up: 1, down: 1, mine: 1 });
  assert.deepEqual((await cal.gallery(round))[0].votes, { up: 1, down: 1, mine: -1 });

  // Voting again changes the vote instead of adding one, and 0 takes it back.
  await ben.vote({ drawingId: id, value: -1 });
  assert.deepEqual((await ana.gallery(round))[0].votes, { up: 0, down: 2, mine: 0 });
  await ben.vote({ drawingId: id, value: 0 });
  assert.deepEqual((await ana.gallery(round))[0].votes, { up: 0, down: 1, mine: 0 });
});

test("your drawing still reports its votes when it's older than the 24 the gallery shows", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  const ben = player(client);
  await ana.publish({ blob, ...round });
  const id = db.drawings[0].id;
  await ben.vote({ drawingId: id, value: 1 });
  for (let i = 0; i < 30; i++) await player(client).publish({ blob, ...round });

  const view = await ana.gallery(round);
  assert.equal(view.filter((c) => !c.mine).length, 24);
  const mine = view.filter((c) => c.mine);
  assert.equal(mine.length, 1);
  assert.equal(mine[0].id, id);
  assert.deepEqual(mine[0].votes, { up: 1, down: 0, mine: 0 });
});

test("a player can only publish once per day and mode", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  await ana.publish({ blob, ...round });
  await assert.rejects(ana.publish({ blob, ...round }), (err) => err.alreadyPublished === true);
  await ana.publish({ blob, ...round, mode: "detailed" });
  assert.equal(db.drawings.length, 2);
});

test("before the database has update 002, the gallery still loads, just without votes", async () => {
  const { client } = fakeSupabase({ votingReady: false });
  const ana = player(client);
  const ben = player(client);
  const errors = console.error;
  console.error = () => {};
  try {
    await ana.publish({ blob, ...round });
    const view = await ben.gallery(round);
    assert.equal(view.length, 1);
    assert.equal(view[0].votes, null);
    await assert.rejects(ben.vote({ drawingId: view[0].id, value: 1 }), (err) => err.userMessage === "Couldn't save your vote. Try again.");
  } finally {
    console.error = errors;
  }
});

test("a drawing published before votes existed doesn't break the gallery", async () => {
  const { client } = fakeSupabase();
  const ana = player(client);
  globalThis.localStorage.setItem("scrawdle-published", JSON.stringify({ "2026-11-05|basic": true }));
  const view = await ana.gallery(round);
  assert.deepEqual(view, []);
  await assert.rejects(ana.publish({ blob, ...round }), (err) => err.alreadyPublished === true);
});

test("each browser keeps one voter id", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  const ben = player(client);
  await ana.publish({ blob, ...round });
  const id = db.drawings[0].id;
  await ben.vote({ drawingId: id, value: 1 });
  await ben.vote({ drawingId: id, value: 1 });
  assert.equal(db.votes.size, 1, "the same browser voting twice is still one vote");
});

// The Public drawings page. Daily Scrawl's bubble unlocks on scrawdleHasPosted; scrawdlePublicGallery loads the lot.
const todayLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

test("Daily Scrawl is unlocked only after this browser posts one today", async () => {
  const { client } = fakeSupabase();
  const ana = player(client);
  const day = todayLocal();
  assert.equal(ana.hasPosted(), false, "nothing posted yet");
  await ana.publish({ blob, day, mode: "scrawl", prompts: round.prompts });
  assert.equal(ana.hasPosted(), false, "Daily Free Play doesn't unlock it");
  await ana.publish({ blob, day: "2020-01-01", mode: "daily", prompts: round.prompts });
  assert.equal(ana.hasPosted(), false, "a Daily Scrawl from another day doesn't either");
  await ana.publish({ blob, day, mode: "daily", prompts: round.prompts });
  assert.equal(ana.hasPosted(), true);
});

test("a drawing posted as the older Basic or Detailed today still unlocks Daily Scrawl", async () => {
  const { client } = fakeSupabase();
  const ana = player(client);
  await ana.publish({ blob, day: todayLocal(), mode: "detailed", prompts: round.prompts });
  assert.equal(ana.hasPosted(), true);
});

test("the public gallery returns every drawing in the asked-for modes and marks the player's own", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  const ben = player(client);
  const day = todayLocal();
  await ana.publish({ blob, day, mode: "daily", prompts: round.prompts });
  await ben.publish({ blob, day, mode: "daily", prompts: round.prompts });
  await ben.publish({ blob, day, mode: "scrawl", prompts: round.prompts });
  assert.equal(db.drawings.length, 3);

  const all = await ana.publicGallery({ modes: ["daily", "basic", "detailed", "scrawl"] });
  assert.equal(all.length, 3);
  assert.deepEqual(all.map((c) => c.mine).sort(), [false, false, true], "only Ana's own is marked mine");
  assert.ok(all.every((c) => c.imageUrl && c.votes), "every card has a picture and vote counts");

  const free = await ana.publicGallery({ modes: ["scrawl"] });
  assert.deepEqual(free.map((c) => c.mode), ["scrawl"], "Daily Scrawl drawings stay out when only Daily Free Play is asked for");
});

test("the public gallery says so when it can't load, instead of showing an empty page", async () => {
  const { client } = fakeSupabase();
  const ana = player(client);
  client.from = () => ({ select: () => ({ in: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: null, error: { message: "boom" } }) }) }) }) }) });
  await assert.rejects(ana.publicGallery({ modes: ["scrawl"] }), /boom/);
});

test("the public gallery shows only today's drawings, for Daily Scrawl and Daily Free Play alike", async () => {
  const { db, client } = fakeSupabase();
  const ana = player(client);
  const day = todayLocal();
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); const pad = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })();
  // Rows as the database would hold them: one from today and one from yesterday in each mode.
  const row = (id, mode, rowDay) => ({ id, day: rowDay, mode, prompts: round.prompts, image_path: `${rowDay}/${mode}/${id}.png` });
  db.drawings.push(row("daily-new", "daily", day), row("daily-old", "daily", yesterday));
  db.drawings.push(row("free-new", "scrawl", day), row("free-old", "scrawl", yesterday));

  const all = await ana.publicGallery({ modes: ["daily", "basic", "detailed", "scrawl"] });
  assert.deepEqual(all.map((c) => c.id).sort(), ["daily-new", "free-new"], "yesterday's drawings are left out");
  const free = await ana.publicGallery({ modes: ["scrawl"] });
  assert.deepEqual(free.map((c) => c.id), ["free-new"]);
});
