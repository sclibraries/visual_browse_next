import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';
import { Container, Form, Input, Button, InputGroup, FormGroup } from 'reactstrap';
import { shallow } from 'zustand/shallow';

function SearchBox() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
    // useRef to store the previous search query value
    const prevSearchQuery = useRef(router.query.search);
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
    setAllQueryString,
    setMovieResultsQueryString,
    setBookResultsQueryString,
    movieResultsQueryString,
    bookResultsQueryString,
    allResultsQueryString,
    setAllResultsQueryString,
    setBookFacetAction,
    setMovieFacetAction,
    setAllFacetAction,
  ] = useStore((state) => [
    state.movieQueryString, 
    state.setMovieQueryString, 
    state.shouldRefetch, 
    state.setShouldRefetch, 
    state.bookQueryString, 
    state.setBookQueryString, 
    state.allQueryString,
    state.setAllQueryString,
    state.setMovieResultsQueryString,
    state.setBookResultsQueryString,
    state.movieResultsQueryString,
    state.bookResultsQueryString,
    state.allResultsQueryString,
    state.setAllResultsQueryString,
    state.setBookFacetAction,
    state.setMovieFacetAction,
    state.setAllFacetAction,
  ], shallow);

    // Function to update the query string
  
    useEffect(() => {
      if (prevSearchQuery.current !== router.query.search) {
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

    const movieString = movieResultsQueryString !== '' ? movieResultsQueryString : movieQueryString;
    const bookString = bookResultsQueryString !== '' ? bookResultsQueryString : bookQueryString;
    const allString = allResultsQueryString !== '' ? allResultsQueryString : allQueryString;
  
    const newQuery = searchValue.trim() !== '' ? updateQueryTerm(movieString, searchValue) : '*';
    const newBookQuery = searchValue.trim() !== '' ? updateQueryTerm(bookString, searchValue) : '*';
    const newAllQuery = searchValue.trim() !== '' ? updateQueryTerm(allString, searchValue) : '*'; // For "All" search
    
    if(movieResultsQueryString !== '') {
      setMovieFacetAction('')
      setMovieResultsQueryString(newQuery);
    } else {
      setMovieFacetAction('')
      setMovieQueryString(newQuery);
    }

    if(bookResultsQueryString !== '') {
      setBookFacetAction('')
      setBookResultsQueryString(newBookQuery);
    } else {
      setBookFacetAction('')
      setBookQueryString(newBookQuery);
    }

    if(allResultsQueryString !== '') {
      setAllFacetAction('')
      setAllResultsQueryString(newAllQuery);
    } else {
      setAllFacetAction('')
      setAllQueryString(newAllQuery); 
    }
  
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
    const movieString = movieResultsQueryString !== '' ? movieResultsQueryString : movieQueryString;
    const bookString = bookResultsQueryString !== '' ? bookResultsQueryString : bookQueryString;
    const allString = allResultsQueryString !== '' ? allResultsQueryString : allQueryString;
    
    const newQuery = updateQueryTerm(movieString, '*')
    const newBookQuery = updateQueryTerm(bookString, '*')
    const newAllQuery = updateQueryTerm(allString, '*')
  
    if(movieResultsQueryString !== '') {
      setMovieResultsQueryString(newQuery);
    } else {
      setMovieQueryString(newQuery);
    }

    if(bookResultsQueryString !== '') {
      setBookResultsQueryString(newBookQuery);
    } else {
      setBookQueryString(newBookQuery);
    }

    if(allResultsQueryString !== '') {
      setAllResultsQueryString(newAllQuery);
    } else {
      setAllQueryString(newAllQuery);
    }

    const { search, ...restOfQuery } = router.query;
    setShouldRefetch(true)
    router.replace({ pathname: router.pathname, query: restOfQuery }, undefined, { shallow: true });
  };

  

  return (
<div className="searchbox bg-white fixed z-100 p-8 shadow">
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
