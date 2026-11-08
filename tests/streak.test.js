// Run with: node --test tests/streak.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../frontend/streak.js");

test("days are numbered so the next calendar day is always one more, across months, years and leap days", () => {
  const next = (a, b) => assert.equal(S.dayNumber(b) - S.dayNumber(a), 1, `${a} -> ${b}`);
  next("2026-11-07", "2026-11-08");
  next("2026-11-30", "2026-12-01");
  next("2026-12-31", "2027-01-01");
  next("2028-02-28", "2028-02-29");
  next("2028-02-29", "2028-03-01");
  next("2026-02-28", "2026-03-01");
  next("2026-03-07", "2026-03-08"); // US clocks change on 2026-03-08; dates don't care
  next("2026-10-31", "2026-11-01");
});

test("anything that isn't a real date is refused", () => {
  for (const bad of ["2026-02-30", "2026-13-01", "2026-11-7", "11/07/2026", "", null, undefined, 20261107, "2026-11-07T00:00"]) {
    assert.ok(Number.isNaN(S.dayNumber(bad)), `refuses ${JSON.stringify(bad)}`);
  }
});

test("adding a day keeps the list sorted, with no repeats and no junk", () => {
  assert.deepEqual(S.addDay(["2026-11-07", "2026-11-05"], "2026-11-06"), ["2026-11-05", "2026-11-06", "2026-11-07"]);
  assert.deepEqual(S.addDay(["2026-11-07"], "2026-11-07"), ["2026-11-07"]);
  assert.deepEqual(S.addDay(["nope", null, "2026-02-30", "2026-11-07"], "bad"), ["2026-11-07"]);
  assert.deepEqual(S.addDay("not a list", "2026-11-07"), ["2026-11-07"]);
  assert.deepEqual(S.addDay(undefined), []);
});

test("only the most recent days are kept", () => {
  const days = [];
  for (let i = 0; i < S.KEEP_DAYS + 10; i++) days.push(new Date(Date.UTC(2024, 0, 1 + i)).toISOString().slice(0, 10));
  const kept = S.addDay(days);
  assert.equal(kept.length, S.KEEP_DAYS);
  assert.equal(kept.at(-1), days.at(-1), "the newest stays");
});

test("the streak counts back from today when today is drawn", () => {
  assert.deepEqual(S.streakOf(["2026-11-05", "2026-11-06", "2026-11-07"], "2026-11-07"), { current: 3, best: 3, drewToday: true });
});

test("before today's drawing, yesterday's streak is still alive", () => {
  assert.deepEqual(S.streakOf(["2026-11-05", "2026-11-06"], "2026-11-07"), { current: 2, best: 2, drewToday: false });
});

test("a whole missed day ends it", () => {
  assert.deepEqual(S.streakOf(["2026-11-04", "2026-11-05"], "2026-11-07"), { current: 0, best: 2, drewToday: false });
  assert.deepEqual(S.streakOf(["2026-11-04", "2026-11-05", "2026-11-07"], "2026-11-07"), { current: 1, best: 2, drewToday: true });
});

test("a streak runs across the end of a month and a year", () => {
  assert.equal(S.streakOf(["2026-12-30", "2026-12-31", "2027-01-01"], "2027-01-01").current, 3);
  assert.equal(S.streakOf(["2028-02-28", "2028-02-29", "2028-03-01"], "2028-03-01").current, 3);
});

test("the best streak is the longest run, or the saved best if that's higher", () => {
  const days = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-11-06", "2026-11-07"];
  assert.deepEqual(S.streakOf(days, "2026-11-07"), { current: 2, best: 4, drewToday: true });
  assert.equal(S.streakOf(days, "2026-11-07", 9).best, 9, "an older best whose days were dropped");
  assert.equal(S.streakOf([], "2026-11-07").best, 0);
});

test("no days means no streak", () => {
  assert.deepEqual(S.streakOf([], "2026-11-07"), { current: 0, best: 0, drewToday: false });
  assert.deepEqual(S.streakOf(null, "2026-11-07"), { current: 0, best: 0, drewToday: false });
});

test("the home screen shows the streak from 3 days, and nudges when today isn't drawn yet", () => {
  assert.equal(S.homeText({ current: 5, drewToday: true }), "5-day streak");
  assert.equal(S.homeText({ current: 5, drewToday: false }), "5-day streak · Draw today to keep it going");
  assert.equal(S.homeText({ current: 3, drewToday: true }), "3-day streak");
  assert.equal(S.homeText({ current: 2, drewToday: true }), "", "1 or 2 days isn't shown yet");
  assert.equal(S.homeText({ current: 1, drewToday: false }), "");
  assert.equal(S.homeText({ current: 0, drewToday: false }), "");
  assert.equal(S.homeText(null), "");
});

test("the finish screen celebrates a new day and a new best, from 3 days", () => {
  assert.equal(S.finishText({ current: 1 }, true, 0), "");
  assert.equal(S.finishText({ current: 2 }, true, 1), "");
  assert.equal(S.finishText({ current: 3 }, true, 3), "That's 3 days in a row!");
  assert.equal(S.finishText({ current: 4 }, true, 6), "That's 4 days in a row!");
  assert.equal(S.finishText({ current: 7 }, true, 6), "New best: 7 days in a row!");
  assert.equal(S.finishText({ current: 4 }, false, 6), "4-day streak", "today already counted");
  assert.equal(S.finishText({ current: 0 }, false, 0), "");
});
