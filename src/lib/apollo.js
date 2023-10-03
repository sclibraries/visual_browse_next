import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://libtools2.smith.edu:4000',
  credentials: "include",
  cache: new InMemoryCache()
});

export default client;
