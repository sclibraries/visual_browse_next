const assert = require('node:assert/strict');
const { test } = require('node:test');

let formatCallNumber;
try {
  ({ formatCallNumber } = require('./callNumber.cjs'));
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND' || !error.message.includes('./callNumber.cjs')) {
    throw error;
  }
}

function format(...args) {
  assert.equal(typeof formatCallNumber, 'function', 'callNumber.cjs must export formatCallNumber');
  return formatCallNumber(...args);
}

test('appends the FOLIO volume to the owner example', () => {
  assert.equal(
    format('TREASURE CASES M2 .D62', '(35)'),
    'TREASURE CASES M2 .D62 (35)'
  );
});

test('trims and joins array parts from the call number and volume', () => {
  assert.equal(
    format([' TREASURE CASES ', 'M2 .D62 '], ['', '(35)', ' ']),
    'TREASURE CASES M2 .D62 (35)'
  );
});

test('returns the call number when the volume is missing or empty', () => {
  assert.equal(format('M2 .D62', null), 'M2 .D62');
  assert.equal(format('M2 .D62', '  '), 'M2 .D62');
});

test('adds a volume without parentheses as FOLIO sends it', () => {
  assert.equal(format('M2 .D62', 'v.2'), 'M2 .D62 v.2');
});

test('does not append a volume already at the end of the call number', () => {
  assert.equal(format('M2 .D62 (12)', '(12)'), 'M2 .D62 (12)');
});

test('returns an empty string when both inputs contain no parts', () => {
  assert.equal(format([], [null, '', '  ']), '');
});
