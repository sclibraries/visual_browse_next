const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { renderToStaticMarkup } = require('react-dom/server');
const { transform } = require('next/dist/build/swc');

async function renderFacets(materialType, facetValues) {
  const filename = path.join(__dirname, 'Facets.js');
  const { code } = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  });
  const requireModule = createRequire(filename);
  const exports = {};
  const mockModules = {
    'next/router': { useRouter: () => ({ pathname: '/all' }) },
    'react-select': { default: () => null },
    '../store/store': {
      useStore: (selector) => selector({ bookSubjectHeadings: [], comicSubjectHeadings: [] }),
    },
  };

  vm.runInNewContext(code, {
    exports,
    require: (name) => mockModules[name] || requireModule(name),
  });

  const React = require('react');
  const markup = renderToStaticMarkup(React.createElement(exports.default, {
    materialType,
    appliedFacets: [{
      FacetValuesWithAction: facetValues.map((value) => ({
        FacetValue: { Value: value },
        RemoveAction: `remove-${value}`,
      })),
    }],
  }));

  return [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
    .map((match) => ({ attributes: match[1], content: match[2] }));
}

test('hides each page default SourceType while keeping ContentProvider removable', async () => {
  const providerValues = ['OAPEN', 'Five Colleges Catalog'];
  const cases = [
    { materialType: 'All', scopeValues: ['Books', 'eBooks', 'Videos', 'Audio', 'Music Scores', 'Archival Materials', 'Non-Print Resources'] },
    { materialType: 'Book', scopeValues: ['Books', 'eBooks'] },
    { materialType: 'Movie', scopeValues: ['Videos'] },
  ];

  for (const { materialType, scopeValues } of cases) {
    const buttons = await renderFacets(materialType, [...scopeValues, ...providerValues]);

    for (const value of scopeValues) {
      assert.equal(buttons.some(({ content }) => content.includes(value)), false, `${materialType} hides ${value}`);
    }
    for (const value of providerValues) {
      const providerButton = buttons.find(({ content }) => content.includes(value));

      assert.ok(providerButton, `${materialType} keeps ${value}`);
      assert.match(providerButton.attributes, new RegExp(`aria-label="Remove filter: ${value}"`));
      assert.doesNotMatch(providerButton.attributes, /disabled/);
    }
  }
});

test('keeps an out-of-scope SourceType removable on the Books page', async () => {
  const buttons = await renderFacets('Book', ['Videos']);
  const videoButton = buttons.find(({ content }) => content.includes('Videos'));

  assert.match(videoButton.attributes, /aria-label="Remove filter: Videos"/);
  assert.doesNotMatch(videoButton.attributes, /disabled/);
  assert.match(videoButton.attributes, /class="btn btn-outline-secondary"/);
});

test('keeps decorative remove icons out of the accessibility tree', async () => {
  const buttons = await renderFacets('All', ['OAPEN']);
  const removableButton = buttons.find(({ content }) => content.includes('OAPEN'));

  assert.match(removableButton.attributes, /type="button"/);
  assert.match(removableButton.content, /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
});
