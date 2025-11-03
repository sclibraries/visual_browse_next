import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import GlobalLayout from '../layouts/GlobalLayout';
import '../css/local.css';
import axios from 'axios';
import { useStore } from '../store/store'; // Adjust the import path as needed
import Script from 'next/script';
import Head from 'next/head';

function App({ Component, pageProps }) {
  const setLoggedIn = useStore((state) => state.setLoggedIn);
  const setAuthChecked = useStore((state) => state.setAuthChecked);

  useEffect(() => {
    axios
      .get('https://libtools2.smith.edu:4000/account/check-login', { withCredentials: true })
      .then((response) => {
        setLoggedIn(!!response?.data?.loggedIn);
      })
      .catch((error) => {
        console.error('Error checking login:', error);
        setLoggedIn(false);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [setAuthChecked, setLoggedIn]);

  return (
    <>
      <Head>
        <title>Visual Browse</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-CVNB7BWQND`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CVNB7BWQND', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <ApolloProvider client={client}>
        <GlobalLayout>
          <Component {...pageProps} />
        </GlobalLayout>
      </ApolloProvider>
    </>
  );
}

export default App;
