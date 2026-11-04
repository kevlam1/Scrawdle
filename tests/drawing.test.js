// Run with: node --test tests/drawing.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { floodFill, History, dayKey, slotOf } = require("../frontend/drawing.js");
const { dailyIndex } = require("../frontend/daily.js");

function image(w, h, rgba = [255, 255, 255, 255]) {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < px.length; i += 4) px.set(rgba, i);
  return px;
}
const get = (px, w, x, y) => Array.from(px.subarray((x + y * w) * 4, (x + y * w) * 4 + 4));
function box(px, w, x0, y0, x1, y1, rgba) { // hollow rectangle
  for (let x = x0; x <= x1; x++) { px.set(rgba, (x + y0 * w) * 4); px.set(rgba, (x + y1 * w) * 4); }
  for (let y = y0; y <= y1; y++) { px.set(rgba, (x0 + y * w) * 4); px.set(rgba, (x1 + y * w) * 4); }
}
const INK = [0, 0, 0, 255], RED = [255, 0, 0, 255], WHITE = [255, 255, 255, 255];

test("bucket fills inside a closed shape and stays inside it", () => {
  const px = image(50, 50);
  box(px, 50, 10, 10, 30, 30, INK);
  const rect = floodFill(px, 50, 50, 20, 20, RED, 40);
  assert.deepEqual(get(px, 50, 20, 20), RED);
  assert.deepEqual(get(px, 50, 11, 11), RED);
  assert.deepEqual(get(px, 50, 40, 40), WHITE, "outside stays white");
  assert.deepEqual(get(px, 50, 5, 5), WHITE, "outside stays white");
  assert.ok(rect.x >= 10 && rect.x + rect.w <= 31, "changed area stays near the shape");
});

test("bucket leaks through a gap, as real paint would", () => {
  const px = image(50, 50);
  box(px, 50, 10, 10, 30, 30, INK);
  px.set(WHITE, (20 + 10 * 50) * 4);
  floodFill(px, 50, 50, 20, 20, RED, 40);
  assert.deepEqual(get(px, 50, 40, 40), RED);
});

test("bucket does nothing on the same color or outside the image", () => {
  const px = image(10, 10, RED);
  assert.equal(floodFill(px, 10, 10, 5, 5, RED, 40), null);
  assert.equal(floodFill(px, 10, 10, -1, 5, WHITE, 40), null);
  assert.equal(floodFill(px, 10, 10, 10, 5, WHITE, 40), null);
});

test("bucket tolerance takes in soft edge pixels", () => {
  const px = image(20, 20);
  px.set([235, 235, 235, 255], (5 + 5 * 20) * 4); // faint antialiasing
  px.set([120, 120, 120, 255], (15 + 15 * 20) * 4); // much darker pixel, not part of the fill
  floodFill(px, 20, 20, 1, 1, RED, 40);
  assert.deepEqual(get(px, 20, 5, 5), RED);
  assert.deepEqual(get(px, 20, 0, 19), RED);
});

test("bucket grows one pixel over the line edge but not two", () => {
  const px = image(20, 20);
  for (let y = 0; y < 20; y++) for (let x = 10; x < 13; x++) px.set(INK, (x + y * 20) * 4); // thick wall
  floodFill(px, 20, 20, 2, 2, RED, 40);
  assert.deepEqual(get(px, 20, 10, 5), RED);
  assert.deepEqual(get(px, 20, 11, 5), INK);
  assert.deepEqual(get(px, 20, 15, 5), WHITE);
});

test("bucket handles a full-size canvas quickly", () => {
  const px = image(1800, 1200);
  const started = Date.now();
  const rect = floodFill(px, 1800, 1200, 900, 600, RED, 40);
  assert.deepEqual(rect, { x: 0, y: 0, w: 1800, h: 1200 });
  assert.ok(Date.now() - started < 1000, `took ${Date.now() - started} ms`);
});

const entry = (bytes, tag) => ({ tag, before: { data: { length: bytes / 2 } }, after: { data: { length: bytes / 2 } } });

test("undo and redo walk the history in order", () => {
  const h = new History(1000);
  assert.equal(h.undo(), null);
  h.push(entry(10, "a")); h.push(entry(10, "b"));
  assert.equal(h.undo().tag, "b");
  assert.equal(h.undo().tag, "a");
  assert.equal(h.canUndo, false);
  assert.equal(h.redo().tag, "a");
  assert.equal(h.redo().tag, "b");
  assert.equal(h.canRedo, false);
});

test("a new action removes what could have been redone", () => {
  const h = new History(1000);
  h.push(entry(10, "a")); h.push(entry(10, "b"));
  h.undo();
  h.push(entry(10, "c"));
  assert.equal(h.canRedo, false);
  assert.equal(h.undo().tag, "c");
  assert.equal(h.undo().tag, "a");
});

test("history stays inside its memory budget and keeps the newest", () => {
  const h = new History(25);
  ["a", "b", "c", "d"].forEach((t) => h.push(entry(10, t)));
  assert.equal(h.entries.length, 2);
  assert.equal(h.undo().tag, "d");
  const big = new History(5);
  big.push(entry(100, "huge"));
  assert.equal(big.undo().tag, "huge", "one action is still undoable even if over budget");
});

test("dayKey uses the local date", () => {
  assert.equal(dayKey(new Date(2026, 10, 2, 23, 59)), "2026-11-02");
  assert.equal(dayKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("everyone gets the same part on the same day", () => {
  assert.equal(dailyIndex("2026-11-02", "head", 22), dailyIndex("2026-11-02", "head", 22));
});

test("daily picks stay in range, and vary by day and by part", () => {
  const days = new Set();
  const parts = new Set();
  for (let d = 1; d <= 28; d++) {
    const i = dailyIndex(`2026-11-${String(d).padStart(2, "0")}`, "head", 22);
    assert.ok(i >= 0 && i < 22);
    days.add(i);
  }
  for (const key of ["head", "tail", "ears", "eyes", "mouth", "legs", "arms"]) parts.add(dailyIndex("2026-11-02", key, 22));
  assert.ok(days.size >= 10, `only ${days.size} different picks in 28 days`);
  assert.ok(parts.size >= 3, `only ${parts.size} different picks across parts`);
});

test("daily picks are spread across the options", () => {
  const counts = new Array(20).fill(0);
  for (let y = 2026; y < 2031; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) counts[dailyIndex(`${y}-${m}-${d}`, "tail", 20)]++;
  const expected = (5 * 12 * 28) / 20;
  assert.ok(Math.max(...counts) < expected * 2 && Math.min(...counts) > expected / 2, counts.join(","));
});

test("each kind of round saves in its own slot", () => {
  assert.equal(slotOf({ mode: "basic", daily: true }), "today");
  assert.equal(slotOf({ mode: "detailed", daily: true }), "today");
  assert.equal(slotOf({ mode: "basic", daily: false }), "free");
  assert.equal(slotOf({ mode: "scrawl", daily: true }), "scrawl");
  assert.equal(slotOf({ mode: "scrawl" }), "scrawl", "Daily Scrawl never shares a save with Free play or today's parts");
  assert.equal(slotOf({ mode: "basic" }), "today", "an older save with no daily flag still counts as today's");
});
