const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildSearchNavigation,
  buildSearchClearNavigation,
  getSearchScope,
} = require('./collectionSearchRouting.cjs');

test('keeps shared collection searches on the current collection route', () => {
  assert.deepEqual(
    buildSearchNavigation({
      pathname: '/collections/[slug]',
      query: { slug: 'audio-cds', an: '123', dbid: 'cat', img: 'cover.jpg' },
      searchValue: 'miles davis',
      fieldCode: 'TI',
    }),
    {
      pathname: '/collections/[slug]',
      query: {
        slug: 'audio-cds',
        search: 'miles%20davis',
        fieldcode: 'TI',
      },
    }
  );
});

test('keeps local collection searches on the current collection route', () => {
  assert.deepEqual(
    buildSearchNavigation({
      pathname: '/local-collections/collections/[collections]',
      query: { collections: 'fiction-nonfiction' },
      searchValue: 'octavia butler',
      fieldCode: '',
    }),
    {
      pathname: '/local-collections/collections/[collections]',
      query: {
        collections: 'fiction-nonfiction',
        search: 'octavia%20butler',
      },
    }
  );
});

test('sends non-scoped routes to all materials search', () => {
  assert.deepEqual(
    buildSearchNavigation({
      pathname: '/',
      query: {},
      searchValue: 'jazz',
      fieldCode: 'SU',
    }),
    {
      pathname: '/all',
      query: {
        search: 'jazz',
        fieldcode: 'SU',
      },
    }
  );
});

test('reports collection scope for collection routes', () => {
  assert.deepEqual(
    getSearchScope('/collections/[slug]'),
    { label: 'This Collection', icon: '🗂️', color: '#0f766e', limited: true }
  );
});

test('clearing search on a collection route removes search-only params but keeps the collection context', () => {
  assert.deepEqual(
    buildSearchClearNavigation({
      pathname: '/collections/[slug]',
      query: { slug: 'audio-cds', search: 'jazz', fieldcode: 'TI', an: '123', dbid: 'cat' },
    }),
    {
      pathname: '/collections/[slug]',
      query: { slug: 'audio-cds' },
    }
  );
});