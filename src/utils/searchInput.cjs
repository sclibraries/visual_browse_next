const DOI_REFERENCE = /^(?:[a-z][a-z\d+.-]*:\/\/(?:dx\.)?doi\.org\/|doi:)(10\..*)$/i;

function normalizeSearchInput(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  const doiMatch = trimmedValue.match(DOI_REFERENCE);

  return doiMatch ? doiMatch[1] : trimmedValue;
}

function searchFromUrlParam(param) {
  const searchValue = normalizeSearchInput(decodeURIComponent(param));

  return {
    query: encodeURIComponent(searchValue),
    searchValue,
  };
}

module.exports = { normalizeSearchInput, searchFromUrlParam };
