"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { COLORS, COLOR_NAMES } = require("../frontend/drawing.js");

test("every swatch color has a name, and no two share one", () => {
  for (const c of COLORS) assert.ok(COLOR_NAMES[c], `${c} has no name`);
  const names = COLORS.map((c) => COLOR_NAMES[c]);
  assert.equal(new Set(names).size, names.length);
});

test("names are words, not color codes", () => {
  for (const c of COLORS) assert.doesNotMatch(COLOR_NAMES[c], /#|[0-9]/);
});
