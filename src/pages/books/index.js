import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_BROWSE } from '../../lib/api'
import { useStore } from '../../store/store'
import { shallow } from 'zustand/shallow'
import MaterialDisplay from '../../components/MaterialDisplay'
import useUpdateQueryString from '@/hooks/useUpdateQueryString'

function Books() {
    const [loadMore, setLoadMore] = useState(false);

    const [
        query,
        setBookData,
        setBookFacets,
        setBookAppliedFacets,
        bookAppliedFacets,
        bookFacetAction,
        bookLimiter,
        bookDateLimiter,
        bookData,
        setBookFacetAction,
        removeBookFacetAction,
        bookQueryString,
        setBookQueryString,
        bookSubjectHeadings,
        bookHits,
        setBookHits,
        bookFacets,
        bookResultsQueryString,
        setBookResultsQueryString,
        shouldRefetch,
        setShouldRefetch,
        bookPage,
        setBookPage,
        bookTotalPages,
        setBookTotalPages,
        setLoading,
        dateLimiter,
        bookRefine,
        bookSort,
        bookAction,
        setBookRefine,
        fieldCode
    ] = useStore(state => [
        state.query,
        state.setBookData,
        state.setBookFacets,
        state.setBookAppliedFacets,
        state.bookAppliedFacets,
        state.bookFacetAction,
        state.bookLimiter,
        state.bookDateLimiter,
        state.bookData,
        state.setBookFacetAction,
        state.removeBookFacetAction,
        state.bookQueryString,
        state.setBookQueryString,
        state.bookSubjectHeadings,
        state.bookHits,
        state.setBookHits,
        state.bookFacets,
        state.bookResultsQueryString,
        state.setBookResultsQueryString,
        state.shouldRefetch,
        state.setShouldRefetch,
        state.bookPage,
        state.setBookPage,
        state.bookTotalPages,
        state.setBookTotalPages,
        state.setLoading,
        state.dateLimiter,
        state.bookRefine,
        state.bookSort,
        state.bookAction,
        state.setBookRefine,
        state.fieldCode
    ], shallow)

    useEffect(() => {
        setShouldRefetch(true)
    }, [])


    useEffect(() => {
        if (shouldRefetch) {
          let variables = {}
          
          if(bookRefine === 'y'){
            variables = {
                query: bookResultsQueryString,
                refine: 'y',
                sort: bookSort,
                ...(bookFacetAction && { action: bookFacetAction }),
              };
          } else {
            variables = {
                query: query,
                refine: 'n',
                fieldcode: fieldCode,
                sort: bookSort,
                action: bookAction
            }
          }
        //   const variables = {
        //     query: bookResultsQueryString !== '' ? bookResultsQueryString : bookQueryString,
        //     refine: 'y',
        //     // Include limiter and sort if they have values
        //     ...(dateLimiter && { limiter: dateLimiter }),
        //     ...(bookSort && { sort: bookSort }),
        //   };
      
        //   // Only include action if it's set and then reset it
        //   if (bookFacetAction) {
        //     variables.action = bookFacetAction;
        //     // Resetting bookFacetAction immediately after it's used
        //     setBookFacetAction('');
        //   }
      
          executeSearch({ variables });
          setShouldRefetch(false);
        }
      }, [bookQueryString, bookResultsQueryString, bookFacetAction, bookSort, dateLimiter, shouldRefetch, setShouldRefetch, setBookFacetAction]);

    const handleOnComplete = data => {
        setBookData(data?.search?.records)
        setBookFacets(data?.search?.facets)
        setBookAppliedFacets(data?.search?.facetFiltersWithAction)
        setBookHits(data?.search?.statistics?.hits)
        setBookResultsQueryString(data?.search?.queryString)
        setBookTotalPages(data?.search?.statistics?.hits / 22)
        setBookRefine('y')
    }

    const [executeSearch, { loading, data, error, fetchMore }] = useLazyQuery(GET_BROWSE, {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: data => { handleOnComplete(data) }
    })
    setLoading(loading)

    if (error) return <div>Error loading books.</div>
    const records = bookData

    const handleFacetAction = (action) => {
        setBookFacetAction(action)
        setShouldRefetch(true)
    }

    const handleRemoveFacetAction = (action) => {
        setBookFacetAction(action)
        setShouldRefetch(true)
    }

    const handleSelectGenre = (genre) => {
        setBookFacetAction(`addfacetfilter(SubjectEDS:${genre})`)
        setShouldRefetch(true)
    }

    const handleLazyLoad = () => {
        setLoadMore(true)
        handleFetchMore()
       setBookPage(bookPage + 1)
    }



    const handleFetchMore = () => {
        return fetchMore({
          variables: {
              query: bookResultsQueryString, 
              action: `gotopage(${bookPage + 1})`, 
              refine: 'y'
            },
          updateQuery: (previousResult, {fetchMoreResult}) => {
            const newCollections = fetchMoreResult?.search?.records
            setLoadMore(false)
            return newCollections.length
              ? {
                search: {
                  records: [...previousResult.search.records, ...newCollections],
                  autoSuggestedTerms: fetchMoreResult.search.autoSuggestedTerms,
                  facetFiltersWithAction: fetchMoreResult.search.facetFiltersWithAction,
                  expandersWithAction: fetchMoreResult.search.expandersWithAction,
                  facets: fetchMoreResult.search.facets,
                  limtersWithAction: fetchMoreResult.search.limtersWithAction,
                  queryString: fetchMoreResult.search.queryString,
                  statistics: fetchMoreResult.search.statistics,
                  queryWithAction: fetchMoreResult.search.queryWithAction,
                  __typename: previousResult.search.__typename,
                  },
                }
              : previousResult;
          },
        })
      }

    return (
        <MaterialDisplay
            records={records}
            activatedFacets={bookFacetAction}
            facetDisplay={bookFacets}
            handleFacetAction={handleFacetAction}
            handleRemoveFacetAction={handleRemoveFacetAction}
            genre={bookSubjectHeadings}
            bookSubjectHeadings={bookSubjectHeadings}
            onSelect={handleSelectGenre}
            appliedFacets={bookAppliedFacets}
            hits={bookHits}
            materialType="Book"
            totalPages={bookTotalPages}
            page={bookPage}
            handleLazyLoad={handleLazyLoad}
            loadMore={loadMore}
        />
    )
}

export default Books