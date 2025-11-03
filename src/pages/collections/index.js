import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFetchPublicCollectionName } from '../../hooks/useFetchPublicCollectionName';

const LIMIT = 25;

function Collections() {
  const [sortOption, setSortOption] = useState('newest_desc');
  const [sortOptionChanged, setSortOptionChanged] = useState(false);

  const {
    loading,
    hasMore,
    loadMore,
    collections
  } = useFetchPublicCollectionName(LIMIT, '', '', sortOption, sortOptionChanged);

  useEffect(() => {
    if (!loading && sortOptionChanged) {
      setSortOptionChanged(false);
    }
  }, [loading, sortOptionChanged]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleClickLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setSortOptionChanged(true);
  };

  return (
    <div className="hide-scrollbar flex-1 h-100 container">
      <h1 className="display-4">Shared Collections</h1>
      <div className="collections-sort">
        <select value={sortOption} onChange={handleSortChange}>
          <option value="newest_desc">Newest (Desc)</option>
          <option value="newest_asc">Newest (Asc)</option>
          <option value="updated_desc">Recently Updated (Desc)</option>
          <option value="updated_asc">Recently Updated (Asc)</option>
        </select>
      </div>
      <div className="collections-grid">
        {(loading && collections.length === 0) || sortOptionChanged ? (
          // Show loading skeletons for initial load or when sorting changes
          [...Array(8)].map((_, index) => (
            <div key={index} className="collection-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-link"></div>
                <div className="skeleton-link"></div>
              </div>
            </div>
          ))
        ) : (
          collections.map((collection, index) => (
            <CollectionItem key={index} collection={collection} />
          ))
        )}
      </div>

      {!isLoadingMore && hasMore && (
        <div className="d-grid gap-2 list" style={{ paddingTop: "20px", paddingBottom: "50px" }}>
          <button
            className={"btn btn-primary"}
            onClick={handleClickLoadMore} 
            disabled={loading || isLoadingMore}
          >
            Load More
          </button>
        </div>
      )}
      {isLoadingMore && (
        <div className="text-center" style={{ paddingTop: "20px", paddingBottom: "50px" }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading more collections...</p>
        </div>
      )}
    </div>
  );
}

const CollectionItem = ({ collection }) => {
  const descriptionRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  // Reset error state when collection changes
  useEffect(() => {
    setImageError(false);
  }, [collection.cover_image]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="collection-item">
      <div className="image-container-collection">
        {!collection.cover_image || imageError ? (
          <>
            <div className="collection-image-fallback">
              <div className="fallback-icon">📚</div>
              <div className="fallback-text">Collection</div>
            </div>
            <div className="collection-description" ref={descriptionRef}>
              {collection.description}
            </div>
          </>
        ) : (
          <>
            <Image 
              src={collection.cover_image} 
              alt={collection.name}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
              onError={handleImageError}
            />
            <div className="collection-description">{collection.description}</div>
          </>
        )}
      </div>
      <div className="collection-title">
        <h3>{collection.name}</h3>
        <div className="collection-links">
          <Link
            href={`/collections/records/${collection.collection_id}?name=${collection.name}&author_id=${collection.user_id}`}
            className="card-link"
          >
            View Collection
          </Link>
          <Link
            href={`/collections/author/${collection.user_id}`}
            className="card-link"
          >
            View more by this author
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Collections;
