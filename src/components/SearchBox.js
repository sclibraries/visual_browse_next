import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';
import { Container, Form, Input, Button, InputGroup, FormGroup } from 'reactstrap';
import { shallow } from 'zustand/shallow';

function SearchBox() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  // For Books and Movies
  const [query, setQuery] = useStore((state) => [state.query, state.setQuery]);
  const [
    movieQueryString, 
    setMovieQueryString, 
    shouldRefetch, 
    setShouldRefetch, 
    bookQueryString, 
    setBookQueryString,
    allQueryString,
    setAllQueryString
  ] = useStore((state) => [
    state.movieQueryString, 
    state.setMovieQueryString, 
    state.shouldRefetch, 
    state.setShouldRefetch, 
    state.bookQueryString, 
    state.setBookQueryString, 
    state.allQueryString,
    state.setAllQueryString
  ], shallow);

    // Function to update the query string
  
    useEffect(() => {
      if (router.query.search) {
        const unescapedSearch = decodeURIComponent(router.query.search);
    
        const newQuery = updateQueryTerm(movieQueryString, unescapedSearch);
        const newBookQuery = updateQueryTerm(bookQueryString, unescapedSearch);
        const newAllQuery = updateQueryTerm(allQueryString, unescapedSearch);
    
        console.log('New Movie Query:', newQuery);
        console.log('New Book Query:', newBookQuery);
        console.log('New All Query:', newAllQuery);
    
        setMovieQueryString(newQuery);
        setBookQueryString(newBookQuery);
        setAllQueryString(newAllQuery);
    
        setQuery(router.query.search);
        setSearchValue(unescapedSearch);
        setShouldRefetch(true);
      }
    }, [router.query.search]);
    


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim() === '') {
      handleClear(); // Clear the search if the input is empty
      return;
    }
  
    const newQuery = searchValue.trim() !== '' ? updateQueryTerm(movieQueryString, searchValue) : '*';
    const newBookQuery = searchValue.trim() !== '' ? updateQueryTerm(bookQueryString, searchValue) : '*';
    const newAllQuery = searchValue.trim() !== '' ? updateQueryTerm(allQueryString, searchValue) : '*'; // For "All" search
  
    setMovieQueryString(newQuery);
    setBookQueryString(newBookQuery);
    setAllQueryString(newAllQuery); // Update "All" search query
  
    const escapedSearch = encodeURIComponent(searchValue);
  
    const currentPath = router.pathname;
    if (currentPath !== '/books' && currentPath !== '/movies') {
      // Redirect to /all with the search query for any path that is neither '/books' nor '/movies'
      router.push({ pathname: '/all', query: { search: escapedSearch } });
    } else {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, search: escapedSearch },
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
    const newQuery = updateQueryTerm(movieQueryString, '*')
    const newBookQuery = updateQueryTerm(bookQueryString, '*')
  
    // Update the moviesStore with the new query string
    setMovieQueryString(newQuery);
    setBookQueryString(newBookQuery);
    const { search, ...restOfQuery } = router.query;
    setShouldRefetch(true)
    router.replace({ pathname: router.pathname, query: restOfQuery }, undefined, { shallow: true });
  };

  

  return (
<div className="searchbox bg-white fixed z-100 p-3 shadow">
  <Form onSubmit={handleSearch} className="d-flex align-items-center">
    <Input 
      id="search"
      type="text"
      placeholder="Search"
      value={searchValue}
      onChange={e => setSearchValue(e.target.value)}
      className="me-2" // Add some margin to the right of the input
    />
    <Button color="primary" className="me-2">Search</Button>
    <Button color="warning" onClick={handleClear}>Clear</Button>
  </Form>
</div>

  );
}

export default SearchBox;
