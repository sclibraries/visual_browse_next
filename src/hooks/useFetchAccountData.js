// useFetchData.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

export const useFetchAccountData = () => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);
  const [user, setUser] = useStore((state) => [state.user, state.setUser]);
  const [collections, setCollections] = useStore((state) => [state.collections, state.setCollections]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(`${baseUrl}/account/get-user-data`, { withCredentials: true });
        setUser(userResponse.data);

        const collectionResponse = await axios.get(`${baseUrl}/collection_name/read-all`, { withCredentials: true });
        setCollections(collectionResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { loading, error };
};
