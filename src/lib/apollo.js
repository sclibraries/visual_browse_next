/* global Set */
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Custom merge function for foliosearch field
        foliosearch: {
          keyArgs: false,
          merge(existing = {}, incoming, { readField }) {
            // Initialize with existing instances if any
            const merged = existing.poLines ? existing.instances.slice(0) : [];
            // Iterate over incoming instances and append if not already present
            incoming.instances.forEach(incomingItem => {
              const exists = merged.some(
                existingItem => readField('id', existingItem) === readField('id', incomingItem)
              );
              if (!exists) {
                merged.push(incomingItem);
              }
            });
            // Return the merged data with new instances appended
            return {
              ...existing,
              ...incoming,
              instances: merged,
            };
          },
        },
        folioorders: {
          keyArgs: false,
          merge(existing = {}, incoming, { readField }) {
            const merged = existing.poLines ? existing.poLines.slice(0) : [];
            incoming.poLines.forEach(incomingItem => {
              const exists = merged.some(existingItem => readField('id', existingItem) === readField('id', incomingItem));
              if (!exists) {
                merged.push(incomingItem);
              }
            });
            return {
              ...existing,
              ...incoming,
              poLines: merged, // Corrected from instances to poLines
            };
          },
        },     
        records: {
          keyArgs: false,
          merge(existing = [], incoming) {
            // Concatenate the existing records with the incoming ones, avoiding duplicates
            const ids = new Set(existing.map(record => record.an));
            const merged = [...existing];
            incoming.forEach(record => {
              if (!ids.has(record.an)) {
                merged.push(record);
                ids.add(record.an);
              }
            });
            return merged;
          },
        },
        facets: {
          // Assuming facets doesn't need keyArgs because it's not directly queried with args
          keyArgs: false,
          merge(existing = {}, incoming, { mergeObjects }) {
            // Merge each facet category individually
            return Object.keys(incoming).reduce((acc, key) => {
              const existingFacet = existing[key] || {};
              const incomingFacet = incoming[key];

              // Merge the values array for each facet category
              acc[key] = {
                ...existingFacet,
                ...incomingFacet,
                values: mergeObjects(existingFacet.values, incomingFacet.values),
              };

              return acc;
            }, {...existing});
          },
        },
      },
    },
    // Define a policy for your FolioRecords if necessary
    FolioRecords: {
      keyFields: ['id'],
    },
    AvailableFacets: {
      keyFields: ["value", "action"], // Assuming combination of value and action uniquely identifies a facet option
    },
  },
});

const client = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: new HttpLink({
    uri: 'https://libtools2.smith.edu:4000',
    credentials: 'include',
  }),
  cache: cache,
});

export default client;


