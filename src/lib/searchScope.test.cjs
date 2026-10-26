const test = require('node:test');
const assert = require('node:assert/strict');

const {
  LIBRARY_COLLECTION_LIMITER,
  SOURCE_TYPES_BY_PAGE,
  buildScopedSearch,
} = require('./searchScope.cjs');

const expectedScopes = {
  all: 'addfacetfilter(SourceType:Books,SourceType:eBooks,SourceType:Videos,SourceType:Audio,SourceType:Music Scores,SourceType:Archival Materials,SourceType:Non-Print Resources)',
  books: 'addfacetfilter(SourceType:Books,SourceType:eBooks)',
  movies: 'addfacetfilter(SourceType:Videos)',
};

test('exports the agreed SourceType lists for each search page', () => {
  assert.deepEqual(SOURCE_TYPES_BY_PAGE, {
    all: ['Books', 'eBooks', 'Videos', 'Audio', 'Music Scores', 'Archival Materials', 'Non-Print Resources'],
    books: ['Books', 'eBooks'],
    movies: ['Videos'],
  });
});

test('builds each page scope with the library collection limiter and no provider allow-list', async (t) => {
  for (const [page, action] of Object.entries(expectedScopes)) {
    await t.test(page, () => {
      const scope = buildScopedSearch(page);

      assert.deepEqual(scope, { action, limiter: 'FT1:y' });
      assert.equal(scope.limiter, LIBRARY_COLLECTION_LIMITER);
      assert.doesNotMatch(scope.action, /ContentProvider:/);
    });
  }
});
