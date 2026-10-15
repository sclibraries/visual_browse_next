import  { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';
import {  Form, Input, Button } from 'reactstrap';
import { shallow } from 'zustand/shallow';
import FieldCodes from './FieldCodes';

const {
  buildSearchClearNavigation,
  buildSearchNavigation,
  getSearchScope,
} = require('../utils/collectionSearchRouting.cjs');

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
    setAllAction,
    // Add these to check existing data
    allData,
    allHits
  ] = useStore((state) => [
    state.setQuery, 
    state.searchValue, 
    state.setSearchValue,
    state.setBookRefine,
    state.setMovieSort,
    state.fieldCode,
    state.setFieldCode,
    state.setAllRefine,
    state.setAllAction,
    // Add existing data check
    state.allData,
    state.allHits
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
            // Only reset allRefine if we don't have existing data for this search
            const hasExistingData = (allData && allData.length > 0) || allHits > 0;
            if (!hasExistingData) {
              setAllRefine('n');
            }
          }

          setSearchValue(unescapedSearch);
          setShouldRefetch(true);
          prevSearchQuery.current = router.query.search;
        }
      }
    }, [router.query.search, router.pathname, router.query.fieldcode, setQuery, setFieldCode, setMovieRefine, setMovieSort, setBookRefine, setAllRefine, setSearchValue, setShouldRefetch, allData, allHits]);
    


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

    router.push(buildSearchNavigation({
      pathname: router.pathname,
      query: router.query,
      searchValue,
      fieldCode,
    }));
    
    setShouldRefetch(true);
  };
  
  // Function to update the query string (can be defined outside the component)
  // const updateQueryTerm = (query, searchTerm) => {
  //   return query.replace(/(query-1=AND,)[^&]*/, `$1${encodeURIComponent(searchTerm)}`);
  // };

  const handleClear = () => {
    setSearchValue('');
    setQuery('*');
    setMovieRefine('n');
    setBookRefine('n');
    setAllRefine('n');
    setFieldCode('');
    setMovieSort('date');
  
    setShouldRefetch(true);
  
    router.replace(
      buildSearchClearNavigation({
        pathname: router.pathname,
        query: router.query,
      }),
      undefined,
      { shallow: true }
    );
  };
  
  

  

  // Function to handle expanding search to all materials
  const handleSearchAll = () => {
    // Set the proper action for "all" search to include both catalogs and finding aids
    setAllAction('addfacetfilter(ContentProvider:Five Colleges Catalog,ContentProvider:Smith College Finding Aids)');
    setAllRefine('n');
    
    if (searchValue.trim() === '') {
      // If no search text, just navigate to /all without search query
      setQuery('*');
      router.push('/all');
      setShouldRefetch(true);
      return;
    }
    
    setQuery(searchValue);
    const escapedSearch = encodeURIComponent(searchValue);
    
    router.push({
      pathname: '/all',
      query: { search: escapedSearch, fieldcode: fieldCode }
    });
    setShouldRefetch(true);
  };

  // Get current search scope for display
  const currentScope = getSearchScope(router.pathname);
  const isLimitedScope = router.pathname === '/books' || router.pathname === '/movies';
  const scopeBadgeLabel = currentScope.label === 'All Materials'
    ? 'All'
    : currentScope.label === 'Books Only'
      ? 'Books'
      : currentScope.label === 'Movies Only'
        ? 'Movies'
        : 'Collection';
  const primarySearchLabel = currentScope.label === 'Books Only'
    ? 'Books'
    : currentScope.label === 'Movies Only'
      ? 'Movies'
      : 'Collection';

  return (
<div className="searchbox bg-white fixed z-100 shadow" style={{ 
  padding: '16px 16px 20px 16px', 
  top: '56px',
  left: 0,
  right: 0,
  borderBottom: '1px solid #e5e7eb'
}}>
  <Form onSubmit={handleSearch}>
    {/* Mobile Layout */}
    <div className="d-block d-md-none">
      {/* Top Row: Field Code and Search Input */}
      <div className="d-flex gap-2 mb-2">
        <div style={{ width: '35%', minWidth: '120px' }}>
          <FieldCodes />
        </div>
        <div className="flex-grow-1 position-relative">
          <Input 
            id="search"
            type="text"
            placeholder={`Search ${currentScope.label.toLowerCase()}...`}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            style={{
              paddingLeft: '12px',
              paddingRight: '12px',
              height: '42px'
            }}
          />
        </div>
      </div>
      
      {/* Bottom Row: Scope Badge and Action Buttons */}
      <div className="d-flex align-items-center gap-2">
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          backgroundColor: `${currentScope.color}15`,
          color: currentScope.color,
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          border: `1px solid ${currentScope.color}30`,
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.7rem' }}>{currentScope.icon}</span>
          {scopeBadgeLabel}
        </span>
        
        <Button 
          color="primary" 
          size="sm"
          style={{ 
            height: '36px',
            fontSize: '0.85rem',
            flex: '1',
            minWidth: '70px'
          }}
        >
          Search
        </Button>
        
        {isLimitedScope && (
          <button
            type="button"
            onClick={handleSearchAll}
            disabled={!searchValue.trim()}
            title="Search all materials"
            style={{
              background: searchValue.trim() 
                ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                : '#e5e7eb',
              border: 'none',
              borderRadius: '6px',
              padding: '0 8px',
              height: '36px',
              color: searchValue.trim() ? 'white' : '#9ca3af',
              cursor: searchValue.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.8rem',
              fontWeight: '500',
              flex: '1',
              minWidth: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            All
          </button>
        )}
        
        <Button 
          color="outline-secondary" 
          size="sm"
          onClick={handleClear}
          style={{ 
            height: '36px',
            fontSize: '0.85rem',
            minWidth: '60px'
          }}
        >
          Clear
        </Button>
      </div>
    </div>

    {/* Desktop Layout */}
    <div className="d-none d-md-flex align-items-center gap-3">
      {/* Field Codes - Compact */}
      <div style={{ minWidth: '140px', maxWidth: '220px' }}>
        <FieldCodes />
      </div>
      
      {/* Search Input with Scope Indicator */}
      <div className="position-relative flex-grow-1">
        <Input 
          id="search"
          type="text"
          placeholder={`Search ${currentScope.label.toLowerCase()}...`}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          style={{
            paddingLeft: '12px',
            paddingRight: isLimitedScope ? '110px' : '12px',
            height: '42px'
          }}
        />
        
        {/* Scope Badge - Inside Input */}
        <span style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 10px',
          backgroundColor: `${currentScope.color}15`,
          color: currentScope.color,
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '600',
          border: `1px solid ${currentScope.color}30`,
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.75rem' }}>{currentScope.icon}</span>
          {scopeBadgeLabel}
        </span>
      </div>
      
      {/* Action Buttons with clearer labels */}
      <Button 
        color="primary" 
        style={{ 
          minWidth: isLimitedScope && searchValue.trim() ? '140px' : '100px',
          height: '42px',
          fontWeight: '500'
        }}
      >
        {isLimitedScope && searchValue.trim() ? 
          `Search ${primarySearchLabel}` : 
          'Search'
        }
      </Button>
      
      {/* Expand Search Button - Always visible on limited scope pages */}
      {isLimitedScope && (
        <button
          type="button"
          onClick={handleSearchAll}
          disabled={!searchValue.trim()}
          title="Search across all materials (books, movies, finding aids, etc.)"
          style={{
            background: searchValue.trim() 
              ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
              : '#e5e7eb',
            border: 'none',
            borderRadius: '8px',
            padding: '0 16px',
            height: '42px',
            color: searchValue.trim() ? 'white' : '#9ca3af',
            cursor: searchValue.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
            fontWeight: '500',
            fontSize: '0.9rem',
            minWidth: '160px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(124,58,237,0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)';
          }}
          onFocus={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(124,58,237,0.4)';
          }}
          onBlur={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)';
          }}
        >
          <span>🌐</span>
          Search Everything
        </button>
      )}
      
      <Button 
        color="outline-secondary" 
        onClick={handleClear}
        style={{ 
          minWidth: '70px',
          height: '42px'
        }}
      >
        Clear
      </Button>
    </div>
  </Form>
</div>


  );
}

export default SearchBox;
