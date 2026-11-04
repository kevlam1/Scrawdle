const test = require("node:test");
const assert = require("node:assert/strict");

let mod;
test.before(async () => {
  mod = await import("../backend/supabase/functions/purge-old-drawings/index.ts");
});

// A fake Supabase client: `files` is a list of full object paths, `rows` a list of { id, day }.
function fakeClient({ files, rows, removeError, listError }) {
  const state = { files: [...files], rows: [...rows], removeCalls: [] };
  const client = {
    state,
    storage: {
      from: () => ({
        async list(path, { limit, offset }) {
          if (listError) return { data: null, error: { message: listError } };
          const prefix = path === "" ? "" : path + "/";
          const names = new Set();
          for (const f of state.files) {
            if (!f.startsWith(prefix)) continue;
            names.add(f.slice(prefix.length).split("/")[0]);
          }
          const all = [...names].sort().map((name) => ({ name }));
          return { data: all.slice(offset, offset + limit), error: null };
        },
        async remove(paths) {
          state.removeCalls.push(paths.length);
          if (removeError) return { data: null, error: { message: removeError } };
          state.files = state.files.filter((f) => !paths.includes(f));
          return { data: paths.map((name) => ({ name })), error: null };
        },
      }),
    },
    from: () => ({
      select: () => ({
        lt: async (_col, day) => ({ data: state.rows.filter((r) => r.day < day), error: null }),
      }),
      delete: () => ({
        lt: (_col, day) => ({
          select: async () => {
            const gone = state.rows.filter((r) => r.day < day);
            state.rows = state.rows.filter((r) => r.day >= day);
            return { data: gone, error: null };
          },
        }),
      }),
    }),
  };
  return client;
}

const NOW = new Date("2026-11-05T10:00:00Z"); // cutoff is 2026-11-04: keep Nov 4 and later

test("cutoff is yesterday by UTC date", () => {
  assert.equal(mod.cutoffDay(NOW), "2026-11-04");
  assert.equal(mod.cutoffDay(new Date("2026-11-05T00:00:00Z")), "2026-11-04");
  assert.equal(mod.cutoffDay(new Date("2026-11-04T23:59:59Z")), "2026-11-03");
});

test("cutoff handles month and year boundaries", () => {
  assert.equal(mod.cutoffDay(new Date("2026-12-01T05:00:00Z")), "2026-11-30");
  assert.equal(mod.cutoffDay(new Date("2027-01-01T05:00:00Z")), "2026-12-31");
});

test("deletes files and rows older than the cutoff, keeps the rest", async () => {
  const client = fakeClient({
    files: [
      "2026-11-02/basic/a.png",
      "2026-11-03/detailed/b.png",
      "2026-11-04/basic/c.png",
      "2026-11-05/basic/d.png",
    ],
    rows: [
      { id: 1, day: "2026-11-02" },
      { id: 2, day: "2026-11-03" },
      { id: 3, day: "2026-11-04" },
      { id: 4, day: "2026-11-05" },
    ],
  });
  const result = await mod.purge(client, { now: NOW });
  assert.deepEqual(result.oldDays, ["2026-11-02", "2026-11-03"]);
  assert.equal(result.filesDeleted, 2);
  assert.equal(result.rows, 2);
  assert.deepEqual(client.state.files, ["2026-11-04/basic/c.png", "2026-11-05/basic/d.png"]);
  assert.deepEqual(client.state.rows.map((r) => r.id), [3, 4]);
});

test("a dry run reports what it would delete and deletes nothing", async () => {
  const client = fakeClient({
    files: ["2026-11-02/basic/a.png", "2026-11-05/basic/d.png"],
    rows: [{ id: 1, day: "2026-11-02" }],
  });
  const result = await mod.purge(client, { now: NOW, dryRun: true });
  assert.equal(result.dryRun, true);
  assert.equal(result.filesFound, 1);
  assert.equal(result.filesDeleted, 0);
  assert.equal(result.rows, 1);
  assert.equal(client.state.files.length, 2);
  assert.equal(client.state.rows.length, 1);
});

test("folders that aren't day folders are never touched", async () => {
  const client = fakeClient({
    files: ["notes/a.png", "2026-11-0/basic/b.png", "readme.txt", "2026-11-01/basic/c.png"],
    rows: [],
  });
  const result = await mod.purge(client, { now: NOW });
  assert.deepEqual(result.oldDays, ["2026-11-01"]);
  assert.deepEqual(client.state.files.sort(), ["2026-11-0/basic/b.png", "notes/a.png", "readme.txt"]);
});

test("files with no database row (a failed publish) are still removed", async () => {
  const client = fakeClient({ files: ["2026-11-01/basic/orphan.png"], rows: [] });
  const result = await mod.purge(client, { now: NOW });
  assert.equal(result.filesDeleted, 1);
  assert.equal(client.state.files.length, 0);
});

test("a storage error stops before any row is deleted, so tomorrow retries", async () => {
  const client = fakeClient({
    files: ["2026-11-01/basic/a.png"],
    rows: [{ id: 1, day: "2026-11-01" }],
    removeError: "boom",
  });
  await assert.rejects(() => mod.purge(client, { now: NOW }), /remove: boom/);
  assert.equal(client.state.rows.length, 1);
});

test("a list error is reported, not swallowed", async () => {
  const client = fakeClient({ files: [], rows: [], listError: "no access" });
  await assert.rejects(() => mod.purge(client, { now: NOW }), /no access/);
});

test("more than 1000 files are removed in batches of at most 1000", async () => {
  const files = [];
  for (let i = 0; i < 2500; i++) files.push(`2026-11-01/basic/f${String(i).padStart(4, "0")}.png`);
  const client = fakeClient({ files, rows: [] });
  const result = await mod.purge(client, { now: NOW });
  assert.equal(result.filesFound, 2500);
  assert.equal(result.filesDeleted, 2500);
  assert.deepEqual(client.state.removeCalls, [1000, 1000, 500]);
  assert.equal(client.state.files.length, 0);
});
