const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { renderToStaticMarkup } = require('react-dom/server');
const { transform } = require('next/dist/build/swc');

async function renderAvailability(id) {
  const filename = path.join(__dirname, 'RecordAvailability.js');
  const { code } = await transform(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' },
  });
  const React = require('react');
  const requireModule = createRequire(filename);
  const exports = {};
  let queryOptions;
  const mockModules = {
    '@apollo/client': {
      useQuery: (_query, options) => {
        queryOptions = options;
        return { data: { foliortac: { holding: [] } }, loading: false, error: null };
      },
    },
    '../lib/api': { FOLIORTAC: {} },
  };

  vm.runInNewContext(code, {
    exports,
    require: name => mockModules[name] || requireModule(name),
  });

  return {
    markup: renderToStaticMarkup(React.createElement(exports.default, { id })),
    queryOptions,
  };
}

test('queries holdings with the dashed FOLIO ID supplied by the access panel', async () => {
  const folioId = '123e4567-e89b-12d3-a456-426614174000';
  const { markup, queryOptions } = await renderAvailability(folioId);

  assert.equal(queryOptions.skip, false);
  assert.equal(queryOptions.variables.id, folioId);
  assert.match(markup, /No holdings information available/);
});

test('still converts a full FOLIO EDS an before querying holdings', async () => {
  const an = 'scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.123e4567.e89b.12d3.a456.426614174000';
  const { queryOptions } = await renderAvailability(an);

  assert.equal(queryOptions.skip, false);
  assert.equal(queryOptions.variables.id, '123e4567-e89b-12d3-a456-426614174000');
});

test('does not query or render holdings for a non-FOLIO identifier', async () => {
  const { markup, queryOptions } = await renderAvailability('edsoap.20.500.12657.117639');

  assert.equal(queryOptions.skip, true);
  assert.equal(markup, '');
});
