import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../store/store';

/**
 * Server-backed search for public collections.
 * Uses backend route: GET /collection_name/search-public?q=&limit=&offset=&sort=
 */
export const useSearchPublicCollections = ({
  limit = 25,
  sortOption = 'newest_desc',
  query = '',
  debounceMs = 250,
} = {}) => {
  const baseUrl = useStore((state) => state.baseUrl);

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const lastRequestKeyRef = useRef('');

  const fetchPage = useCallback(
    async ({ nextOffset, requestKey }) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          limit,
          offset: nextOffset,
          sort: sortOption,
          q: query,
        };

        const response = await axios.get(`${baseUrl}/collection_name/search-public`, { params });

        // Ignore late responses for previous query/sort/offset
        if (lastRequestKeyRef.current !== requestKey) return;

        if (response.status === 204) {
          if (nextOffset === 0 && !String(query || '').trim()) {
            toast.warn('No collections found');
          }
          setHasMore(false);
          setCollections((prev) => (nextOffset === 0 ? [] : prev));
          return;
        }

        if (response.status === 200) {
          const records = response.data?.records || [];
          const currentPage = response.data?.currentPage ?? 1;
          const totalPages = response.data?.totalPages ?? 1;

          setCollections((prev) => (nextOffset === 0 ? records : [...prev, ...records]));

          const reachedEnd = currentPage >= totalPages || records.length === 0;
          setHasMore(!reachedEnd);
        }
      } catch (err) {
        // Ignore late responses for previous query/sort/offset
        if (lastRequestKeyRef.current === requestKey) {
          console.error(err);
          toast.error('Error fetching collections');
          setError(err);
          setHasMore(false);
        }
      } finally {
        // Ignore late responses for previous query/sort/offset
        if (lastRequestKeyRef.current === requestKey) {
          setLoading(false);
          if (nextOffset === 0) {
            setInitialLoading(false);
          }
        }
      }
    },
    [baseUrl, limit, query, sortOption]
  );

  // Reset when query/sort/limit changes
  useEffect(() => {
    setCollections([]);
    setOffset(0);
    setHasMore(true);
    setInitialLoading(true);
  }, [query, sortOption, limit]);

  // Fetch first page (debounced)
  useEffect(() => {
    const requestKey = `${query}::${sortOption}::${limit}::0::${Date.now()}`;
    lastRequestKeyRef.current = requestKey;

    // Turn on pending/skeleton state immediately so we don't flash the empty state
    setInitialLoading(true);

    const handle = setTimeout(() => {
      fetchPage({ nextOffset: 0, requestKey });
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [query, sortOption, limit, debounceMs, fetchPage]);

  const loadMore = async () => {
    if (!hasMore || loading) return;

    const nextOffset = offset + limit;
    setOffset(nextOffset);

    const requestKey = `${query}::${sortOption}::${limit}::${nextOffset}::${Date.now()}`;
    lastRequestKeyRef.current = requestKey;

    await fetchPage({ nextOffset, requestKey });
  };

  return {
    loading,
    initialLoading,
    error,
    hasMore,
    loadMore,
    collections,
  };
};
