// useAddToCollection.js
import { useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useAddToCollection = (onSuccess) => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);

  const addToCollection = useCallback((collection_id, an, dbid) => {
    const eds_id = an;
    let folio_id;

    if (eds_id.includes("fs00001006.")) {
        // If 'fs00001006.' is found, split the eds_id accordingly
        folio_id = eds_id.split("fs00001006.")[1];
    } else {
        // Otherwise, just use the full eds_id
        folio_id = eds_id;
    }

    const endpoint = `${baseUrl}/collection_records/create`; 

    axios.post(endpoint, {
      collection_id,
      eds_id,
      folio_id,
      dbid
    }, {
      withCredentials: true
    })
    .then(() => {
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

// Make sure it exports as default
export default useAddToCollection;
