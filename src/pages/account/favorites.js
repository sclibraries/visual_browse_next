// Favorites Component
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import { useFetchFavoriteData } from '@/hooks/useFetchFavoriteData';
import { GET_RECORD } from '../../lib/api';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
import axios from 'axios';
import RecordDisplay from './recordDisplay'

const LIMIT = 20; // The number of records to fetch per page

function Favorites() {
  const baseUrl = useStore((state) => state.baseUrl);
  const { loading, error, hasMore, favorites, loadMore, removeFavorite } = useFetchFavoriteData(LIMIT);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const router = useRouter();

  const handleClickLoadMore = () => {
    setIsFetchingMore(true); // Indicate that the next batch of records is loading
    loadMore();
  }

  const handleDeleteRecord = (eds_id, folio_id) => {
    if (window.confirm('Are you sure you want to remove this favorite?')) {
        axios({
            method: 'delete',
            url: `${baseUrl}/records/delete`,
            data: {
              eds_id,
              folio_id,
            },
            withCredentials: true,
          })
          .then(() => {
            removeFavorite(folio_id);
            toast.success(`Item removed from favorites.`);
          })
          .catch((error) => {
            toast.error(`Error removing item from favorites: ${error.message}`);
        });
    }
  };


  useEffect(() => {
    if (!loading) {
      setIsFetchingMore(false); // Set this after new data is fetched
    }
  }, [loading]);

  if (loading && !isFetchingMore) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const recordsToDisplay = favorites ?? [];


return (
  <div className="container">
    <div className="hide-scrollbar flex-1 h-100 container">
        <div className="row row-cols-1 row-cols-md-4 g-4" style={{marginTop: "30px"}}>
            {recordsToDisplay.map((record, index) => (
            <RecordDisplay
                key={`${record.record_id}-${index}`} 
                an={record.eds_id} 
                dbid={record.dbid} 
                folio_id={record.folio_id} 
                router={router}
                id={record.record_id}
                handleDeleteRecord={handleDeleteRecord}
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
);
}

export default Favorites;
