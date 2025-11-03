// hooks/useFetchCollectionDetails.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

export const useFetchPublicCollectionDetails = (collection_id, limit = 10, offset = 0) => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);
  const [collectionDetails, setCollectionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/collection_name/get-all-public/public-collection/${collection_id}`)

        if (response.status === 200) {
          setCollectionDetails(response.data.records);
        } else {
          setCollectionDetails(null);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (collection_id) {
      fetchCollectionDetails();
    }
  }, [collection_id, limit, offset]);

  return { collectionDetails, loading, error };
};
