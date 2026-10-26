const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { renderToStaticMarkup } = require('react-dom/server');
const { transform } = require('next/dist/build/swc');

async function renderFacets() {
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
    materialType: 'All',
    appliedFacets: [{
      FacetValuesWithAction: [
        { FacetValue: { Value: 'Books' }, RemoveAction: 'remove-books' },
        { FacetValue: { Value: 'OAPEN' }, RemoveAction: 'remove-oapen' },
        { FacetValue: { Value: 'Five Colleges Catalog' }, RemoveAction: 'remove-catalog' },
      ],
    }],
  }));

  return [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
    .map((match) => ({ attributes: match[1], content: match[2] }));
}

test('gives locked and removable facet chips descriptive accessible names', async () => {
  const buttons = await renderFacets();
  const lockedButton = buttons.find(({ content }) => content.includes('Books'));
  const removableButton = buttons.find(({ content }) => content.includes('OAPEN'));
  const providerButton = buttons.find(({ content }) => content.includes('Five Colleges Catalog'));

  assert.match(lockedButton.attributes, /type="button"/);
  assert.match(removableButton.attributes, /type="button"/);
  assert.match(lockedButton.attributes, /disabled/);
  assert.match(lockedButton.attributes, /aria-label="Books \(always applied on this page\)"/);
  assert.match(removableButton.attributes, /aria-label="Remove filter: OAPEN"/);
  assert.match(providerButton.attributes, /aria-label="Remove filter: Five Colleges Catalog"/);
  assert.match(removableButton.attributes, /class="btn btn-outline-secondary"/);
});

test('keeps decorative remove icons out of the accessibility tree', async () => {
  const buttons = await renderFacets();
  const removableButton = buttons.find(({ content }) => content.includes('OAPEN'));

  assert.match(removableButton.content, /<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
});
