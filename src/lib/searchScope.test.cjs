const test = require('node:test');
const assert = require('node:assert/strict');

const {
  LIBRARY_COLLECTION_LIMITER,
  buildScopedSearch,
  isScopeValue,
} = require('./searchScope.cjs');

const expectedScopes = {
  all: 'addfacetfilter(SourceType:Books,SourceType:eBooks,SourceType:Videos,SourceType:Audio,SourceType:Music Scores,SourceType:Archival Materials,SourceType:Non-Print Resources)',
  books: 'addfacetfilter(SourceType:Books,SourceType:eBooks)',
  movies: 'addfacetfilter(SourceType:Videos)',
};

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

test('locks every SourceType that defines each page scope, but not ContentProvider values', async (t) => {
  const sourceTypesByPage = {
    all: ['Books', 'eBooks', 'Videos', 'Audio', 'Music Scores', 'Archival Materials', 'Non-Print Resources'],
    books: ['Books', 'eBooks'],
    movies: ['Videos'],
  };

  for (const [page, sourceTypes] of Object.entries(sourceTypesByPage)) {
    await t.test(page, () => {
      for (const sourceType of sourceTypes) {
        assert.equal(isScopeValue(page, sourceType), true, `${sourceType} should be locked on ${page}`);
      }
      assert.equal(isScopeValue(page, 'Five Colleges Catalog'), false);
    });
  }
});
