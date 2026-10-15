import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useFetchPublicCollectionName = (limit, id, type, sortOption, sortOptionChanged) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const baseUrl = useStore((state) => state.baseUrl);

    const fetchCollections = useCallback(async (currentSortOption) => {
        if (currentSortOption !== sortOption) {
            return; // Do not proceed if the sort option has changed
        }
        try {
            setLoading(true);
            let response;
            const params = { limit: limit, offset: offset, sort: sortOption }; // Include sort option
            
            if (id) {
                response = await axios.get(`${baseUrl}/collection_name/get-all-public/${id}`, { params });
            } else if (type === 'new') {
                response = await axios.get(`${baseUrl}/collection_name/public-new`, { params });
            } else {
                response = await axios.get(`${baseUrl}/collection_name/get-all-public`, { params });
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
            console.error(error)
            toast.error('Error fetching collections');
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, limit, offset, setCollections, id, sortOption, type]);

    useEffect(() => {
        if (sortOptionChanged) {
            setCollections([]);
            setOffset(0);
            fetchCollections(sortOption); // Pass sortOption as a parameter
        }
    }, [sortOption, sortOptionChanged, fetchCollections]);
    
    useEffect(() => {
        if (!sortOptionChanged && offset === 0) {
            fetchCollections(sortOption); // Pass sortOption as a parameter
        }
    }, [offset, sortOption, sortOptionChanged, fetchCollections]);
    
    // Update loadMore function to return a promise
    const loadMore = async () => {
        if (hasMore && !loading && !sortOptionChanged) {
            setOffset(prevOffset => prevOffset + limit);
            await fetchCollections(sortOption);
        }
    };
    


    return { loading, error, hasMore, loadMore, setLoading, collections};
};
