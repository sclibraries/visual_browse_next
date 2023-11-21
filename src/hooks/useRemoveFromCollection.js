// useRemoveFromCollection.js
import { useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

export const useRemoveFromCollection = (onSuccess) => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);

    const removeFromCollection = useCallback((collection_records_id) => {
        const endpoint = `${baseUrl}/collection_records/delete/${collection_records_id}`;
        axios.delete(endpoint, {
            withCredentials: true
        })
        .then(response => {
            toast.success('Successfully removed from collection');
            if (onSuccess) {
                onSuccess(collection_records_id); // Pass the deleted ID to the success handler
            }
        })
        .catch(error => {
            toast.error('Error removing from collection');
            console.error('Error removing from collection:', error);
        });
    }, [baseUrl, onSuccess]);
    
    return removeFromCollection;
};
