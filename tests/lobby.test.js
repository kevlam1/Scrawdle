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
