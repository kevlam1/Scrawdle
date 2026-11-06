// Run with: node --test tests/party-rules.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const R = require("../frontend/party-rules.js");

const promptData = JSON.parse(fs.readFileSync(path.join(__dirname, "../frontend/prompts.json"), "utf8"));

test("settings the host didn't pick, or that aren't offered, fall back to the defaults", () => {
  assert.deepEqual(R.cleanSettings({ mode: "detailed", rounds: 5, seconds: 60 }), { mode: "detailed", rounds: 5, seconds: 60 });
  assert.deepEqual(R.cleanSettings({ mode: "scrawl", rounds: 99, seconds: "90" }), R.DEFAULTS);
  assert.deepEqual(R.cleanSettings(null), R.DEFAULTS);
  assert.deepEqual(R.cleanSettings({ rounds: 1 }), { ...R.DEFAULTS, rounds: 1 });
});

test("Basic rolls one value for each Basic part, and Detailed adds its own parts", () => {
  const basic = R.rollParts(promptData, "basic", () => 0);
  assert.equal(basic.length, Object.keys(promptData.basic).length);
  const detailed = R.rollParts(promptData, "detailed", () => 0);
  assert.equal(detailed.length, Object.keys(promptData.basic).length + Object.keys(promptData.detailed).length - 1);
  for (const part of detailed) {
    assert.equal(typeof part.label, "string");
    assert.equal(typeof part.value, "string");
    assert.equal(typeof part.optional, "boolean");
  }
  assert.equal(basic[0].value, Object.values(promptData.basic)[0].options[0]);
  const last = R.rollParts(promptData, "basic", () => 0.9999)[0];
  assert.equal(last.value, Object.values(promptData.basic)[0].options.at(-1), "never past the end of a list");
});

test("shuffling keeps every item exactly once and leaves the original alone", () => {
  const ids = ["a", "b", "c", "d", "e"];
  let seed = 3;
  const out = R.shuffled(ids, () => (seed = (seed * 16807) % 2147483647) / 2147483647);
  assert.deepEqual(out.slice().sort(), ids);
  assert.deepEqual(ids, ["a", "b", "c", "d", "e"]);
});

test("votes are counted per drawing, and self-votes, unknown drawings and bad values don't count", () => {
  const owners = ["ana", "ben", "cal"];
  const ballots = {
    ana: { ana: 1, ben: 1, cal: -1, zed: 1 },
    ben: { ana: 1, cal: 1, ben: 1 },
    cal: { ana: -1, ben: 0, cal: 1 },
    dan: { ana: 2, ben: "1", cal: null },
    eve: null,
  };
  assert.deepEqual(R.tally(owners, ballots), {
    ana: { up: 1, down: 1 },
    ben: { up: 1, down: 0 },
    cal: { up: 1, down: 1 },
  });
});

test("a viewer who didn't draw can still vote", () => {
  assert.deepEqual(R.tally(["ana"], { late: { ana: 1 } }), { ana: { up: 1, down: 0 } });
});

test("anyone with a thumbs up won the round, and the most thumbs up is the top drawing", () => {
  const r = R.roundResults(["ana", "ben", "cal"], { ana: { ben: 1, cal: 1 }, ben: { cal: 1 }, cal: { ana: -1 } });
  assert.deepEqual(r.winners, ["ben", "cal"]);
  assert.deepEqual(r.top, ["cal"]);
});

test("a tie shares the top, and a round with no thumbs up has no winners and no top drawing", () => {
  assert.deepEqual(R.roundResults(["ana", "ben"], { ana: { ben: 1 }, ben: { ana: 1 } }).top, ["ana", "ben"]);
  const none = R.roundResults(["ana", "ben"], { ana: { ben: -1 } });
  assert.deepEqual(none.winners, []);
  assert.deepEqual(none.top, []);
});

test("points are thumbs up added up over rounds; thumbs down take nothing away", () => {
  let scores = {};
  scores = R.addScores(scores, { ana: { up: 2, down: 1 }, ben: { up: 0, down: 3 } });
  scores = R.addScores(scores, { ana: { up: 1, down: 0 }, cal: { up: 1, down: 0 } });
  assert.deepEqual(scores, { ana: 3, ben: 0, cal: 1 });
});

test("standings put the most points first, and ties share a place", () => {
  const rows = R.standings({ ana: 3, ben: 5, cal: 3, dan: 1 }, { ana: "Ana", ben: "Ben", cal: "Cal" });
  assert.deepEqual(rows.map((r) => [r.name, r.points, r.place]), [["Ben", 5, 1], ["Ana", 3, 2], ["Cal", 3, 2], ["Player", 1, 4]]);
});

test("a phase ends when every player still here is done, without waiting for players who left", () => {
  assert.equal(R.everyoneDone(["a", "b", "c"], ["a", "b", "c"], ["a", "b"]), false);
  assert.equal(R.everyoneDone(["a", "b", "c"], ["a", "b", "c"], ["c", "b", "a"]), true);
  assert.equal(R.everyoneDone(["a", "b", "c"], ["a", "b"], ["a", "b"]), true, "c left");
  assert.equal(R.everyoneDone(["a", "b"], ["a", "b", "late"], ["a", "b"]), true, "a late joiner isn't in this round");
  assert.equal(R.everyoneDone(["a", "b"], [], []), false, "nobody left to finish");
});

test("the image steps start at 900 by 600 and only shrink as a last resort, under the message limit", () => {
  assert.equal(R.ENCODE_STEPS[0].width, 900);
  assert.equal(R.ENCODE_STEPS[1].type, "image/jpeg", "JPEG right after WebP, for browsers that can't make WebP");
  assert.ok(R.MAX_IMAGE_CHARS < 256 * 1024);
  const widths = R.ENCODE_STEPS.map((s) => s.width);
  assert.deepEqual(widths, widths.slice().sort((a, b) => b - a));
});
