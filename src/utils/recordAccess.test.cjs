const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const modulePath = path.join(__dirname, 'recordAccess.cjs');
const recordAccess = fs.existsSync(modulePath) ? require(modulePath) : {};

function getAccess(input) {
  assert.equal(typeof recordAccess.getRecordAccess, 'function');
  return recordAccess.getRecordAccess(input);
}

test('uses the FOLIO holdings path before external record links', () => {
  const access = getAccess({
    an: 'scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.123e4567.e89b.12d3.a456.426614174000',
    record: { urlItem: ['https://example.edu/book'] },
  });

  assert.deepEqual(access, {
    type: 'holdings',
    folioId: '123e4567-e89b-12d3-a456-426614174000',
    openAccess: false,
  });
});

test('uses the first usable CustomLink and recognizes OAPEN rights evidence', () => {
  const access = getAccess({
    an: 'edsoap.20.500.12657.117639',
    record: {
      items: [{
        name: 'Rights',
        data: [
          'Attribution-NonCommercial 4.0 International',
          'URL: https://creativecommons.org/licenses/by-nc/4.0/',
        ],
      }],
      fullText: {
        CustomLinks: [
          { Name: 'Missing target', Url: 'javascript:blocked()' },
          { Name: 'Read at OAPEN', Url: 'https://library.oapen.org/book/123 Read full text' },
        ],
      },
    },
  });

  assert.deepEqual(access, {
    type: 'online',
    url: 'https://library.oapen.org/book/123',
    label: 'Read at OAPEN',
    openAccess: true,
  });
});

test('falls back to fullText links with the default access label', () => {
  const access = getAccess({
    an: 'edsarticle.123',
    record: { fullText: { Links: [{ Url: 'https://example.edu/full-text' }] } },
  });

  assert.deepEqual(access, {
    type: 'online',
    url: 'https://example.edu/full-text',
    label: 'Access online',
    openAccess: false,
  });
});

test('uses the first usable urlItem and strips trailing notes', () => {
  const access = getAccess({
    an: 'edsbook.123',
    record: { urlItem: ['Not a URL', 'https://example.edu/book Notes from EDS'] },
  });

  assert.equal(access.type, 'online');
  assert.equal(access.url, 'https://example.edu/book');
  assert.equal(access.label, 'Access online');
  assert.equal(access.openAccess, false);
});

test('uses the EBSCO Discovery link when no direct access URL is available', () => {
  const access = getAccess({
    an: 'edsbook.456',
    record: { pLink: 'https://search.ebscohost.com/login.aspx?direct=true&db=cat' },
  });

  assert.deepEqual(access, {
    type: 'discovery',
    url: 'https://search.ebscohost.com/login.aspx?direct=true&db=cat',
    openAccess: false,
  });
});

test('keeps record-based open access for discovery and missing links', () => {
  const rights = [{ name: 'Rights', data: ['Creative Commons CC BY 4.0'] }];
  const discovery = getAccess({
    an: 'edsoap.20.500.12657.117639',
    record: { items: rights, pLink: 'https://search.ebscohost.com/record/123' },
  });
  const none = getAccess({ an: 'edsoap.123', record: { items: rights } });

  assert.equal(discovery.type, 'discovery');
  assert.equal(discovery.openAccess, true);
  assert.equal(none.type, 'none');
  assert.equal(none.openAccess, true);
});

test('returns none when no usable links exist', () => {
  assert.deepEqual(getAccess({
    an: 'edsbook.789',
    record: {
      fullText: {
        CustomLinks: [{ Name: 'unsafe', Url: 'javascript:blocked()' }],
        Links: [{ Url: 'mailto:help@example.edu' }],
      },
      urlItem: ['not a url'],
      pLink: 'javascript:blocked()',
    },
  }), { type: 'none', openAccess: false });
});

test('cleans URL notes and safely handles missing or non-string values', () => {
  assert.equal(typeof recordAccess.cleanUrl, 'function');
  assert.equal(recordAccess.cleanUrl('https://example.edu/record Note'), 'https://example.edu/record');
  assert.equal(recordAccess.cleanUrl(' plain text '), 'plain text');
  assert.equal(recordAccess.cleanUrl(null), '');
});

test('recognizes open access from matching rights and copyright fields', () => {
  assert.equal(typeof recordAccess.isOpenAccess, 'function');
  assert.equal(recordAccess.isOpenAccess({
    items: [{ name: 'Rights', data: ['Attribution-NonCommercial 4.0 International'] }],
  }), true);
  assert.equal(recordAccess.isOpenAccess({
    items: [{ name: 'Copyright', data: ['Creative Commons public license'] }],
  }), true);
});

test('does not treat ordinary copyright as open access', () => {
  assert.equal(recordAccess.isOpenAccess({
    items: [{ name: 'Rights', data: ['Copyright © 2021 Example Press. All rights reserved.'] }],
  }), false);
  assert.equal(recordAccess.isOpenAccess({
    items: [{ name: 'Description', data: ['Open access resource'] }],
  }), false);
});

test('keeps the SeriesInfo open-access rule and defaults to false without evidence', () => {
  assert.equal(recordAccess.isOpenAccess({
    items: [{ name: 'SeriesInfo', data: ['Open Access collection'] }],
  }), true);
  assert.equal(recordAccess.isOpenAccess({ items: [] }), false);
  assert.equal(recordAccess.isOpenAccess({}), false);
});

test('recognizes a Rights label even when the field name differs', () => {
  assert.equal(recordAccess.isOpenAccess({
    items: [{ name: 'Field 938', label: 'Rights', data: ['Public domain'] }],
  }), true);
});

test('recognizes rights evidence from itemsRaw when items is absent', () => {
  assert.equal(recordAccess.isOpenAccess({
    itemsRaw: [{ name: 'Copyright', data: ['CC0'] }],
  }), true);
});

test('marks a FOLIO record with Creative Commons rights as open access', () => {
  const access = getAccess({
    an: 'scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.123e4567.e89b.12d3.a456.426614174000',
    record: { items: [{ name: 'Rights', data: ['Creative Commons Attribution 4.0'] }] },
  });

  assert.deepEqual(access, {
    type: 'holdings',
    folioId: '123e4567-e89b-12d3-a456-426614174000',
    openAccess: true,
  });
});
