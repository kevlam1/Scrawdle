"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { bookKey, keysToDrop, BOOK_MAX } = require("../frontend/drawing.js");

test("keys sort oldest day first, then by time within a day", () => {
  const keys = [
    bookKey({ day: "2026-11-04", savedAt: 900 }, "today"),
    bookKey({ day: "2026-10-30", savedAt: 1700000000000 }, "free"),
    bookKey({ day: "2026-11-04", savedAt: 80 }, "today"),
  ];
  assert.deepEqual([...keys].sort(), [keys[1], keys[2], keys[0]]);
});

test("the oldest go first once there are more than the limit, and drafts are never dropped", () => {
  const book = Array.from({ length: BOOK_MAX + 3 }, (_, i) => bookKey({ day: `2026-09-${String(i % 28 + 1).padStart(2, "0")}`, savedAt: i }, "today"));
  const dropped = keysToDrop([...book, "today", "free", "scrawl"]);
  assert.equal(dropped.length, 3);
  assert.ok(dropped.every((k) => k.startsWith("book|")));
  assert.deepEqual(dropped, [...book].sort().slice(0, 3));
});

test("nothing is dropped under the limit", () => {
  assert.deepEqual(keysToDrop([bookKey({ day: "2026-11-01", savedAt: 1 }, "free"), "today"]), []);
});
