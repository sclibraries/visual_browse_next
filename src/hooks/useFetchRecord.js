import { useQuery } from '@apollo/client';
import { GET_RECORD } from '../lib/api';

export const useFetchRecord = () => {
    const { loading, error, data, refetch } = useQuery(GET_RECORD, {
      skip: true, // Skip the query upon component mount
    });
  
    const fetchRecord = (an, dbid) => {
      refetch({ an, dbid });
    };
  
    return {
      loading,
      error,
      data,
      fetchRecord,
    };
  };