import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/store';
import { DisplayImage } from '@/components/DisplayImage';
import { shallow } from 'zustand/shallow';
import { DisplayLoadingSkeleton } from '@/components/Loading';
import { useRouter } from 'next/router';
import { useRemoveFromCollection } from '@/hooks/useRemoveFromCollection';
import { useFetchCollectionRecords } from '@/hooks/useFetchCollectionRecords';
import axios from 'axios';
import RecordDisplay from './recordDisplay'
import { toast } from 'react-toastify';

// Your constant LIMIT should be defined somewhere, if it's not dynamic, you can keep it outside of your component
const LIMIT = 10; // Example limit value, adjust it as needed

function CollectionRecords() {
  const router = useRouter();
  // Wait for the collection to be set in the query params
  const { collection } = router.query;
    // Destructure the methods and variables from the hook
    const {
        loading,
        error,
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
        const endpoint = `${baseUrl}/collection_records/delete/${id}`;
        axios.delete(endpoint, {
            withCredentials: true
        })
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


    return(
        <div className="container">
        <div className="hide-scrollbar flex-1 h-100 container">
        <div className="row row-cols-*" style={{marginTop: "30px"}}>
                {recordsToDisplay.map((record, index) => (
                <RecordDisplay
                    key={`${record.record_id}-${index}`} 
                    an={record.eds_id} 
                    dbid='cat09206a' 
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