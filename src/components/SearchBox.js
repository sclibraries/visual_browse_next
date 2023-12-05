import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';
import { Container, Form, Input, Button, InputGroup, FormGroup } from 'reactstrap';
import { shallow } from 'zustand/shallow';
import FieldCodes from './FieldCodes';

function SearchBox() {
  const router = useRouter();
    // useRef to store the previous search query value
    const prevSearchQuery = useRef(router.query.search);
  // For Books and Movies
  const [
    setQuery, 
    searchValue, 
    setSearchValue,
    setBookRefine,
    setMovieSort,
    fieldCode,
    setFieldCode,
    setAllRefine,
  ] = useStore((state) => [
    state.setQuery, 
    state.searchValue, 
    state.setSearchValue,
    state.setBookRefine,
    state.setMovieSort,
    state.fieldCode,
    state.setFieldCode,
    state.setAllRefine,
  ], shallow);

  const [
    setShouldRefetch, 
    setMovieRefine
  ] = useStore((state) => [
    state.setShouldRefetch, 
    state.setMovieRefine
  ], shallow);

    // Function to update the query string
  
    useEffect(() => {
      if (prevSearchQuery.current !== router.query.search) {
        if (router.query.search) {
          const unescapedSearch = decodeURIComponent(router.query.search);
          setQuery(router.query.search);
          if(router.query.fieldcode) {
            setFieldCode(router.query.fieldcode)
          }
          if(router.pathname === '/movies') {
            setMovieRefine('n');
            setMovieSort('relevance');
          }

          if(router.pathname === '/books') {
            setBookRefine('n');
          }

          if(router.pathname === '/all') {
            setAllRefine('n');
          }

          setSearchValue(unescapedSearch);
          setShouldRefetch(true);
          prevSearchQuery.current = router.query.search;
        }
      }
    }, [router.query.search]);
    


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim() === '') {
      handleClear(); // Clear the search if the input is empty
      return;
    }
    setMovieRefine('n');
    setBookRefine('n');
    setAllRefine('n');
    setMovieSort('relevance')
    setQuery(searchValue);
  
    const escapedSearch = encodeURIComponent(searchValue);
  
    const currentPath = router.pathname;
    if (currentPath !== '/books' && currentPath !== '/movies') {
      // Redirect to /all with the search query for any path that is neither '/books' nor '/movies'
      router.push({ pathname: '/all', query: { search: escapedSearch } });
    } else {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, search: escapedSearch, fieldcode: fieldCode },
      });
    }
    
    setShouldRefetch(true);
  };
  
  // Function to update the query string (can be defined outside the component)
  const updateQueryTerm = (query, searchTerm) => {
    return query.replace(/(query-1=AND,)[^&]*/, `$1${encodeURIComponent(searchTerm)}`);
  };

  const handleClear = () => {
    setSearchValue('');
    setQuery('*');
    setMovieRefine('n');
    setBookRefine('n');
    setAllRefine('n');
    setFieldCode('');
    setMovieSort('date');
  
    setShouldRefetch(true);
  
    // Check if the current route is one of the specified routes
    if (['/movies', '/books', '/all'].includes(router.pathname)) {
      // If so, clear the search-related query parameters
      router.replace({ 
        pathname: router.pathname,
        query: {}  // Clears all query parameters for these specific paths
      }, undefined, { shallow: true });
    } else {
      // For other paths, maintain the existing query parameters
      router.replace({ 
        pathname: router.pathname,
        query: router.query  // Keeps the existing query parameters intact
      }, undefined, { shallow: true });
    }
  };
  
  

  

  return (
<div className="searchbox bg-white fixed z-100 p-8 shadow">
  <Form onSubmit={handleSearch} className="d-flex align-items-center">
    <div className="me-2" style={{ width: '20%' }}> {/* Adjust width as needed */}
      <FieldCodes />
    </div>
    <Input 
      id="search"
      type="text"
      placeholder="Search"
      value={searchValue}
      onChange={e => setSearchValue(e.target.value)}
      className="me-2 flex-grow-1" // Flex-grow to fill available space
    />
    <Button color="primary" className="me-2">Search</Button>
    <Button color="warning" onClick={handleClear}>Clear</Button>
  </Form>
</div>


  );
}

export default SearchBox;
