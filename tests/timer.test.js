// Run with: node --test tests/timer.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../frontend/timer.js");

test("the clock reads minutes and two-digit seconds", () => {
  assert.equal(T.clockText(90), "1:30");
  assert.equal(T.clockText(65), "1:05");
  assert.equal(T.clockText(9), "0:09");
  assert.equal(T.clockText(0), "0:00");
  assert.equal(T.clockText(-3), "0:00");
  assert.equal(T.clockText(59.9), "0:59");
  assert.equal(T.clockText("x"), "0:00");
});

test("seconds left round up, so 0:00 only shows once time is really up", () => {
  assert.equal(T.secondsLeft(10000, 0), 10);
  assert.equal(T.secondsLeft(10000, 1), 10);
  assert.equal(T.secondsLeft(10000, 9001), 1);
  assert.equal(T.secondsLeft(10000, 10000), 0);
  assert.equal(T.secondsLeft(10000, 99999), 0, "never negative");
});

test("time used is the nearest whole second, never more than the challenge's length", () => {
  assert.equal(T.secondsUsed(0, 42400, 60), 42);
  assert.equal(T.secondsUsed(0, 42600, 60), 43);
  assert.equal(T.secondsUsed(0, 90000, 60), 60);
  assert.equal(T.secondsUsed(1000, 500, 60), 0, "a clock that went backwards");
});

test("the last ten seconds are the hurry", () => {
  assert.equal(T.HURRY, 10);
});
