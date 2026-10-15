// useFetchData.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

export const useFetchAccountData = () => {
  // Only select the values we actually need and use
  const baseUrl = useStore((state) => state.baseUrl);
  const setUser = useStore((state) => state.setUser);
  const setCollections = useStore((state) => state.setCollections);
  const setCollectionCoverImage = useStore((state) => state.setCollectionCoverImage);
  const setFavorites = useStore((state) => state.setFavorites);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(`${baseUrl}/account/get-user-data`, { withCredentials: true });
        setUser(userResponse.data);

        const collectionResponse = await axios.get(`${baseUrl}/collection_name/read-all`, { withCredentials: true });
        setCollections(collectionResponse.data);
        if(collectionResponse.data.length > 0){
          setCollectionCoverImage(collectionResponse.data[0].cover_image)
        }

        // Fetch favorites and set in store
        const favoritesResponse = await axios.get(`${baseUrl}/records/read-all`, { withCredentials: true });
        setFavorites(favoritesResponse.data);

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  // Add dependencies to the useEffect dependency array
  }, [baseUrl, setUser, setCollections, setCollectionCoverImage, setFavorites, refetchTrigger]);

  // Function to trigger a refetch
  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { loading, error, refetch };
};
