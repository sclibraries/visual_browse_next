import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useFetchPublicCollectionName } from '../../../hooks/useFetchPublicCollectionName';
import { useRouter } from 'next/router';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { DisplayLoadingSkeleton } from '../../../components/Loading';

const LIMIT = 25;

function UserCollections() {
  const router = useRouter();
  const { author_id } = router.query;

  const {
    loading,
    hasMore,
    loadMore,
    collections,
  } = useFetchPublicCollectionName(LIMIT, author_id);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleClickLoadMore = () => {
    setIsFetchingMore(true); // Indicate that the next batch of records is loading
    loadMore();
  };

  useEffect(() => {
    if (!loading) {
      setIsFetchingMore(false); // Set this after new data is fetched
    }
  }, [loading]);

  return (
    <div className="hide-scrollbar flex-1 h-100 container">
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 4, 900: 5 }}>
        <Masonry>
          {loading ? (
            <DisplayLoadingSkeleton />
          ) : (
            collections.map((collection, index) => (
              <CollectionItem key={index} collection={collection} />
            ))
          )}
        </Masonry>
      </ResponsiveMasonry>
      <div>
        {!isFetchingMore && hasMore && (
          <div className="d-grid gap-2 list" style={{ paddingTop: "20px", paddingBottom: "50px" }}>
            <button
              className={"btn btn-primary"}
              onClick={handleClickLoadMore}
              disabled={loading}
            >
              Load More
            </button>
          </div>
        )}
        {isFetchingMore && <p>Loading more...</p>}
      </div>
    </div>
  );
}

const CollectionItem = ({ collection }) => {
    const descriptionRef = useRef(null);
    const [svgHeight, setSvgHeight] = useState('100%');
    const [imgError, setImgError] = useState(false); // New state to track image load error
  
    useEffect(() => {
      if (descriptionRef.current) {
        const descriptionHeight = descriptionRef.current.offsetHeight;
        setSvgHeight(descriptionHeight > 100 ? `${descriptionHeight + 50}px` : '100%'); // Add padding for long descriptions
      }
    }, [collection.description]);
  
    const handleImageError = () => {
      setImgError(true); // Set image error state to true
    };
  
    return (
      <div className="collection-item">
        <div className="image-container-collection">
          {imgError || !collection.cover_image ? (
            <>
              <svg
                width="100%"
                height={svgHeight}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <title>{collection.name}</title>
                <rect width="100%" height="100%" fill="#d6d6d6"></rect>
              </svg>
              <div className="collection-description" ref={descriptionRef}>
                {collection.description}
              </div>
            </>
          ) : (
            <>
              <img
                src={collection.cover_image}
                alt={collection.name}
                onError={handleImageError} // Handle image load error
              />
              <div className="collection-description" ref={descriptionRef}>
                {collection.description}
              </div>
            </>
          )}
        </div>
        <div className="collection-title">
          {collection.name}
          <div className="collection-links">
            <Link
              href={`/collections/records/${collection.collection_id}?name=${collection.name}&author_id=${collection.user_id}`}
              className="card-link"
            >
              View Collection
            </Link>
          </div>
        </div>
      </div>
    );
  };
  

export default UserCollections;
