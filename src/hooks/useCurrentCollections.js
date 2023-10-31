import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
// useCurrentCollections.js
export const useCurrentCollections = (an) => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);
  const setCurrentCollections = useStore((state) => state.setCurrentCollections);

  const fetchData = () => {
    const eds_id = an;
    const folio_id = an.split('fs00001006.')[1];

    axios.get(`${baseUrl}/collection_records/check/${eds_id}/${folio_id}`, { withCredentials: true })
      .then(response => setCurrentCollections(response.data))
      .catch(error => console.error('Error fetching collections:', error));
  };

  useEffect(() => {
    fetchData();
  }, [an]);

  return fetchData;
};
