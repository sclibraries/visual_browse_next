import { useState, useCallback } from 'react';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook for following/unfollowing collections
 */
export const useFollowCollection = () => {
  const [baseUrl, loggedIn] = useStore(useShallow((state) => [state.baseUrl, state.loggedIn]));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if user is following a collection
   */
  const checkFollowStatus = useCallback(async (collectionId) => {
    if (!loggedIn) {
      return false;
    }

    try {
      const response = await fetch(`${baseUrl}/following_collection/check/${collectionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check follow status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.isFollowing;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  }, [baseUrl, loggedIn]);

  /**
   * Follow a collection
   */
  const followCollection = useCallback(async (collectionId) => {
    
    if (!loggedIn) {
      throw new Error('User must be logged in to follow collections');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/following_collection/follow`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_id: collectionId
        }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Already following this collection');
        }
        throw new Error(`Failed to follow collection: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error following collection:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loggedIn]);

  /**
   * Unfollow a collection
   */
  const unfollowCollection = useCallback(async (collectionId) => {
    if (!loggedIn) {
      throw new Error('User must be logged in to unfollow collections');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/following_collection/unfollow`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_id: collectionId
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Not following this collection');
        }
        throw new Error(`Failed to unfollow collection: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      console.error('Error unfollowing collection:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loggedIn]);

  /**
   * Get collections followed by current user
   */
  const getFollowedCollections = useCallback(async (page = 1, limit = 50) => {
    if (!loggedIn) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${baseUrl}/following_collection/user/following?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch followed collections: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching followed collections:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, loggedIn]);

  /**
   * Get followers of a specific collection
   */
  const getCollectionFollowers = useCallback(async (collectionId, page = 1, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/following_collections/collection/${collectionId}/followers?page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collection followers: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching collection followers:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return {
    loading,
    error,
    checkFollowStatus,
    followCollection,
    unfollowCollection,
    getFollowedCollections,
    getCollectionFollowers,
  };
};

export default useFollowCollection;
