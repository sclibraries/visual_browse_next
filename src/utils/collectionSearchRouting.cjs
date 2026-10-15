const COLLECTION_PATHS = new Set([
  '/collections/[slug]',
  '/local-collections/collections/[collections]',
]);

const COLLECTION_SCOPE = {
  label: 'This Collection',
  icon: '🗂️',
  color: '#0f766e',
  limited: true,
};

const DEFAULT_SCOPE = {
  label: 'All Materials',
  icon: '🔍',
  color: '#10b981',
  limited: false,
};

const BOOKS_SCOPE = {
  label: 'Books Only',
  icon: '📚',
  color: '#8b5cf6',
  limited: true,
};

const MOVIES_SCOPE = {
  label: 'Movies Only',
  icon: '🎬',
  color: '#ef4444',
  limited: true,
};

const sanitizeScopedQuery = (query = {}) => {
  const nextQuery = { ...query };

  delete nextQuery.an;
  delete nextQuery.dbid;
  delete nextQuery.img;

  return nextQuery;
};

const withSearchParams = (query, searchValue, fieldCode) => {
  const nextQuery = sanitizeScopedQuery(query);

  nextQuery.search = encodeURIComponent(searchValue.trim());

  if (fieldCode) {
    nextQuery.fieldcode = fieldCode;
  } else {
    delete nextQuery.fieldcode;
  }

  return nextQuery;
};

const isCollectionScopedPath = (pathname = '') => COLLECTION_PATHS.has(pathname);

const buildSearchNavigation = ({ pathname = '', query = {}, searchValue = '', fieldCode = '' }) => {
  if (pathname === '/books' || pathname === '/movies' || isCollectionScopedPath(pathname)) {
    return {
      pathname,
      query: withSearchParams(query, searchValue, fieldCode),
    };
  }

  return {
    pathname: '/all',
    query: withSearchParams({}, searchValue, fieldCode),
  };
};

const buildSearchClearNavigation = ({ pathname = '', query = {} }) => {
  if (pathname === '/books' || pathname === '/movies' || pathname === '/all' || isCollectionScopedPath(pathname)) {
    const nextQuery = sanitizeScopedQuery(query);
    delete nextQuery.search;
    delete nextQuery.fieldcode;

    return {
      pathname,
      query: nextQuery,
    };
  }

  return {
    pathname,
    query: sanitizeScopedQuery(query),
  };
};

const getSearchScope = (pathname = '') => {
  if (pathname === '/books') {
    return BOOKS_SCOPE;
  }

  if (pathname === '/movies') {
    return MOVIES_SCOPE;
  }

  if (isCollectionScopedPath(pathname)) {
    return COLLECTION_SCOPE;
  }

  return DEFAULT_SCOPE;
};

module.exports = {
  buildSearchNavigation,
  buildSearchClearNavigation,
  getSearchScope,
  isCollectionScopedPath,
};