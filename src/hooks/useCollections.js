import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';

export const useCollections = () => {
  const [baseUrl] = useStore((state) => [state.baseUrl]);
  const setCollections = useStore((state) => state.setCollections);
  const loggedIn = useStore((state) => state.loggedIn);
  
  useEffect(() => {
    if(!loggedIn) return;
    axios.get(`${baseUrl}/collection_name/read-all`, { withCredentials: true })
      .then(response => setCollections(response.data))
      .catch(error => console.error('Error fetching collections:', error));
  }, [loggedIn]);

};