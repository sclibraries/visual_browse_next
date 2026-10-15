const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { transform } = require('next/dist/build/swc');

test('caps enlargement using intrinsic dimensions and resets sizing for a replacement image', async () => {
  const filename = path.join(__dirname, 'RecordCoverImage.js');
  const { code } = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' }
  });
  let state = null;
  const requireModule = createRequire(filename);
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name === 'react'
    ? { useState: () => [state, value => { state = value; }] }
    : requireModule(name) });
  const render = src => exports.default({ src, alt: 'Book title page' });
  let frame = render('scan.jpg');
  let img = frame.props.children;
  assert.equal(img.props.alt, 'Book title page');
  assert.equal(img.props.style.width, 'auto');
  img.props.onLoad({ currentTarget: { naturalWidth: 51, naturalHeight: 80 } });
  img = render('scan.jpg').props.children;
  assert.equal(img.props.style.width, 102);
  assert.equal(img.props.style.height, 160);
  assert.equal(img.props.style.objectFit, 'contain');
  assert.equal(img.props.style.maxWidth, '100%');
  assert.equal(img.props.style.maxHeight, '100%');
  img = render('uploaded-cover.jpg').props.children;
  assert.equal(img.props.style.width, 'auto', 'Previous scan must not constrain an uploaded cover');
  img.props.onLoad({ currentTarget: { naturalWidth: 600, naturalHeight: 900 } });
  img = render('uploaded-cover.jpg').props.children;
  assert.equal(img.props.style.width, 1200);
  assert.equal(img.props.style.height, 1800);
  frame = render('uploaded-cover.jpg');
  assert.equal(frame.props.style.alignItems, 'center');
  assert.equal(frame.props.style.justifyContent, 'center');
});
