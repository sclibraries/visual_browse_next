const test = require('node:test');
const assert = require('node:assert/strict');

const { getPlaceholderCoverConfig } = require('./placeholderCover.cjs');

test('uses an audio placeholder for audio collections even when record type is missing', () => {
  assert.deepEqual(
    getPlaceholderCoverConfig({ collectionSlug: 'audio-cds' }),
    {
      icon: '💿',
      message: 'No cover available',
      ariaLabel: 'No cover available',
    }
  );
});

test('uses an audio placeholder for audio records', () => {
  assert.deepEqual(
    getPlaceholderCoverConfig({ materialType: 'Audio CD' }),
    {
      icon: '💿',
      message: 'No cover available',
      ariaLabel: 'No cover available',
    }
  );
});

test('uses a video placeholder for streaming collections', () => {
  assert.deepEqual(
    getPlaceholderCoverConfig({ collectionSlug: 'swank-streaming' }),
    {
      icon: '🎬',
      message: 'No cover available',
      ariaLabel: 'No cover available',
    }
  );
});

test('falls back to a book placeholder when no stronger hint exists', () => {
  assert.deepEqual(
    getPlaceholderCoverConfig({ materialType: 'Book' }),
    {
      icon: '📚',
      message: 'No cover available',
      ariaLabel: 'No cover available',
    }
  );
});