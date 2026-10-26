import { useState, useEffect, useRef } from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_BROWSE } from '../../lib/api'
import { useStore } from '../../store/store'
import { useShallow } from 'zustand/react/shallow'
import MaterialDisplay from '../../components/MaterialDisplay'

function Books() {
    const [loadMore, setLoadMore] = useState(false);
    const executeSearchRef = useRef(null);

    const [
        setBookData,
        setBookFacets,
        setBookAppliedFacets,
        bookAppliedFacets,
        bookFacetAction,
        bookData,
        setBookFacetAction,
        bookQueryString,
        bookGenres,
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
        bookSort,
        setBookRefine,
    ] = useStore(useShallow(state => [
        state.setBookData,
        state.setBookFacets,
        state.setBookAppliedFacets,
        state.bookAppliedFacets,
        state.bookFacetAction,
        state.bookData,
        state.setBookFacetAction,
        state.bookQueryString,
        state.bookGenres,
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
        state.bookSort,
        state.setBookRefine,
    ]))

    useEffect(() => {
        setShouldRefetch(true)
    }, [setShouldRefetch])


    useEffect(() => {
        if (shouldRefetch) {
          const state = useStore.getState();
          let variables = {}
          
          if(state.bookRefine === 'y'){
            variables = {
                query: state.bookResultsQueryString,
                refine: 'y',
                sort: state.bookSort,
                ...(state.bookFacetAction && { action: state.bookFacetAction }),
              };
          } else {
            variables = {
                query: state.query,
                refine: 'n',
                fieldcode: state.fieldCode,
                sort: state.bookSort,
                action: state.bookAction,
                limiter: state.bookLimiter
            }
          }
      
          executeSearchRef.current({ variables });
          state.setShouldRefetch(false);
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
        onCompleted: data => { handleOnComplete(data) }
    })
    executeSearchRef.current = executeSearch;

    useEffect(() => {
      // Assuming 'data' is the state that gets updated with the query result
      if (data?.search) {
        setBookData(data?.search?.records)
        setBookFacets(data?.search?.facets)
        setBookAppliedFacets(data?.search?.facetFiltersWithAction)
        setBookHits(data?.search?.statistics?.hits)
        setBookResultsQueryString(data?.search?.queryString)
        setBookTotalPages(data?.search?.statistics?.hits / 22)
        setBookRefine('y')
      }
    }, [data, setBookData, setBookFacets, setBookAppliedFacets, setBookHits, setBookResultsQueryString, setBookTotalPages, setBookRefine]);

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
            genre={bookGenres}
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
