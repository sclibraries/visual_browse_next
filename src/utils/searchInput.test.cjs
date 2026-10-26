const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

function loadSearchInput() {
  const utilityPath = path.join(__dirname, 'searchInput.cjs');
  assert.ok(fs.existsSync(utilityPath), 'searchInput.cjs must be implemented');
  return require(utilityPath);
}

test('normalizes DOI links and trims other search input', () => {
  const { normalizeSearchInput } = loadSearchInput();
  const doi = '10.3998/mpub.11602090';

  const cases = [
    [`https://doi.org/${doi}`, doi],
    [`http://dx.doi.org/${doi}`, doi],
    [`http://doi.org/${doi}`, doi],
    [`https://dx.doi.org/${doi}`, doi],
    [`ftp://doi.org/${doi}`, doi],
    [`ftp://dx.doi.org/${doi}`, doi],
    [`DOI:${doi}`, doi],
    [` HTTPS://DX.DOI.ORG/${doi} `, doi],
    [doi, doi],
    [' title search ', 'title search'],
    ['https://doi.org/not-a-doi', 'https://doi.org/not-a-doi'],
    ['https://example.org/10.3998/mpub.11602090', 'https://example.org/10.3998/mpub.11602090'],
  ];

  for (const [input, expected] of cases) {
    assert.equal(normalizeSearchInput(input), expected, `input: ${input}`);
  }
});

test('normalizes URL search parameters and preserves encoded query text', () => {
  const { searchFromUrlParam } = loadSearchInput();
  assert.equal(typeof searchFromUrlParam, 'function');

  const doi = '10.3998/mpub.11602090';
  assert.deepEqual(searchFromUrlParam(encodeURIComponent(`https://doi.org/${doi}`)), {
    query: encodeURIComponent(doi),
    searchValue: doi,
  });
  assert.deepEqual(searchFromUrlParam('Pride%20%26%20Prejudice'), {
    query: 'Pride%20%26%20Prejudice',
    searchValue: 'Pride & Prejudice',
  });
});
