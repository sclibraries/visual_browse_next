const LIBRARY_COLLECTION_LIMITER = 'FT1:y';

// Check these names against the SourceType facet in a live result before deploying.
const SOURCE_TYPES_BY_PAGE = {
  all: ['Books', 'eBooks', 'Videos', 'Audio', 'Music Scores', 'Archival Materials', 'Non-Print Resources'],
  books: ['Books', 'eBooks'],
  movies: ['Videos'],
};

function buildScopedSearch(page) {
  const sourceTypes = SOURCE_TYPES_BY_PAGE[page];
  if (!sourceTypes) {
    throw new Error(`Unsupported search page: ${page}`);
  }

  return {
    action: `addfacetfilter(${sourceTypes.map((sourceType) => `SourceType:${sourceType}`).join(',')})`,
    limiter: LIBRARY_COLLECTION_LIMITER,
  };
}

module.exports = {
  LIBRARY_COLLECTION_LIMITER,
  SOURCE_TYPES_BY_PAGE,
  buildScopedSearch,
};
