import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useFetchCollectionRecords = (limit, collection_id) => {
    const [collectionRecords, setCollectionRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const baseUrl = useStore((state) => state.baseUrl);

    const fetchCollectionRecords = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/collection_records/read-all-public`, {
                params: { limit: limit, offset: offset, collection_id: collection_id }
            });

            if(response.status === 204){
                toast.warn('No records found');
                setHasMore(false);
                setLoading(false)
            } else if (response.status === 200) {
                if (response.data.currentPage >= response.data.totalPages) {
                    setCollectionRecords(prevCollectionRecords => [...prevCollectionRecords, ...response.data.records]);
                    setHasMore(false);
                } else {
                    if(response.data.records.length > 0) {
                        setCollectionRecords(prevCollectionRecords => [...prevCollectionRecords, ...response.data.records]);
                        setOffset(prevOffset => prevOffset + limit);
                    }
                }
            }
        } catch (error) {
            console.log(error)
            toast.error('Error fetching collection records');
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, limit, offset, setCollectionRecords, collection_id]);

    // Initial fetch
    useEffect(() => {
        // Load initial data
        if (offset === 0 && collection_id) {
          fetchCollectionRecords();
        }
      }, [fetchCollectionRecords, offset, collection_id]);

    // This function will be called when we need to fetch more data
    const loadMore = () => {
        if (hasMore && !loading && collection_id) { // Make sure to check that collection_id is not null here
            fetchCollectionRecords();
        }
    };


    return { loading, error, hasMore, collectionRecords, loadMore, setLoading };
};
