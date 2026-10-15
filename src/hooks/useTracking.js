import { useCallback } from 'react';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook for tracking user interactions and events
 * Sends tracking data to the backend analytics system
 */
export const useTracking = () => {
  const [baseUrl, user, loggedIn] = useStore(useShallow((state) => [state.baseUrl, state.user, state.loggedIn]));

  /**
   * Track an event
   * @param {Object} eventData - The event data to track
   * @param {string} eventData.event_type - Type of event (required)
   * @param {number} eventData.collection_id - Collection ID (optional)
   * @param {string} eventData.record_id - Record ID (optional)
   * @param {string} eventData.search_query - Search query (optional)
   * @param {Object} eventData.metadata - Additional metadata (optional)
   */
  const trackEvent = useCallback(async (eventData) => {
    try {
      if (!eventData.event_type) {
        console.warn('Event type is required for tracking');
        return;
      }

      const payload = {
        user_id: loggedIn && user?.user_id ? user.user_id : null,
        event_type: eventData.event_type,
        collection_id: eventData.collection_id || null,
        record_id: eventData.record_id || null,
        search_query: eventData.search_query || null,
        metadata: eventData.metadata || null,
      };


      const response = await fetch(`${baseUrl}/tracking_events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Tracking request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw - tracking failures shouldn't break the user experience
    }
  }, [baseUrl, user, loggedIn]);

  /**
   * Track collection view event
   */
  const trackCollectionView = useCallback((collectionId, metadata = {}) => {
    return trackEvent({
      event_type: 'view_collection',
      collection_id: collectionId,
      metadata,
    });
  }, [trackEvent]);

  /**
   * Track record view event within a collection
   */
  const trackRecordView = useCallback((collectionId, recordId, metadata = {}) => {
    return trackEvent({
      event_type: 'view_record',
      collection_id: collectionId,
      record_id: recordId,
      metadata,
    });
  }, [trackEvent]);

  /**
   * Track detailed record interaction with full record data
   */
  const trackRecordInteraction = useCallback((collectionId, recordId, recordData = {}, interactionType = 'view_record') => {
    return trackEvent({
      event_type: interactionType,
      collection_id: collectionId,
      record_id: recordId,
      metadata: {
        ...recordData,
        timestamp: new Date().toISOString()
      },
    });
  }, [trackEvent]);

  /**
   * Track search event within a collection
   */
  const trackCollectionSearch = useCallback((collectionId, searchQuery, metadata = {}) => {
    return trackEvent({
      event_type: 'search_collection',
      collection_id: collectionId,
      search_query: searchQuery,
      metadata,
    });
  }, [trackEvent]);

  /**
   * Track when a user loads more records in a collection
   */
  const trackLoadMore = useCallback((collectionId, currentCount, metadata = {}) => {
    return trackEvent({
      event_type: 'load_more_records',
      collection_id: collectionId,
      metadata: {
        current_count: currentCount,
        ...metadata,
      },
    });
  }, [trackEvent]);

  /**
   * Track collection sharing/following
   */
  const trackCollectionInteraction = useCallback((eventType, collectionId, metadata = {}) => {
    return trackEvent({
      event_type: eventType,
      collection_id: collectionId,
      metadata,
    });
  }, [trackEvent]);

  /**
   * Track when users click on record images or other media elements
   */
  const trackMediaInteraction = useCallback((collectionId, recordId, mediaType, metadata = {}) => {
    return trackEvent({
      event_type: 'media_interaction',
      collection_id: collectionId,
      record_id: recordId,
      metadata: {
        media_type: mediaType,
        ...metadata,
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackCollectionView,
    trackRecordView,
    trackRecordInteraction,
    trackCollectionSearch,
    trackLoadMore,
    trackCollectionInteraction,
    trackMediaInteraction,
  };
};

export default useTracking;
