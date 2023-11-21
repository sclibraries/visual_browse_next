import React, { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'react-toastify/dist/ReactToastify.css';
import GlobalLayout from '../layouts/GlobalLayout';
import '../css/local.css';
import axios from 'axios';
import { useStore } from '../store/store'; // adjust the import path as needed

function App({ Component, pageProps }) {
  const setLoggedIn = useStore((state) => state.setLoggedIn);

  useEffect(() => {
    axios
      .get('https://libtools2.smith.edu:4000/account/check-login', { withCredentials: true })
      .then((response) => {
        if (response.data.loggedIn) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      })
      .catch((error) => {
        console.error('Error checking login:', error);
      });
  }, []);

  return (
    <ApolloProvider client={client}>
      <GlobalLayout>
        <Component {...pageProps} />
      </GlobalLayout>
    </ApolloProvider>
  );
}

export default App;
