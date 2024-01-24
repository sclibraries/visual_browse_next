// useAddToCollection.js
import { useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useAddToCollection = (onSuccess) => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);

  const addToCollection = useCallback((collection_id, an) => {
    const eds_id = an;
    const folio_id = an.split('fs00001006.')[1];
    const endpoint = `${baseUrl}/collection_records/create`; // Update this to your actual endpoint

    axios.post(endpoint, {
      collection_id,
      eds_id,
      folio_id,
    }, {
      withCredentials: true
    })
    .then(response => {
      console.log('Successfully added to collection:', response.data);
      toast.success('Added to collection');
      if (onSuccess) {
        onSuccess();
      }
    })
    .catch(error => {
      toast.error('An error occurred while adding to collection');
      console.error('Error adding to collection:', error);
    });
  }, [baseUrl, onSuccess]);

  return addToCollection;
};
