const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { transform } = require('next/dist/build/swc');

test('renders independent ebook and open-access badges with or without a cover', async () => {
  const filename = path.join(__dirname, 'RecordBadges.js');
  const { code } = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' }
  });
  const exports = {};
  vm.runInNewContext(code, { exports, require: createRequire(filename) });
  const RecordBadges = exports.default;
  for (const imageItem of ['', 'cover.jpg']) {
    const html = renderToStaticMarkup(React.createElement(RecordBadges, {
      record: { pubType: 'eBook', imageItem }, isOpenAccess: true
    }));
    assert.match(html, /E-BOOK/);
    assert.match(html, /OPEN ACCESS/);
    assert.doesNotMatch(html, /not in the physical exhibit/i);
  }
  assert.equal(renderToStaticMarkup(React.createElement(RecordBadges, { record: { pubType: 'Book' } })), '');
  const openArticle = renderToStaticMarkup(React.createElement(RecordBadges, { record: { pubType: 'Article', pdf: true }, isOpenAccess: true }));
  assert.match(openArticle, /OPEN ACCESS/);
  assert.doesNotMatch(openArticle, /E-BOOK/);
});
