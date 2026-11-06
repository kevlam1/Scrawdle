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

test("Daily Free Play doesn't list its placeholder prompt", () => {
  const line = shareLine({ mode: "scrawl", daily: true, prompts: [{ label: "Daily Free Play", value: "Draw anything" }], day: "2026-11-05" }, URL_);
  assert.match(line, /^My Scrawdle Daily Free Play drawing for /);
  assert.doesNotMatch(line, /Draw anything/);
});

test("Free play has no date, since it isn't a daily drawing", () => {
  const line = shareLine({ mode: "basic", daily: false, prompts: parts, day: "2026-11-05" }, URL_);
  assert.equal(line, "My Scrawdle Free play drawing: Parrot, Dinosaur tail. Draw yours: " + URL_);
});
