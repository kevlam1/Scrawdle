// Run with: node --test tests/color-picker.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../frontend/color-picker.js");
const { COLORS } = require("../frontend/drawing.js");

test("hex codes are tidied: short or long, any case, with or without #", () => {
  assert.equal(C.normalizeHex("#4D96FF"), "#4d96ff");
  assert.equal(C.normalizeHex("4d96ff"), "#4d96ff");
  assert.equal(C.normalizeHex(" #abc "), "#aabbcc");
  assert.equal(C.normalizeHex("FFF"), "#ffffff");
});

test("anything that isn't a hex color is refused", () => {
  for (const bad of ["", "#", "#12", "#1234", "#12345", "#1234567", "#ggg000", "red", "rgb(0,0,0)", null, undefined, 123456, "# 123456"]) {
    assert.equal(C.normalizeHex(bad), null, `refuses ${JSON.stringify(bad)}`);
  }
});

test("pure colors land where the square and bar put them", () => {
  assert.deepEqual(C.hexToHsv("#ff0000"), { h: 0, s: 1, v: 1 });
  assert.deepEqual(C.hexToHsv("#00ff00"), { h: 120, s: 1, v: 1 });
  assert.deepEqual(C.hexToHsv("#0000ff"), { h: 240, s: 1, v: 1 });
  assert.deepEqual(C.hexToHsv("#000000"), { h: 0, s: 0, v: 0 });
  assert.deepEqual(C.hexToHsv("#ffffff"), { h: 0, s: 0, v: 1 });
  assert.equal(C.hsvToHex({ h: 0, s: 1, v: 1 }), "#ff0000");
  assert.equal(C.hsvToHex({ h: 300, s: 1, v: 1 }), "#ff00ff");
  assert.equal(C.hsvToHex({ h: 210, s: 0, v: 0.5 }), "#808080", "no color means grey, whatever the hue");
});

test("every one of the tray's colors survives a round trip through the picker", () => {
  for (const hex of COLORS) assert.equal(C.hsvToHex(C.hexToHsv(hex)), hex, hex);
});

test("a sample of all colors survives a round trip", () => {
  for (let r = 0; r <= 255; r += 17) for (let g = 0; g <= 255; g += 51) for (let b = 0; b <= 255; b += 85) {
    const hex = C.rgbToHex({ r, g, b });
    assert.equal(C.hsvToHex(C.hexToHsv(hex)), hex, hex);
  }
});

test("values past the ends of the square and bar are kept inside them", () => {
  assert.equal(C.hsvToHex({ h: 360, s: 1, v: 1 }), "#ff0000", "360 degrees is 0");
  assert.equal(C.hsvToHex({ h: -120, s: 1, v: 1 }), "#0000ff");
  assert.equal(C.hsvToHex({ h: 0, s: 2, v: 2 }), "#ff0000");
  assert.equal(C.hsvToHex({ h: 0, s: -1, v: -1 }), "#000000");
});

test("recent colors: newest first, no repeats, at most six, and junk dropped", () => {
  assert.deepEqual(C.addRecent([], "#ABC"), ["#aabbcc"]);
  assert.deepEqual(C.addRecent(["#111111", "#222222"], "#222222"), ["#222222", "#111111"]);
  const many = ["#000001", "#000002", "#000003", "#000004", "#000005", "#000006"];
  assert.deepEqual(C.addRecent(many, "#000007"), ["#000007", "#000001", "#000002", "#000003", "#000004", "#000005"]);
  assert.deepEqual(C.addRecent(["#111111", "nope", null, "#111"], "nope"), ["#111111"]);
  assert.deepEqual(C.addRecent([], "bad"), ["#bbaadd"], "\"bad\" really is a short hex code");
  assert.deepEqual(C.addRecent("not a list", "#123456"), ["#123456"]);
});
