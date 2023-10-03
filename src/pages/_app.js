// src/app/_app.js
import { ApolloProvider } from '@apollo/client';
import client from '../lib/apollo';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import GlobalLayout from '../layouts/GlobalLayout';
import '../css/local.css'

function App({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <GlobalLayout>
        <Component {...pageProps} />
      </GlobalLayout>
    </ApolloProvider>
  )
}

export default App;