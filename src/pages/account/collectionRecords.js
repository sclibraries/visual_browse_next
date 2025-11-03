import  { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';
import { useRouter } from 'next/router';
import { useFetchCollectionRecords } from '../../hooks/useFetchCollectionRecords';
import RecordDisplay from './recordDisplay'
import { toast } from 'react-toastify';
import Image from 'next/image'
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { useAdminApi } from '../../lib/adminApi';

// Your constant LIMIT should be defined somewhere, if it's not dynamic, you can keep it outside of your component
const LIMIT = 10; // Example limit value, adjust it as needed

function CollectionRecords() {
  const router = useRouter();
    const { ready, authorized } = useAuthRedirect();
  const [collectionCoverImage] = useStore(state => [
    state.collectionCoverImage
  ], shallow)

    const { deleteCollectionRecord } = useAdminApi();
  // Wait for the collection to be set in the query params
  const { collection } = router.query;
    // Destructure the methods and variables from the hook
    const {
        loading,
        hasMore,
        collectionRecords,
        loadMore,
        removeCollectionRecords,
    } = useFetchCollectionRecords(LIMIT, collection);

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleClickLoadMore = () => {
    setIsFetchingMore(true); // Indicate that the next batch of records is loading
    loadMore();
  }

    const handleDeleteRecord = (an, folio_id, id) => {
    if (window.confirm('Are you sure you want to remove this record?')) {
                deleteCollectionRecord(id)
                    .then(() => {
                        toast.success('Successfully removed from collection');
                        removeCollectionRecords(folio_id);
                    })
                    .catch(error => {
                        toast.error('Error removing from collection');
                        console.error('Error removing from collection:', error);
                    });
    }
  };

 
    useEffect(() => {
        if (!loading) {
        setIsFetchingMore(false); // Set this after new data is fetched
        }
    }, [loading]);


    const recordsToDisplay = collectionRecords || [];

    
        if (!ready) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (!authorized) {
            return null;
        }

        return(
        <div className="container">
        <div className="card mb-3" style={{maxWidth: '540px',marginTop: "30px"}}>
            <div className="row g-0">
                <div className="col-md-4">
                { collectionCoverImage ? (
                    
                <Image 
                 width={150}
                 height={250}
                 src={collectionCoverImage}
                  alt="Collection Cover Image"
                  unoptimized={true} 
                 />   
                ) : (
                    <svg 
                    className="bd-placeholder-img card-img-top" 
                    width="100%" 
                    height="248" 
                    xmlns="http://www.w3.org/2000/svg" 
                    role="img" 
                    preserveAspectRatio="xMidYMid slice" 
                    focusable="false"
                  >
                    <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                  </svg>
                )}
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h5 className="card-title">Your collection cover image</h5>
                    </div>
                </div>
            </div>
        </div>
        <div className="hide-scrollbar flex-1 h-100 container">
        <div className="row row-cols-*" style={{marginTop: "30px"}}>
                {recordsToDisplay.map((record, index) => (
                <RecordDisplay
                    key={`${record.record_id}-${index}`} 
                    an={record.eds_id} 
                    dbid={record.dbid}
                    folio_id={record.folio_id} 
                    router={router}
                    id={record.collection_records_id}
                    handleDeleteRecord={handleDeleteRecord}
                    collection_id={collection}
                />
                ))}
            </div>
            <div>
                {!isFetchingMore && hasMore && (
                    <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}>
                    <button
                          className={"btn btn-primary"}
                          onClick={handleClickLoadMore} disabled={loading}>
                        Load More
                    </button>
                    </div>
                )}
                {isFetchingMore && <p>Loading more...</p>}
            </div>
        </div>
        </div>
    )
}




export default CollectionRecords;