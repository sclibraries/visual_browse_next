const assert = require('node:assert/strict');
const { test } = require('node:test');
const { formatCallNumber, formatVolume, hasVolumes } = require('./callNumber.cjs');

test('formats a scalar call number by trimming it', () => {
  assert.equal(formatCallNumber('  M2 .D62  '), 'M2 .D62');
});

test('joins trimmed non-empty call number array parts', () => {
  assert.equal(formatCallNumber([' M2 ', '', ' .D62 ', null, '  ']), 'M2 .D62');
});

test('strips one exact outer pair of parentheses from a volume', () => {
  assert.equal(formatVolume('(35)'), '35');
  assert.equal(formatVolume('( 12 )'), '12');
});

test('keeps an unparenthesized volume unchanged', () => {
  assert.equal(formatVolume('v.2'), 'v.2');
});

test('keeps values with parentheses that do not wrap the whole volume', () => {
  assert.equal(formatVolume('(1) (2)'), '(1) (2)');
  assert.equal(formatVolume('v.(3)'), 'v.(3)');
});

test('returns an empty string for an empty volume', () => {
  assert.equal(formatVolume('  '), '');
});

test('joins trimmed non-empty volume array parts', () => {
  assert.equal(formatVolume([' (35) ', '', ' v.2 ']), '(35) v.2');
});

test('reports volumes when at least one holding has a formatted volume', () => {
  assert.equal(hasVolumes([{ volume: [] }, { volume: ['  ', '(35)'] }]), true);
});

test('reports no volumes when no holding has a formatted volume', () => {
  assert.equal(hasVolumes([{ volume: null }, { volume: '  ' }, {}]), false);
});

test('reports no volumes for missing or empty holdings', () => {
  assert.equal(hasVolumes([]), false);
  assert.equal(hasVolumes(null), false);
  assert.equal(hasVolumes(undefined), false);
});
