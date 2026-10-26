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
    dbid: 'cat09206a',
    record: { urlItem: ['https://example.edu/book'] },
  });

  assert.deepEqual(access, {
    type: 'holdings',
    folioId: '123e4567-e89b-12d3-a456-426614174000',
  });
});

test('uses the first usable CustomLink and marks known open-access databases', () => {
  const access = getAccess({
    an: 'edsoap.20.500.12657.117639',
    dbid: 'edsoap',
    record: {
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
    dbid: 'edscat',
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
    dbid: 'edscat',
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
    dbid: 'edscat',
    record: { pLink: 'https://search.ebscohost.com/login.aspx?direct=true&db=cat' },
  });

  assert.deepEqual(access, {
    type: 'discovery',
    url: 'https://search.ebscohost.com/login.aspx?direct=true&db=cat',
    openAccess: false,
  });
});

test('does not treat an open-access database with no direct URL as online', () => {
  const discovery = getAccess({
    an: 'edsoap.20.500.12657.117639',
    dbid: 'edsoap',
    record: { pLink: 'https://search.ebscohost.com/record/123' },
  });
  const none = getAccess({ an: 'edsoap.123', dbid: 'edsoap', record: {} });

  assert.equal(discovery.type, 'discovery');
  assert.equal(discovery.openAccess, true);
  assert.equal(none.type, 'none');
  assert.equal(none.openAccess, true);
});

test('returns none when no usable links exist', () => {
  assert.deepEqual(getAccess({
    an: 'edsbook.789',
    dbid: 'edscat',
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
