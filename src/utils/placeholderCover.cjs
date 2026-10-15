const DEFAULT_PLACEHOLDER = {
  icon: '📚',
  message: 'No cover available',
  ariaLabel: 'No cover available',
};

const PLACEHOLDER_BY_KIND = {
  audio: {
    icon: '💿',
    message: 'No cover available',
    ariaLabel: 'No cover available',
  },
  video: {
    icon: '🎬',
    message: 'No cover available',
    ariaLabel: 'No cover available',
  },
  image: {
    icon: '🖼️',
    message: 'No cover available',
    ariaLabel: 'No cover available',
  },
  map: {
    icon: '🗺️',
    message: 'No cover available',
    ariaLabel: 'No cover available',
  },
  digital: {
    icon: '💻',
    message: 'No cover available',
    ariaLabel: 'No cover available',
  },
  score: {
    icon: '🎼',
    message: 'No cover available',
    ariaLabel: 'No cover available',
  },
};

const matchesPattern = (value, patterns) => patterns.some((pattern) => pattern.test(value));

const getPlaceholderKind = ({ materialType = '', pubType = '', collectionSlug = '' }) => {
  const searchableText = [materialType, pubType, collectionSlug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!searchableText) {
    return 'book';
  }

  if (matchesPattern(searchableText, [/audio/, /audiobook/, /\bcd\b/, /music/, /sound/])) {
    return 'audio';
  }

  if (matchesPattern(searchableText, [/video/, /movie/, /dvd/, /film/, /streaming/])) {
    return 'video';
  }

  if (matchesPattern(searchableText, [/image/, /photo/, /photograph/, /art/])) {
    return 'image';
  }

  if (matchesPattern(searchableText, [/map/, /atlas/])) {
    return 'map';
  }

  if (matchesPattern(searchableText, [/ebook/, /electronic resource/, /computer file/, /software/])) {
    return 'digital';
  }

  if (matchesPattern(searchableText, [/score/])) {
    return 'score';
  }

  return 'book';
};

const getPlaceholderCoverConfig = (input = {}) => {
  const kind = getPlaceholderKind(input);

  return PLACEHOLDER_BY_KIND[kind] || DEFAULT_PLACEHOLDER;
};

module.exports = {
  getPlaceholderCoverConfig,
  getPlaceholderKind,
};