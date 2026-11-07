// Run with: node --test tests/lobby.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MAX_PLAYERS, normalizeCode, codeFromSearch, lobbyLink, cleanName, randomName,
  playersFromState, isOverCap, activeGameOf, unwrap,
} = require("../frontend/lobby.js");

test("codes are exactly five letters, any case, trimmed", () => {
  assert.equal(normalizeCode("bcdfg"), "BCDFG");
  assert.equal(normalizeCode("  BcDfG "), "BCDFG");
  for (const bad of ["", "ABCD", "ABCDEF", "AB1DE", "AB DE", "ÅBCDE", null, undefined, 12345, "ABC-E"]) {
    assert.equal(normalizeCode(bad), null, `rejects ${JSON.stringify(bad)}`);
  }
});

test("a link like /?BCDFG gives the code, and nothing else does", () => {
  assert.equal(codeFromSearch("?BCDFG"), "BCDFG");
  assert.equal(codeFromSearch("?bcdfg"), "BCDFG");
  assert.equal(codeFromSearch("?BCDFG/"), "BCDFG");
  for (const other of ["", "?", "?BCDF", "?BCDFGH", "?code=BCDFG", "?BCDFG&x=1", "?BCDFG=1", "BCDFG", "#BCDFG", null, undefined]) {
    assert.equal(codeFromSearch(other), null, `ignores ${JSON.stringify(other)}`);
  }
});

test("the invite link is the site address plus ?CODE", () => {
  assert.equal(lobbyLink("https://scrawdle.vercel.app", "/", "BCDFG"), "https://scrawdle.vercel.app/?BCDFG");
  assert.equal(lobbyLink("http://localhost:8000", "", "BCDFG"), "http://localhost:8000/?BCDFG");
});

test("names are tidied and capped at 20 characters", () => {
  assert.equal(cleanName("  Sam   the   Great  "), "Sam the Great");
  assert.equal(cleanName("a\u0000b\u001fc\n d"), "abc d");
  assert.equal(cleanName("x".repeat(50)).length, 20);
  assert.equal(cleanName("abcdefghij klmnopqrs tuvwxyz"), "abcdefghij klmnopqrs");
  assert.equal(cleanName("   "), "");
  assert.equal(cleanName(null), "");
  assert.equal(cleanName("<b>hi</b>"), "<b>hi</b>", "kept as text; the page only ever uses textContent");
});

test("a random name is two words from the lists, and always valid at the extremes", () => {
  assert.match(randomName(), /^[A-Z][a-z]+ [A-Z][a-z]+$/);
  assert.equal(randomName(() => 0), "Brave Otter");
  assert.match(randomName(() => 0.999999999), /^[A-Z][a-z]+ [A-Z][a-z]+$/);
  for (let i = 0; i < 300; i++) {
    const name = randomName();
    assert.equal(cleanName(name), name, `${name} survives cleanName unchanged`);
    assert.ok(name.length <= 20);
  }
});

const meta = (id, name, joinedAt, game) => ({ id, name, joinedAt, ...(game ? { game } : {}) });

test("players come out in join order, so the first is the host", () => {
  const state = {
    c: [meta("c", "Cy", 300)],
    a: [meta("a", "Al", 100)],
    b: [meta("b", "Bo", 200)],
  };
  assert.deepEqual(playersFromState(state).map((p) => p.id), ["a", "b", "c"]);
  // the longest-present player leads even when their id sorts last
  const reversed = { a: [meta("a", "Al", 300)], z: [meta("z", "Zed", 100)], m: [meta("m", "Mo", 200)] };
  assert.deepEqual(playersFromState(reversed).map((p) => p.id), ["z", "m", "a"]);
});

test("everyone computes the same host, whatever order the state arrives in", () => {
  const entries = [["a", meta("a", "Al", 100)], ["b", meta("b", "Bo", 100)], ["c", meta("c", "Cy", 100)]];
  const orders = [entries, [...entries].reverse(), [entries[1], entries[2], entries[0]]];
  const hosts = orders.map((o) => playersFromState(Object.fromEntries(o.map(([k, m]) => [k, [m]])))[0].id);
  assert.deepEqual(hosts, ["a", "a", "a"], "ties on join time break by id");
});

test("when a player's presence is updated, only their newest entry counts", () => {
  const state = { a: [meta("a", "Old", 100), meta("a", "New", 100, "pictionary")] };
  assert.deepEqual(playersFromState(state), [{ id: "a", name: "New", joinedAt: 100, game: "pictionary" }]);
});

test("malformed presence entries are dropped instead of crashing the lobby", () => {
  const state = {
    ok: [meta("ok", "Fine", 1)],
    none: [],
    notArray: "nope",
    noId: [{ name: "x", joinedAt: 1 }],
    noName: [{ id: "n", joinedAt: 1 }],
    nums: [{ id: 5, name: "x" }],
    nullish: null,
  };
  assert.deepEqual(playersFromState(state).map((p) => p.id), ["ok"]);
  assert.deepEqual(playersFromState(null), []);
  assert.deepEqual(playersFromState(undefined), []);
});

test("a blank or missing name shows as Player, and a bad joinedAt sorts first rather than breaking", () => {
  const players = playersFromState({ a: [{ id: "a", name: "   ", joinedAt: "soon" }] });
  assert.equal(players[0].name, "Player");
  assert.equal(players[0].joinedAt, 0);
});

test("the cap counts from the front: the first eight stay, the ninth is over", () => {
  const state = {};
  for (let i = 0; i < 9; i++) state[`p${i}`] = [meta(`p${i}`, `P${i}`, 100 + i)];
  const players = playersFromState(state);
  assert.equal(MAX_PLAYERS, 8);
  assert.equal(isOverCap(players, "p7"), false);
  assert.equal(isOverCap(players, "p8"), true);
  assert.equal(isOverCap(players, "p0"), false);
  assert.equal(isOverCap(players, "nobody"), false, "someone who isn't listed yet isn't over the cap");
  assert.equal(isOverCap(players, "p8", 9), false, "the limit is a parameter");
});

test("a game already running is found from any player's entry", () => {
  assert.equal(activeGameOf(playersFromState({ a: [meta("a", "A", 1)], b: [meta("b", "B", 2, "pictionary")] })), "pictionary");
  assert.equal(activeGameOf(playersFromState({ a: [meta("a", "A", 1)] })), null);
  assert.equal(activeGameOf([]), null);
});

test("a broadcast callback's argument is read as the whole message or as the bare payload", () => {
  assert.deepEqual(unwrap({ type: "broadcast", event: "lobby:start", payload: { game: "x" } }), { game: "x" });
  assert.deepEqual(unwrap({ game: "x" }), { game: "x" });
  assert.equal(unwrap(null), null);
  assert.deepEqual(unwrap({ type: "broadcast", event: "e", payload: {} }), {});
});

/* ---------- Kicking ---------- */
const { mayKick, voteBlocker, voteOutcome, voteEnforcer, wasKicked, rememberKick, VOTE_MIN_PLAYERS } = require("../frontend/lobby.js");
const room = (...ids) => ids.map((id, i) => ({ id, name: id.toUpperCase(), joinedAt: i, game: null }));
const vote = (target, yes, no = [], endsAt = 1000) => ({ target, yes: new Set(yes), no: new Set(no), endsAt });

test("only the host can kick, and nobody can kick themselves", () => {
  const players = room("host", "ben", "cal");
  assert.equal(mayKick(players, { target: "ben", by: "host" }), true);
  assert.equal(mayKick(players, { target: "cal", by: "ben" }), false, "not the host");
  assert.equal(mayKick(players, { target: "host", by: "host" }), false, "yourself");
  assert.equal(mayKick(players, { target: "ben", by: "gone" }), false, "someone who isn't the host now");
  for (const bad of [null, {}, { target: 1, by: "host" }, { target: "ben" }]) assert.equal(mayKick(players, bad), false);
});

test("a kick from a vote counts only if this page saw that vote pass for that player", () => {
  const players = room("host", "ben", "cal");
  const passed = new Set(["v1|host"]);
  assert.equal(mayKick(players, { target: "host", by: "ben", reason: "vote", voteId: "v1" }, passed), true, "even the host can be voted out");
  assert.equal(mayKick(players, { target: "cal", by: "ben", reason: "vote", voteId: "v1" }, passed), false, "a different player");
  assert.equal(mayKick(players, { target: "host", by: "ben", reason: "vote", voteId: "v2" }, passed), false, "a vote that didn't pass here");
  assert.equal(mayKick(players, { target: "ben", by: "host", reason: "vote", voteId: "v9" }, passed), false, "the host can't dress a kick up as a vote");
});

test("a vote to kick needs three players, no vote already going, and someone else as the target", () => {
  const three = room("a", "b", "c");
  assert.equal(voteBlocker({ players: three, me: "a", target: "b" }), null);
  assert.match(voteBlocker({ players: room("a", "b"), me: "a", target: "b" }), /at least 3/);
  assert.match(voteBlocker({ players: three, me: "a", target: "a" }), /yourself/);
  assert.match(voteBlocker({ players: three, me: "a", target: "zed" }), /isn't here/);
  assert.match(voteBlocker({ players: three, me: "a", target: "b", active: true }), /already/);
  assert.match(voteBlocker({ players: three, me: "a", target: "b", inGame: true }), /during a game/);
  assert.match(voteBlocker({ players: three, me: "a", target: "b", cooldownUntil: 2000, now: 1000 }), /just voted on/);
  assert.equal(voteBlocker({ players: three, me: "a", target: "b", cooldownUntil: 2000, now: 2000 }), null, "the wait is over");
  assert.equal(VOTE_MIN_PLAYERS, 3);
});

test("a vote passes only when every player except the one being kicked says yes", () => {
  const players = room("a", "b", "c", "d");
  assert.equal(voteOutcome(players, vote("d", ["a", "b", "c"]), 0), "pass");
  assert.equal(voteOutcome(players, vote("d", ["a", "b"]), 0), "open", "c hasn't voted");
  assert.equal(voteOutcome(players, vote("d", ["a", "b", "d"]), 0), "open", "the target's own yes doesn't count for anyone else");
});

test("one no, or the time running out, fails the vote", () => {
  const players = room("a", "b", "c", "d");
  assert.equal(voteOutcome(players, vote("d", ["a", "b"], ["c"]), 0), "fail");
  assert.equal(voteOutcome(players, vote("d", ["a", "b"], [], 1000), 999), "open");
  assert.equal(voteOutcome(players, vote("d", ["a", "b"], [], 1000), 1000), "fail");
  assert.equal(voteOutcome(players, vote("d", ["a", "b"], ["d"]), 0), "open", "the target saying no changes nothing");
});

test("players who leave stop counting, and the vote ends if its target leaves", () => {
  assert.equal(voteOutcome(room("a", "b", "d"), vote("d", ["a", "b"], ["c"]), 0), "pass", "c said no, then left");
  assert.equal(voteOutcome(room("a", "b", "c"), vote("d", ["a"]), 0), "gone");
  assert.equal(voteOutcome(room("a", "b"), vote("d", ["a", "b"], ["c"]), 0), "pass", "everyone left agreed, and the target's page saw it first and left");
  assert.equal(voteOutcome(room("a", "d"), vote("d", ["a"]), 0), "fail", "too few left to vote");
});

test("a passed vote is carried out by the longest-present player who isn't the target", () => {
  assert.equal(voteEnforcer(room("host", "b", "c"), "c"), "host");
  assert.equal(voteEnforcer(room("host", "b", "c"), "host"), "b", "the next in line, when the host is voted out");
  assert.equal(voteEnforcer(room("host"), "host"), null);
});

test("a kick keeps you out of that lobby for the rest of the day only", () => {
  let kicks = rememberKick({}, "BCDFG", "2026-11-07");
  assert.equal(wasKicked(kicks, "BCDFG", "2026-11-07"), true);
  assert.equal(wasKicked(kicks, "XYZWV", "2026-11-07"), false, "other lobbies");
  assert.equal(wasKicked(kicks, "BCDFG", "2026-11-08"), false, "the next day");
  kicks = rememberKick(kicks, "XYZWV", "2026-11-08");
  assert.deepEqual(kicks, { XYZWV: "2026-11-08" }, "old days are forgotten");
  for (const bad of [null, "x", 5]) assert.equal(wasKicked(bad, "BCDFG", "2026-11-07"), false);
  assert.deepEqual(rememberKick("junk", "BCDFG", "2026-11-07"), { BCDFG: "2026-11-07" });
});
