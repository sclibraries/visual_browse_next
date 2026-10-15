import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook for fetching analytics data
 */
export const useAnalytics = () => {
  const [baseUrl, loggedIn] = useStore(useShallow((state) => [state.baseUrl, state.loggedIn]));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch general analytics summary
   */
  const fetchAnalyticsSummary = useCallback(async (filters = {}) => {
    if (!loggedIn) return null;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.collection_id) queryParams.append('collection_id', filters.collection_id);
      if (filters.event_type) queryParams.append('event_type', filters.event_type);

      const url = `${baseUrl}/tracking_events/analytics/summary${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching analytics summary:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loggedIn]);

  /**
   * Fetch collection-specific analytics
   */
  const fetchCollectionAnalytics = useCallback(async (collectionId, filters = {}) => {
    if (!loggedIn || !collectionId) return null;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);

      const url = `${baseUrl}/tracking_events/analytics/collection/${collectionId}${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collection analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching collection analytics:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loggedIn]);

  /**
   * Fetch raw tracking events with pagination
   */
  const fetchTrackingEvents = useCallback(async (filters = {}) => {
    if (!loggedIn) return null;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.event_type) queryParams.append('event_type', filters.event_type);
      if (filters.collection_id) queryParams.append('collection_id', filters.collection_id);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);

      const url = `${baseUrl}/tracking_events${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tracking events: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching tracking events:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loggedIn]);

  return {
    loading,
    error,
    fetchAnalyticsSummary,
    fetchCollectionAnalytics,
    fetchTrackingEvents,
  };
};

/**
 * Hook for fetching and managing analytics data with state
 */
export const useAnalyticsData = (autoFetch = true) => {
  const { fetchAnalyticsSummary, loading, error } = useAnalytics();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const refreshAnalytics = useCallback(async (filters = {}) => {
    const data = await fetchAnalyticsSummary(filters);
    if (data) {
      setAnalyticsData(data);
      setLastFetched(new Date());
    }
    return data;
  }, [fetchAnalyticsSummary]);

  useEffect(() => {
    if (autoFetch) {
      refreshAnalytics();
    }
  }, [autoFetch, refreshAnalytics]);

  return {
    analyticsData,
    loading,
    error,
    refreshAnalytics,
    lastFetched,
  };
};

export default useAnalytics;
