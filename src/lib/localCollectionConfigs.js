export const LOCAL_COLLECTIONS_CONFIG = [
  {
    key: 'fiction-nonfiction',
    slug: 'new-burack',
    title: 'Fiction & Nonfiction (Burack Collection)',
    legacyPath: '/local-collections/collections/fiction-nonfiction/',
    v2Path: '/collections/new-burack',
    legacyLabel: 'Fiction Non-Fiction',
    v2Label: 'New Burack',
    isStreaming: false,
  },
  {
    key: 'swank',
    slug: 'swank-streaming',
    title: 'Swank Streaming Videos',
    legacyPath: '/local-collections/collections/swank/',
    v2Path: '/collections/swank-streaming',
    legacyLabel: 'Swank Streaming Videos',
    v2Label: 'Swank Streaming Videos',
    isStreaming: true,
  },
];

export const resolveLocalCollectionConfig = (collectionParam) => {
  if (!collectionParam) {
    return null;
  }

  return (
    LOCAL_COLLECTIONS_CONFIG.find(
      (collection) => collection.key === collectionParam || collection.slug === collectionParam,
    ) || null
  );
};
