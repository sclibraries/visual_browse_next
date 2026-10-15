const COLLECTION_DISPLAY_NAMES = {
  'audio-cds': 'Audio CDs',
  'new-burack': 'New Fiction / Non-Fiction',
  'swank-streaming': 'Swank Streaming Videos',
};

const getCollectionDisplayName = (slug, fallback = '') => {
  if (!slug) {
    return fallback || '';
  }

  return COLLECTION_DISPLAY_NAMES[slug] || fallback || '';
};

module.exports = {
  COLLECTION_DISPLAY_NAMES,
  getCollectionDisplayName,
};