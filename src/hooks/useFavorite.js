import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

export const useFavorite = (an) => {
  const [isFavorite, setIsFavorite] = useState(false);
    const [baseUrl] = useStore((state) => [state.baseUrl]);
  
  useEffect(() => {
    const checkFavoriteEndpoint = `${baseUrl}/records/read/${an}`;
    
    axios.get(checkFavoriteEndpoint, { withCredentials: true })
      .then(response => {
        if (response.data && response.data.record_id) setIsFavorite(true);
        else setIsFavorite(false);
      })
      .catch(error => console.error('Error checking favorite:', error));
  }, [an]);

  return [isFavorite, setIsFavorite];
};