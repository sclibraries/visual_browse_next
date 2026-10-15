const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildFacetOptions,
  getAppliedFilterOptions,
  getSelectedFacetOptions,
  isDeferredFacet,
  mergeFacetOptions,
  mergeFacetValuePages,
  orderCollectionFacets,
  splitFacetControls,
} = require('./collectionFacets.cjs');

test('orderCollectionFacets applies configured labels and preserves remainder order', () => {
  const facets = [
    { field: 'campus', label: 'Campus', values: [{ value: 'Amherst', count: 10 }] },
    { field: 'genre', label: 'Genre', values: [{ value: 'Jazz', count: 8 }] },
    { field: 'language', label: 'Language', values: [{ value: 'English', count: 7 }] },
  ];
  const config = [
    { field: 'genre', label: 'Music Genre', expanded: true },
    { field: 'campus', label: 'Owning Campus', expanded: false },
  ];

  const ordered = orderCollectionFacets(facets, config);

  assert.deepEqual(
    ordered.map((facet) => ({ field: facet.field, label: facet.label, expanded: facet.expanded })),
    [
      { field: 'genre', label: 'Music Genre', expanded: true },
      { field: 'campus', label: 'Owning Campus', expanded: false },
      { field: 'language', label: 'Language', expanded: true },
    ],
  );
});

test('splitFacetControls keeps high-cardinality audio contributor facets out of the primary row', () => {
  const heavyValues = Array.from({ length: 600 }, (_, index) => ({
    value: `Artist ${index}`,
    label: `Artist ${index}`,
    count: 1,
  }));
  const orderedFacets = [
    { field: 'genre', label: 'Genre', values: [{ value: 'Jazz', count: 10 }] },
    { field: 'contributors', label: 'Performer', values: heavyValues },
    { field: 'campus', label: 'Campus', values: [{ value: 'Amherst', count: 9 }] },
    { field: 'language', label: 'Language', values: [{ value: 'English', count: 8 }] },
  ];

  const { primaryFacets, additionalFacets } = splitFacetControls(orderedFacets, 'audio-cds');

  assert.deepEqual(primaryFacets.map((facet) => facet.field), ['genre', 'campus', 'language']);
  assert.deepEqual(additionalFacets.map((facet) => facet.field), ['contributors']);
});

test('splitFacetControls keeps deferred contributor facets visible even before values are loaded', () => {
  const orderedFacets = [
    { field: 'genre', label: 'Genre', values: [{ value: 'Jazz', count: 10 }] },
    { field: 'contributor', label: 'Contributor', values: [], requiresQuery: true, supportsSearch: true },
    { field: 'campusName', label: 'Campus', values: [{ value: 'Amherst', count: 9 }] },
  ];

  const { primaryFacets, additionalFacets } = splitFacetControls(orderedFacets, 'audio-cds');
  const visibleFields = [...primaryFacets, ...additionalFacets].map((facet) => facet.field);

  assert.deepEqual(visibleFields, ['genre', 'contributor', 'campusName']);
});

test('buildFacetOptions limits large facets until the user searches', () => {
  const facet = {
    field: 'contributors',
    label: 'Performer',
    values: Array.from({ length: 400 }, (_, index) => ({
      value: `Artist ${index}`,
      label: `Artist ${index}`,
      count: index + 1,
    })),
  };

  const initialOptions = buildFacetOptions(facet, '', 25);
  const filteredOptions = buildFacetOptions(facet, 'Artist 39', 25);

  assert.equal(initialOptions.length, 25);
  assert.equal(filteredOptions.length, 11);
  assert.equal(filteredOptions[0].value, 'Artist 39');
});

test('getSelectedFacetOptions preserves labels for selected values and falls back when missing', () => {
  const facet = {
    field: 'genre',
    label: 'Genre',
    values: [
      { value: 'jazz', label: 'Jazz', count: 12 },
      { value: 'folk', label: 'Folk', count: 4 },
    ],
  };

  const options = getSelectedFacetOptions(facet, ['folk', 'missing']);

  assert.deepEqual(options, [
    { value: 'folk', label: 'Folk (4)' },
    { value: 'missing', label: 'missing' },
  ]);
});

test('mergeFacetOptions keeps selected hidden values visible without duplicating options', () => {
  const merged = mergeFacetOptions(
    [
      { value: 'organ-masses', label: 'Organ Masses (19)' },
      { value: 'folk', label: 'Folk (4)' },
    ],
    [
      { value: 'folk', label: 'Folk (4)' },
      { value: 'jazz', label: 'Jazz (12)' },
    ],
  );

  assert.deepEqual(merged, [
    { value: 'organ-masses', label: 'Organ Masses (19)' },
    { value: 'folk', label: 'Folk (4)' },
    { value: 'jazz', label: 'Jazz (12)' },
  ]);
});

test('isDeferredFacet only treats requiresQuery facets as deferred', () => {
  assert.equal(isDeferredFacet({ field: 'contributor', requiresQuery: true, supportsSearch: true }), true);
  assert.equal(isDeferredFacet({ field: 'genreTerm', truncated: true, requiresQuery: false }), false);
  assert.equal(isDeferredFacet({ field: 'subject', values: [] }), false);
});

test('getAppliedFilterOptions uses applied filter labels and falls back to plain values', () => {
  const options = getAppliedFilterOptions(
    [
      { field: 'contributor', value: 'bach', label: 'Bach, Johann Sebastian, 1685-1750' },
      { field: 'contributor', value: 'mozart', label: 'Mozart, Wolfgang Amadeus, 1756-1791' },
      { field: 'genreTerm', value: 'masses', label: 'Masses' },
    ],
    'contributor',
    ['bach', 'missing'],
  );

  assert.deepEqual(options, [
    { value: 'bach', label: 'Bach, Johann Sebastian, 1685-1750' },
    { value: 'missing', label: 'missing' },
  ]);
});

test('mergeFacetValuePages appends unique facet values across pages', () => {
  const merged = mergeFacetValuePages(
    [
      { value: 'bach', label: 'Bach', count: 12 },
      { value: 'mozart', label: 'Mozart', count: 9 },
    ],
    [
      { value: 'mozart', label: 'Mozart', count: 9 },
      { value: 'beethoven', label: 'Beethoven', count: 7 },
    ],
  );

  assert.deepEqual(merged, [
    { value: 'bach', label: 'Bach', count: 12 },
    { value: 'mozart', label: 'Mozart', count: 9 },
    { value: 'beethoven', label: 'Beethoven', count: 7 },
  ]);
});