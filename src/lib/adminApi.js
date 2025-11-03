// src/lib/adminApi.js
import axios from 'axios';
import { useStore } from '../store/store';

// Expose lightweight helper fns; keep axios baseUrl centralized via store
export function useAdminApi() {
  const baseUrl = useStore((s) => s.baseUrl);

  const client = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  // Colleges
  const fetchColleges = async () => {
    const { data } = await client.get('/colleges');
    return data;
  };

  const fetchCollegeHomeSelections = async (collegeId) => {
    const { data } = await client.get(`/colleges/${collegeId}/home-selections`);
    return data; // expected: { collectionIds: string[] }
  };

  const saveCollegeHomeSelections = async (collegeId, collectionIds) => {
    const { data } = await client.put(`/colleges/${collegeId}/home-selections`, { collectionIds });
    return data;
  };

  // Analytics
  const fetchAnalytics = async (filters = {}) => {
    const { data } = await client.get('/analytics', { params: filters });
    return data;
  };

  const exportAnalytics = async (filters = {}) => {
    const { data } = await client.get('/analytics/export', { params: filters, responseType: 'blob' });
    return data; // Blob
  };

  // Following
  const getFollowedCollections = async () => {
    const { data } = await client.get('/followed-collections');
    return data;
  };

  const unfollowCollection = async (collectionId) => {
    const { data } = await client.delete(`/follow/${collectionId}`);
    return data;
  };

  // Collections
  const deleteCollectionRecord = async (collectionRecordId) => {
    const { data } = await client.delete(`/collection_records/delete/${collectionRecordId}`);
    return data;
  };

  // Favorites
  const removeFavorite = async (eds_id, folio_id) => {
    const { data } = await client.delete('/records/delete', {
      data: { eds_id, folio_id },
    });
    return data;
  };

  // Collections: create new
  const createCollection = async (payload) => {
    const { data } = await client.post('/collection_name/create', payload);
    return data;
  };

  return {
    client,
    fetchColleges,
    fetchCollegeHomeSelections,
    saveCollegeHomeSelections,
    fetchAnalytics,
    exportAnalytics,
    getFollowedCollections,
    unfollowCollection,
    deleteCollectionRecord,
    removeFavorite,
    createCollection,
  };
}
