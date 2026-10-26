const DOI_REFERENCE = /^(?:[a-z][a-z\d+.-]*:\/\/(?:dx\.)?doi\.org\/|doi:)(10\..*)$/i;

function normalizeSearchInput(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  const doiMatch = trimmedValue.match(DOI_REFERENCE);

  return doiMatch ? doiMatch[1] : trimmedValue;
}

module.exports = { normalizeSearchInput };
