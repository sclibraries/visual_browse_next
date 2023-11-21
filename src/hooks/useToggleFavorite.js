import { useCallback } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { toast } from 'react-toastify';

// Create a custom hook for toggling favorites
export const useToggleFavorite = (an, isFavorite, setIsFavorite) => {

  const [baseUrl] = useStore((state) => [state.baseUrl]);  

  const toggleFavorite = useCallback(() => {
    const eds_id = an;
    const folio_id = an.split('fs00001006.')[1];
    const saveEndpoint = `${baseUrl}/records/create`;
    const removeEndpoint = `${baseUrl}/records/delete`;
    
    if (isFavorite) {
      // DELETE request to remove favorite
      axios({
        method: 'delete',
        url: removeEndpoint,
        data: {
          eds_id,
          folio_id
        },
        withCredentials: true
      })
      .then(response => {
        setIsFavorite(false);
        toast.success('Removed from favorites');
      })
      .catch(error => {
        console.error('Error removing favorite:', error);
      });
    } else {
      // POST request to add favorite
      axios.post(saveEndpoint, {
        eds_id,
        folio_id
      }, {
        withCredentials: true
      })
      .then(response => {
        setIsFavorite(true);
        toast.success('Added to favorites');
      })
      .catch(error => {
        console.error('Error adding favorite:', error);
      });
    }
  }, [an, isFavorite, setIsFavorite]);

  return toggleFavorite;
};
