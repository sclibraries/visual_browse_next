import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

// Hook to load and manage college-specific homepage collection selections
// Expects backend endpoints:
// GET    /api/admin/colleges -> [{ id, name }]
// GET    /api/admin/colleges/:collegeId/home-collections -> { collection_ids: [] }
// POST   /api/admin/colleges/:collegeId/home-collections -> { collection_ids: [] }
// (You can adjust endpoints to match your API; currently optimistic with local state if API missing.)
export function useCollegeCustomizations() {
  const baseUrl = useStore(s => s.baseUrl);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const collegeHomeSelections = useStore(s => s.collegeHomeSelections);
  const setCollegeHomeSelections = useStore(s => s.setCollegeHomeSelections);

  const loadColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${baseUrl}/api/admin/colleges`, { withCredentials: true });
      setColleges(resp.data || []);
    } catch (e) {
      // Fallback demo colleges if API not ready
      setColleges([
        { id: 'smith', name: 'Smith College' },
        { id: 'amherst', name: 'Amherst College' },
        { id: 'hampshire', name: 'Hampshire College' }
      ]);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const loadCollegeSelections = useCallback(async (collegeId) => {
    if (!collegeId) return;
    try {
      const resp = await axios.get(`${baseUrl}/api/admin/colleges/${collegeId}/home-collections`, { withCredentials: true });
      const ids = resp.data?.collection_ids || [];
      setCollegeHomeSelections(collegeId, ids);
    } catch (e) {
      // Silent fail; keep local state
      console.warn('Could not load college selections, using local state only', e.message);
    }
  }, [baseUrl, setCollegeHomeSelections]);

  const saveCollegeSelections = useCallback(async (collegeId, collectionIds) => {
    setCollegeHomeSelections(collegeId, collectionIds);
    try {
      await axios.post(`${baseUrl}/api/admin/colleges/${collegeId}/home-collections`, { collection_ids: collectionIds }, { withCredentials: true });
    } catch (e) {
      console.error('Failed to persist selections', e);
      throw e;
    }
  }, [baseUrl, setCollegeHomeSelections]);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  return {
    colleges,
    loading,
    error,
    collegeHomeSelections,
    loadColleges,
    loadCollegeSelections,
    saveCollegeSelections,
  };
}
