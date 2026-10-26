const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { transform } = require('next/dist/build/swc');

test('derives open access from record rights and renders accessible badges', async () => {
  const filename = path.join(__dirname, 'RecordBadges.js');
  const { code } = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' }
  });
  const exports = {};
  vm.runInNewContext(code, { exports, require: createRequire(filename) });
  const RecordBadges = exports.default;
  const oapenRecord = {
    pubType: 'eBook',
    items: [{
      name: 'Field 540',
      label: 'Rights',
      data: [
        'Attribution-NonCommercial 4.0 International',
        'URL: https://creativecommons.org/licenses/by-nc/4.0/',
      ],
    }],
  };

  for (const imageItem of ['', 'cover.jpg']) {
    const html = renderToStaticMarkup(React.createElement(RecordBadges, {
      record: { ...oapenRecord, imageItem },
    }));
    assert.match(html, /E-BOOK/);
    assert.match(html, /OPEN ACCESS/);
    assert.match(html, /role="group"[^>]*aria-label="Format and access"/);
    assert.doesNotMatch(html, /not in the physical exhibit/i);
  }

  assert.equal(renderToStaticMarkup(React.createElement(RecordBadges, { record: { pubType: 'Book' } })), '');

  const licensedEbook = renderToStaticMarkup(React.createElement(RecordBadges, {
    record: {
      pubType: 'eBook',
      items: [{ name: 'Rights', data: ['Copyright © 2021 Example Press. All rights reserved.'] }],
    },
  }));
  assert.match(licensedEbook, /E-BOOK/);
  assert.doesNotMatch(licensedEbook, /OPEN ACCESS/);

  const openArticle = renderToStaticMarkup(React.createElement(RecordBadges, {
    record: {
      pubType: 'Article',
      items: [{ name: 'Rights', data: ['Creative Commons CC BY 4.0'] }],
    },
  }));
  assert.match(openArticle, /OPEN ACCESS/);
  assert.doesNotMatch(openArticle, /E-BOOK/);
});
