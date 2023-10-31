// useRemoveFromCollection.js
import { useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

export const useRemoveFromCollection = (onSuccess) => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);

  const removeFromCollection = useCallback((collection_records_id) => {
    const endpoint = `${baseUrl}/collection_records/delete/${collection_records_id}`; // Update this to your actual endpoint

    axios.delete(endpoint, {
      withCredentials: true
    })
    .then(response => {
      console.log('Successfully removed from collection:', response.data);
      if (onSuccess) {
        onSuccess();
      }
    })
    .catch(error => {
      console.error('Error removing from collection:', error);
    });
  }, [baseUrl, onSuccess]);

  return removeFromCollection;
};
