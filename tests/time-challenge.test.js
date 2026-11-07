// Run with: node --test tests/time-challenge.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { slotOf, SLOTS, timedText } = require("../frontend/drawing.js");

test("a Time Challenge has its own save slot, so it never replaces another drawing", () => {
  assert.equal(slotOf({ mode: "basic", daily: false, timed: { seconds: 60 } }), "timed");
  assert.equal(slotOf({ mode: "basic", daily: false }), "free", "Free Play keeps its own");
  assert.equal(slotOf({ mode: "daily", daily: true }), "today");
  assert.equal(slotOf({ mode: "scrawl", daily: true }), "scrawl");
  assert.deepEqual(SLOTS, ["today", "scrawl", "free", "timed"]);
});

test("the finish screen says how long it took", () => {
  assert.equal(timedText({ seconds: 60, used: 60 }), "⏱ Drawn in 60 seconds!");
  assert.equal(timedText({ seconds: 60, used: 42 }), "⏱ Finished in 42 of 60 seconds!");
  assert.equal(timedText({ seconds: 30, used: 0 }), "⏱ Finished in 0 of 30 seconds!");
  assert.match(timedText({ seconds: 90, startedAt: 1 }), /ended when you left/, "reloaded or left mid-challenge");
  assert.equal(timedText(null), "");
  assert.equal(timedText({}), "");
});
