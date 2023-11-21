import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useFetchFavoriteData = (limit) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const baseUrl = useStore((state) => state.baseUrl);

    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseUrl}/records/read-all`, {
                withCredentials: true,
                params: { limit: limit, offset: offset }
            });
            if (response.data.currentPage >= response.data.totalPages) {
                setHasMore(false);
            } else {
                setFavorites(prevFavorites => [...prevFavorites, ...response.data.records]);
                setOffset(prevOffset => prevOffset + limit);
            }
        } catch (error) {
            toast.error('Error fetching favorites');
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, limit, offset, setFavorites]);

    const removeFavorite = useCallback((folioIdToRemove) => {
        setFavorites((currentFavorites) => 
          currentFavorites.filter(favorite => favorite.folio_id !== folioIdToRemove)
        );
      }, []);

    // Initial fetch
    useEffect(() => {
        // Load initial data
        if (offset === 0) {
          fetchFavorites();
        }
      }, [fetchFavorites, offset]);

    // This function will be called when we need to fetch more data
    const loadMore = () => {
        if (hasMore && !loading) {
            fetchFavorites();
        }
    };

    return { loading, error, hasMore, favorites, loadMore, removeFavorite };
};
