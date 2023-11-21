import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useFetchPublicCollectionName = (limit, id, type) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const baseUrl = useStore((state) => state.baseUrl);

    const fetchCollections = useCallback(async () => {
        try {
            setLoading(true);
            let response;
            console.log(id)
            if (id) {
                response = await axios.get(`${baseUrl}/collection_name/get-all-public/${id}`, {
                    params: { limit: limit, offset: offset }
                });
            } else if(type === 'new'){
                response = await axios.get(`${baseUrl}/collection_name/public-new`, {
                    params: { limit: limit, offset: offset }
                });
            } else {
                response = await axios.get(`${baseUrl}/collection_name/get-all-public`, {
                    params: { limit: limit, offset: offset }
                });
            }

            if(response.status === 204){
                toast.warn('No collections found');
                setHasMore(false);
                setLoading(false)
            } else if (response.status === 200) {
                if (response.data.currentPage >= response.data.totalPages) {
                    setCollections(prevCollections => [...prevCollections, ...response.data.records]);
                    setHasMore(false);
                } else {
                    if(response.data.records.length > 0) {
                        setCollections(prevCollections => [...prevCollections, ...response.data.records]);
                        setOffset(prevOffset => prevOffset + limit);
                    }
                }
            }
        } catch (error) {
            console.log(error)
            toast.error('Error fetching collections');
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, limit, offset, setCollections, id]);

    // Initial fetch
    useEffect(() => {
        // Load initial data
        if (offset === 0) {
          fetchCollections();
        }
      }, [fetchCollections, offset]);

    // This function will be called when we need to fetch more data
    const loadMore = () => {
        if (hasMore && !loading) { // Make sure to check that collection_id is not null here
            fetchCollections();
        }
    };


    return { loading, error, hasMore, loadMore, setLoading, collections};
};
