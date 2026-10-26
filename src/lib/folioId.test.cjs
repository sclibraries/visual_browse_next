const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const modulePath = path.join(__dirname, 'folioId.cjs');
const folioId = fs.existsSync(modulePath) ? require(modulePath) : {};
const FOLIO_AN = 'scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.123e4567.e89b.12d3.a456.426614174000';

test('recognizes a FOLIO EDS an and rejects other identifiers', () => {
  assert.equal(typeof folioId.isFolioAn, 'function');
  assert.equal(folioId.isFolioAn(FOLIO_AN), true);
  assert.equal(folioId.isFolioAn('edsoap.20.500.12657.117639'), false);
  assert.equal(folioId.isFolioAn(null), false);
});

test('converts the dotted FOLIO identifier suffix to a dashed UUID', () => {
  assert.equal(typeof folioId.folioIdFromAn, 'function');
  assert.equal(folioId.folioIdFromAn(FOLIO_AN), '123e4567-e89b-12d3-a456-426614174000');
  assert.equal(folioId.folioIdFromAn('123e4567-e89b-12d3-a456-426614174000'), '123e4567-e89b-12d3-a456-426614174000');
  assert.equal(folioId.folioIdFromAn('edsoap.20.500.12657.117639'), '');
});
