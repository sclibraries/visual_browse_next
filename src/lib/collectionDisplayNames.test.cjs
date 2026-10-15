const test = require('node:test');
const assert = require('node:assert/strict');

const { getCollectionDisplayName } = require('./collectionDisplayNames.cjs');

test('returns configured display name for known shared collection slugs', () => {
  assert.equal(getCollectionDisplayName('audio-cds'), 'Music CDs');
  assert.equal(getCollectionDisplayName('new-burack'), 'New Fiction / Non-Fiction');
});

test('returns configured display name even when a fallback title is provided', () => {
  assert.equal(getCollectionDisplayName('audio-cds', 'Audio Cds'), 'Music CDs');
});

test('falls back to the provided fallback title for unknown slugs', () => {
  assert.equal(getCollectionDisplayName('unknown-collection', 'Unknown Collection'), 'Unknown Collection');
});

test('returns empty string when no slug or fallback is provided', () => {
  assert.equal(getCollectionDisplayName(''), '');
});