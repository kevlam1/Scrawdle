const test = require('node:test');
const assert = require('node:assert/strict');
const {brushWidthFactor} = require('../frontend/drawing.js');
test('mouse brush width remains constant at different drawing speeds', () => {
  for (const speed of [0, .1, 1, 10, 100]) assert.equal(brushWidthFactor('bounded', null, speed), 1);
});
test('stylus width never exceeds selected width, including out-of-range pressure', () => {
  for (const pressure of [-1, 0, .2, .5, 1, 2]) {
    const factor = brushWidthFactor('bounded', pressure);
    assert.ok(factor >= .25 && factor <= 1);
  }
});
test('old replay records retain legacy pressure and speed behavior', () => {
  assert.equal(brushWidthFactor(undefined, 1), 1.35);
  assert.equal(brushWidthFactor(undefined, null, 10), .55);
});
