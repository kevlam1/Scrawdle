// Run with: node --test tests/yesterday-winners.test.js
// Loads the real frontend/publish.js against a stand-in for Supabase and checks what
// scrawdleYesterdayWinners asks the database for and what it hands the page.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

function load({ rows = {}, error = null, published = {} } = {}) {
  const calls = [];
  const file = path.join(__dirname, "../frontend/publish.js");
  delete require.cache[require.resolve(file)];
  const store = new Map([["scrawdle-published", JSON.stringify(published)]]);
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  globalThis.SCRAWDLE_SUPABASE = { url: "https://example.test", anonKey: "test" };
  globalThis.ScrawdleVotes = require("../frontend/votes.js");
  globalThis.supabase = {
    createClient: () => ({
      rpc: async (name, args) => {
        calls.push({ name, args });
        if (error) return { data: null, error };
        return { data: rows[args.modes.join(",")] || [], error: null };
      },
      storage: { from: () => ({ getPublicUrl: (p) => ({ data: { publicUrl: `https://example.test/${p}` } }) }) },
      from: () => ({}),
    }),
  };
  require(file);
  return { winners: globalThis.scrawdleYesterdayWinners, calls };
}

const localDay = (back) => { const d = new Date(); d.setDate(d.getDate() - back); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const row = (id, mode, up, down = 0) => ({ id, mode, image_path: `${id}.png`, prompts: [{ label: "Head", value: "Cat" }], up, down });

test("it asks for yesterday by the player's local date, once for each list", async () => {
  const { winners, calls } = load();
  const out = await winners();
  assert.equal(out.day, localDay(1));
  assert.deepEqual(calls.map((c) => [c.name, c.args.target_day, c.args.modes, c.args.max_count]), [
    ["top_drawings", localDay(1), ["daily", "basic", "detailed"], 3],
    ["top_drawings", localDay(1), ["scrawl"], 3],
  ]);
  assert.deepEqual(out.daily, []);
  assert.deepEqual(out.free, []);
});

test("winners come back as cards with a picture address, their parts, votes, and whether they're yours", async () => {
  const { winners } = load({
    rows: { "daily,basic,detailed": [row("a", "daily", 5, 1), row("b", "basic", 5, 1)], scrawl: [row("c", "scrawl", 2)] },
    published: { "2026-11-06|scrawl": "c" },
  });
  const out = await winners();
  assert.deepEqual(out.daily.map((c) => [c.id, c.imageUrl, c.votes, c.mine]), [
    ["a", "https://example.test/a.png", { up: 5, down: 1 }, false],
    ["b", "https://example.test/b.png", { up: 5, down: 1 }, false],
  ]);
  assert.deepEqual(out.free.map((c) => [c.id, c.mine]), [["c", true]]);
  assert.deepEqual(out.daily[0].prompts, [{ label: "Head", value: "Cat" }]);
});

test("before the database has update 005, it returns null so the page shows nothing", async () => {
  const errors = console.error;
  console.error = () => {};
  try {
    const { winners } = load({ error: { message: "function public.top_drawings does not exist" } });
    assert.equal(await winners(), null);
  } finally {
    console.error = errors;
  }
});
