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

    // Reset state when collection changes - this is crucial
    useEffect(() => {
        setCollectionRecords([]);
        setOffset(0);
        setHasMore(true);
        setError(null);
    }, [collection_id]);

    const fetchCollectionRecords = useCallback(async () => {
        if (!collection_id) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/collection_records/read-all`, {
                withCredentials: true,
                params: { limit, offset, collection_id }
            });

            if(response.status === 204){
                setHasMore(false);
                setLoading(false);
            } else if (response.status === 200) {
                if (response.data.currentPage >= response.data.totalPages) {
                    setCollectionRecords(prevRecords => [...prevRecords, ...response.data.records]);
                    setHasMore(false);
                } else {
                    if(response.data.records.length > 0) {
                        setCollectionRecords(prevRecords => [...prevRecords, ...response.data.records]);
                        setOffset(prevOffset => prevOffset + limit);
                    } else {
                        setHasMore(false);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching collection records:', error);
            setError(error);
            toast.error('Error fetching collection records');
        } finally {
            setLoading(false);
        }
    }, [baseUrl, limit, offset, collection_id]);

    const removeCollectionRecords = useCallback((folioIdToRemove) => {
        setCollectionRecords(currentRecords => 
            currentRecords.filter(record => record.folio_id !== folioIdToRemove)
        );
    }, []);

    // Function to manually reset collection data
    const resetCollectionData = useCallback(() => {
        setCollectionRecords([]);
        setOffset(0);
        setHasMore(true);
        setError(null);
    }, []);

    // Initial fetch when collection_id changes or offset is 0
    useEffect(() => {
        if (collection_id && offset === 0) {
            fetchCollectionRecords();
        }
    }, [fetchCollectionRecords, offset, collection_id]);

    // Function to load more records
    const loadMore = useCallback(() => {
        if (hasMore && !loading && collection_id) {
            fetchCollectionRecords();
        }
    }, [hasMore, loading, collection_id, fetchCollectionRecords]);

    return { 
        collectionRecords, 
        setCollectionRecords,
        loading, 
        error, 
        hasMore, 
        loadMore, 
        removeCollectionRecords,
        resetCollectionData
    };
};
