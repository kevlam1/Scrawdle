// Run with: node --test tests/votes.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { isWin, resultText, applyVote, countsById, NO_VOTES } = require("../frontend/votes.js");

test("one thumbs up wins, whatever the thumbs down", () => {
  assert.equal(isWin({ up: 1, down: 0, mine: 0 }), true);
  assert.equal(isWin({ up: 1, down: 9, mine: 0 }), true);
  assert.equal(isWin({ up: 0, down: 3, mine: 0 }), false);
  assert.equal(isWin(NO_VOTES), false);
  assert.equal(isWin(null), false);
  assert.equal(isWin(undefined), false);
});

test("the result text says won, or nothing until someone likes it (the heart shows the count)", () => {
  assert.equal(resultText({ up: 2, down: 1, mine: 0 }), "You won!");
  assert.equal(resultText({ up: 0, down: 0, mine: 0 }), "");
  assert.equal(resultText({ up: 0, down: 2, mine: 0 }), "");
  assert.equal(resultText(null), "Publish it so others can like it.");
});

test("a first vote is added", () => {
  assert.deepEqual(applyVote({ up: 2, down: 1, mine: 0 }, 1), { value: 1, votes: { up: 3, down: 1, mine: 1 } });
  assert.deepEqual(applyVote({ up: 2, down: 1, mine: 0 }, -1), { value: -1, votes: { up: 2, down: 2, mine: -1 } });
});

test("pressing your own vote again takes it back", () => {
  assert.deepEqual(applyVote({ up: 3, down: 1, mine: 1 }, 1), { value: 0, votes: { up: 2, down: 1, mine: 0 } });
  assert.deepEqual(applyVote({ up: 0, down: 1, mine: -1 }, -1), { value: 0, votes: { up: 0, down: 0, mine: 0 } });
});

test("pressing the other button switches the vote, so one player never counts twice", () => {
  assert.deepEqual(applyVote({ up: 3, down: 1, mine: 1 }, -1), { value: -1, votes: { up: 2, down: 2, mine: -1 } });
  assert.deepEqual(applyVote({ up: 0, down: 1, mine: -1 }, 1), { value: 1, votes: { up: 1, down: 0, mine: 1 } });
  let v = { up: 0, down: 0, mine: 0 };
  for (const press of [1, -1, 1, 1, -1, -1, 1]) {
    v = applyVote(v, press).votes;
    assert.ok(v.up + v.down <= 1, `one player, at most one vote (after ${press})`);
  }
});

test("missing votes start from zero", () => {
  assert.deepEqual(applyVote(null, 1), { value: 1, votes: { up: 1, down: 0, mine: 1 } });
});

test("database rows become counts by drawing id, and drawings with no row get zero", () => {
  const rows = [
    { drawing_id: "a", up: 2, down: 1, my_vote: 1 },
    { drawing_id: "b", up: 0, down: 0, my_vote: 0 },
  ];
  assert.deepEqual(countsById(rows, ["a", "b", "c"]), {
    a: { up: 2, down: 1, mine: 1 },
    b: { up: 0, down: 0, mine: 0 },
    c: { up: 0, down: 0, mine: 0 },
  });
});

test("malformed rows count as zero instead of breaking the gallery", () => {
  const rows = [null, "x", { up: 3 }, { drawing_id: "a", up: -2, down: "4", my_vote: 7 }, { drawing_id: "b", up: 1.5, down: null }];
  assert.deepEqual(countsById(rows, ["a", "b"]), {
    a: { up: 0, down: 0, mine: 0 },
    b: { up: 0, down: 0, mine: 0 },
  });
  assert.deepEqual(countsById(null, ["a"]), { a: { up: 0, down: 0, mine: 0 } });
  assert.deepEqual(countsById(undefined, undefined), {});
});

test("counts for one drawing are separate objects, so changing one can't change another", () => {
  const out = countsById([], ["a", "b"]);
  out.a.up = 5;
  assert.equal(out.b.up, 0);
  assert.equal(NO_VOTES.up, 0);
});
