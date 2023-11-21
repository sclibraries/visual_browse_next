import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFetchCollectionRecords } from '@/hooks/useFetchPublicCollectionRecords';
import PublicCollectionsRecordDisplay from '@/components/PublicCollectionsRecordDisplay';
import Link from 'next/link';

const LIMIT = 20
function CollectionRecords(){
    const router = useRouter();
    // Wait for the collection to be set in the query params
    const collection_id = router.query.collection_id || '';
    const name = router.query.name || '';
    const author = router.query.author_id || '';
      // Destructure the methods and variables from the hook
      const {
          loading,
          error,
          hasMore,
          collectionRecords,
          loadMore,
      } = useFetchCollectionRecords(LIMIT, collection_id);
  
    const [isFetchingMore, setIsFetchingMore] = useState(false);
  
    const handleClickLoadMore = () => {
      setIsFetchingMore(true); // Indicate that the next batch of records is loading
      loadMore();
    }

  
   
      useEffect(() => {
          if (!loading) {
          setIsFetchingMore(false); // Set this after new data is fetched
          }
      }, [loading]);
  
  
      const recordsToDisplay = collectionRecords || [];
  
  
      return(
          <div className="container">
            {name && <h1 className="display-4">{name}</h1>}
            {author && <Link style={{marginLeft: "10px"}} href={`/collections/author/${author}`}>View more by this author</Link>}
          <div className="hide-scrollbar flex-1 h-100 container">
          <div className="row row-cols-1 row-cols-md-5 g-4" style={{marginTop: "30px"}}>
                  {recordsToDisplay.map((record, index) => (
                  <PublicCollectionsRecordDisplay
                      key={`${record.record_id}-${index}`} 
                      an={record.eds_id} 
                      dbid='cat09206a' 
                      folio_id={record.folio_id} 
                      router={router}
                      id={record.collection_records_id}
                      collection_id={collection_id}  
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