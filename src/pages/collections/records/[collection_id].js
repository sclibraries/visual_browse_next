import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useFetchCollectionRecords } from '../../../hooks/useFetchPublicCollectionRecords';
import { useFetchPublicCollectionDetails } from '../../../hooks/useFetchPublicCollectionDetails';
import PublicCollectionsRecordDisplay from '../../../components/PublicCollectionsRecordDisplay';
import FollowButton from '../../../components/FollowButton';
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';
import { useTracking } from '../../../hooks/useTracking';

const LIMIT = 50;

function CollectionRecords() {
  const router = useRouter();
  const collection_id = router.query.collection_id || '';
  const [initialUrl, setInitialUrl] = useState('');
  const [hasTrackedView, setHasTrackedView] = useState(false); // Track if we've already logged the collection view
  const [initialModalParams, setInitialModalParams] = useState(null); // Store initial modal params
  const { trackCollectionView, trackLoadMore } = useTracking();

  // Store state for handling record modal
  const [setAn, setDbid, setRecordModal] = useStore(
    (state) => [
      state.setAn,
      state.setDbid,
      state.setRecordModal,
    ],
    shallow
  );

  // Store the initial URL and modal params when component mounts
  useEffect(() => {
    if (router.isReady && !initialUrl) {
      setInitialUrl(router.asPath);
      setInitialModalParams({
        hasModalParams: !!(router.query.an || router.query.dbid),
        an: router.query.an,
        dbid: router.query.dbid
      });
    }
  }, [router.isReady, router.asPath, initialUrl, router.query.an, router.query.dbid]);

  // Handle URL parameters for modal state
  useEffect(() => {
    if (router.query.an && router.query.dbid) {
      setAn(router.query.an);
      setDbid(router.query.dbid);
      setRecordModal(true);
    }
  }, [router.query.an, router.query.dbid, setAn, setDbid, setRecordModal]);

  // Use the hooks to fetch collection details and records first
  const { collectionDetails, loading: detailsLoading, error: detailsError } = useFetchPublicCollectionDetails(collection_id);

  const {
    loading: recordsLoading,
    hasMore,
    collectionRecords,
    loadMore,
  } = useFetchCollectionRecords(LIMIT, collection_id);

  // Track collection view when component mounts and collection_id is available
  useEffect(() => {
    // Only track when we have all the required data loaded and haven't tracked yet
    if (collection_id && router.isReady && !detailsLoading && collectionDetails && collectionDetails.length > 0 && !recordsLoading && !hasTrackedView && initialModalParams !== null) {
      const collection = collectionDetails[0];
      
      trackCollectionView(parseInt(collection_id), {
        source: 'direct_link',
        has_modal_params: initialModalParams.hasModalParams,
        collection_name: collection.name,
        collection_description: collection.description,
        author_user_id: collection.user_id,
        record_count: collectionRecords?.length || 0
      });
      setHasTrackedView(true); // Mark that we've tracked the view
    }
  }, [collection_id, router.isReady, trackCollectionView, collectionDetails, collectionRecords, detailsLoading, recordsLoading, hasTrackedView, initialModalParams]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleClickLoadMore = async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
    
    // Track load more action with collection context
    if (collection_id && !detailsLoading && collectionDetails && collectionDetails.length > 0) {
      const collection = collectionDetails[0];
      trackLoadMore(parseInt(collection_id), collectionRecords?.length || 0, {
        current_page: Math.ceil((collectionRecords?.length || 0) / LIMIT),
        collection_name: collection.name,
        total_records_before_load: collectionRecords?.length || 0,
        limit: LIMIT
      });
    }
  }

  const handleBackClick = () => {
    // Check if the current URL has modal parameters
    const currentUrlHasModalParams = router.query.an || router.query.dbid;
    
    if (currentUrlHasModalParams) {
      // If modal is open, close it by going to clean URL
      const otherParams = { ...router.query };
      delete otherParams.an;
      delete otherParams.dbid;
      const queryString = new URLSearchParams(otherParams).toString();
      const newUrl = queryString 
        ? `/collections/records/${collection_id}?${queryString}`
        : `/collections/records/${collection_id}`;
      router.push(newUrl, undefined, { shallow: true });
    } else {
      // Check if the initial URL contained modal parameters
      const initialUrlHadModalParams = initialUrl.includes('an=') || initialUrl.includes('dbid=');
      
      if (initialUrlHadModalParams) {
        // If we started with a modal URL, go to collections page
        router.push('/collections');
      } else {
        // Normal back navigation
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/collections');
        }
      }
    }
  };

  const recordsToDisplay = collectionRecords || [];

  if (detailsError) {
    return <p>Error: {detailsError}</p>;
  }

  return (
    <div>
      {/* Back button */}
      <div className="back-button-container">
        <button onClick={handleBackClick} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back</span>
        </button>
        <Link href="/collections" className="back-button secondary">
          <span>All Collections</span>
        </Link>
      </div>

      {/* Show collection name and description */}
      {!detailsLoading && collectionDetails && collectionDetails.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="flex-grow-1">
              <h1 className="display-4">{collectionDetails[0]?.name}</h1>
            </div>
            <FollowButton 
              collectionId={collection_id} 
              className="ms-3 flex-shrink-0"
            />
          </div>
          <p>{collectionDetails[0]?.description}</p>
          <div style={{ marginTop: "10px", marginBottom: "20px" }}>
            {collectionDetails[0]?.user_id && (
              <Link href={`/collections/author/${collectionDetails[0].user_id}`}>
                View more by this author
              </Link>
            )}
          </div>
        </>
      )}

  <div className="hide-scrollbar flex-1 h-100">
        <div className="records-grid">
          {recordsToDisplay.map((record, index) => (
            <PublicCollectionsRecordDisplay
              records={record}
              key={`${record.record_id}-${index}`}
              recordKey={`${record.record_id}-${index}`}
              an={record.eds_id}
              dbid={record.dbid}
              folio_id={record.folio_id}
              router={router}
              id={record.collection_records_id}
              collection_id={collection_id}
            />
          ))}
        </div>

        <div>
          {!isLoadingMore && hasMore && (
            <div className="d-grid gap-2 list" style={{ paddingTop: "20px", paddingBottom: "50px" }}>
              <button
                className={"btn btn-primary"}
                onClick={handleClickLoadMore}
                disabled={recordsLoading || isLoadingMore}
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
              <p>Loading more records...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectionRecords;
