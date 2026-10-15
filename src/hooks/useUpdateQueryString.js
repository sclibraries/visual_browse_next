import { useState, useEffect } from 'react';

const useUpdateQueryString = (originalQueryString, facetAction) => {
  const [updatedQueryString, setUpdatedQueryString] = useState(originalQueryString);


  useEffect(() => {
    const updateQueryString = () => {
      if (!originalQueryString) return;

      const params = new URLSearchParams(originalQueryString);

      // Handle the facet action
      if (facetAction) {
        // Extracting facet key and value from the action
        const actionParts = facetAction.match(/\(([^)]+)\)/);
        if (actionParts && actionParts.length > 1) {
          const [facetKey, facetValue] = actionParts[1].split(':');

          // Remove existing facet filter with the same key to avoid duplication
          Array.from(params.keys()).forEach(key => {
            if (key === 'facetfilter' && params.get(key).startsWith(`${facetKey}:`)) {
              params.delete(key);
            }
          });

          // Append the new facet filter
          params.append('facetfilter', `${facetKey}:${encodeURIComponent(facetValue)}`);
        }
      }

      setUpdatedQueryString(params.toString());
    };

    updateQueryString();
  }, [originalQueryString, facetAction]);

  return updatedQueryString;
};

export default useUpdateQueryString;
