const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { renderToStaticMarkup } = require('react-dom/server');
const { transform } = require('next/dist/build/swc');

async function renderPanel(access) {
  const filename = path.join(__dirname, 'RecordAccessPanel.js');
  assert.equal(fs.existsSync(filename), true, 'RecordAccessPanel.js must be implemented');
  const { code } = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  });
  const React = require('react');
  const requireModule = createRequire(filename);
  const exports = {};
  const mockModules = {
    '../styles/RecordAccessPanel.module.css': { panel: 'panel', heading: 'heading', openAccess: 'open-access', link: 'link' },
    './RecordAvailability': ({ id }) => React.createElement('span', { 'data-folio-id': id }, 'holdings table'),
  };

  vm.runInNewContext(code, {
    exports,
    require: name => mockModules[name] || requireModule(name),
  });

  return renderToStaticMarkup(React.createElement(exports.default, { access }));
}

test('renders an accessible online link and an open-access text status', async () => {
  const markup = await renderPanel({
    type: 'online',
    url: 'https://library.oapen.org/book/123',
    label: 'Read at OAPEN',
    openAccess: true,
  });

  assert.match(markup, /<section[^>]*aria-labelledby=/);
  assert.match(markup, /<h[1-6][^>]*>.*<span aria-hidden="true">📍<\/span> Availability<\/h[1-6]>/);
  assert.match(markup, /Open access: free to read/);
  assert.match(markup, /<a[^>]*href="https:\/\/library\.oapen\.org\/book\/123"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(markup, /Read at OAPEN<span class="visually-hidden"> \(opens in a new tab\)<\/span>/);
});

test('renders the EBSCO Discovery destination with a standalone label', async () => {
  const markup = await renderPanel({
    type: 'discovery',
    url: 'https://search.ebscohost.com/record/123',
    openAccess: true,
  });

  assert.match(markup, /Check access in EBSCO Discovery/);
  assert.match(markup, /Open access: free to read/);
  assert.match(markup, /target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(markup, /opens in a new tab/);
});

test('passes the parsed FOLIO ID to the holdings table', async () => {
  const markup = await renderPanel({ type: 'holdings', folioId: '123e4567-e89b-12d3-a456-426614174000' });

  assert.match(markup, /data-folio-id="123e4567-e89b-12d3-a456-426614174000"/);
});

test('renders no section when access is unavailable or unrecognized', async () => {
  for (const access of [{ type: 'none' }, { type: 'unknown' }, null]) {
    assert.equal(await renderPanel(access), '');
  }
});

test('provides a visible keyboard focus indicator for access links', () => {
  const stylePath = path.join(__dirname, '../styles/RecordAccessPanel.module.css');
  assert.equal(fs.existsSync(stylePath), true, 'RecordAccessPanel.module.css must be implemented');
  const styles = fs.readFileSync(stylePath, 'utf8');

  assert.match(styles, /\.link:focus-visible\s*\{[^}]*outline:/s);
});
