"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { shareLine } = require("../frontend/drawing.js");

const URL_ = "https://scrawdle.vercel.app/";
const parts = [{ label: "Head", value: "Parrot", optional: false }, { label: "Tail", value: "Dinosaur tail", optional: false }];

test("a daily drawing names its mode, date, and parts, and links to the game", () => {
  const line = shareLine({ mode: "basic", daily: true, prompts: parts, day: "2026-11-05" }, URL_);
  assert.match(line, /^My Scrawdle Basic drawing for .*5: Parrot, Dinosaur tail\. Draw yours: https:\/\/scrawdle\.vercel\.app\/$/);
  assert.match(shareLine({ mode: "detailed", daily: true, prompts: parts, day: "2026-11-05" }, URL_), /Detailed drawing/);
});

test("Daily Scrawl is named as itself, not as Basic or Detailed", () => {
  const line = shareLine({ mode: "daily", daily: true, prompts: parts, day: "2026-11-05" }, URL_);
  assert.match(line, /^My Scrawdle Daily Scrawl drawing for .*5: Parrot, Dinosaur tail\. Draw yours: /);
});

test("Daily Free Play doesn't list its placeholder prompt", () => {
  const line = shareLine({ mode: "scrawl", daily: true, prompts: [{ label: "Daily Free Play", value: "Draw anything" }], day: "2026-11-05" }, URL_);
  assert.match(line, /^My Scrawdle Daily Free Play drawing for /);
  assert.doesNotMatch(line, /Draw anything/);
});

test("Open Canvas has no date, since it isn't a daily drawing", () => {
  const line = shareLine({ mode: "basic", daily: false, prompts: parts, day: "2026-11-05" }, URL_);
  assert.equal(line, "My Scrawdle Open Canvas drawing: Parrot, Dinosaur tail. Draw yours: " + URL_);
});

test("a daily drawing's line ends with the streak, Wordle-style, and only when there is one", () => {
  const day = { mode: "daily", daily: true, prompts: parts, day: "2026-11-05" };
  assert.match(shareLine(day, URL_, 5), / Draw yours: https:\/\/scrawdle\.vercel\.app\/ 🔥 5$/);
  assert.match(shareLine({ ...day, mode: "scrawl" }, URL_, 2), / 🔥 2$/);
  assert.equal(shareLine(day, URL_, 0), shareLine(day, URL_), "no streak, no flame");
  assert.doesNotMatch(shareLine({ ...day, daily: false }, URL_, 5), /🔥/, "Open Canvas doesn't count toward a streak");
});

test("a Time Challenge says how long it was, and has no date or streak", () => {
  const round = { mode: "basic", daily: false, prompts: parts, day: "2026-11-05", timed: { seconds: 60 } };
  assert.equal(shareLine(round, URL_, 5), "My Scrawdle 60-second Time Challenge: Parrot, Dinosaur tail. Draw yours: " + URL_);
});
