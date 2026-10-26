import { useEffect, useState, useRef} from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_BROWSE } from '../../lib/api'
import { useStore } from '../../store/store'
import { useShallow } from 'zustand/react/shallow'
import MaterialDisplay from '../../components/MaterialDisplay'


function Movies() {
    
    const [loadMore, setLoadMore] = useState(false);
    const executeSearchRef = useRef(null);

    const [
        setMovieData,
        setMovieFacets,
        setMovieAppliedFacets,
        movieAppliedFacets,
        movieFacetAction,
        movieData,
        setMovieFacetAction,
        sort,
        movieQueryString,
        movieSubjectHeadings,
        movieHits,
        setMovieHits,
        movieFacets,
        movieResultsQueryString,
        setMovieResultsQueryString,
        shouldRefetch,
        setShouldRefetch,
        movieTotalPages,
        setMovieTotalPages,
        moviePage,
        setMoviePage,
        setLoading,
        setMovieRefine,
    ] = useStore(useShallow(state => [
        state.setMovieData,
        state.setMovieFacets,
        state.setMovieAppliedFacets,
        state.movieAppliedFacets,
        state.movieFacetAction,
        state.movieData,
        state.setMovieFacetAction,
        state.sort,
        state.movieQueryString,
        state.movieSubjectHeadings,
        state.movieHits,
        state.setMovieHits,
        state.movieFacets,
        state.movieResultsQueryString,
        state.setMovieResultsQueryString,
        state.shouldRefetch,
        state.setShouldRefetch,
        state.movieTotalPages,
        state.setMovieTotalPages,
        state.moviePage,
        state.setMoviePage,
        state.setLoading,
        state.setMovieRefine,
    ]))

    useEffect(() => {
        setShouldRefetch(true);
    }, [setShouldRefetch])


    useEffect(() => {
        if (shouldRefetch) {
            const state = useStore.getState();

            let variables = {}

            if(state.movieRefine === 'y'){
                variables = {
                    query: state.movieResultsQueryString,
                    refine: 'y',
                    sort: state.movieSort, // Keep movie sort value current without adding a trigger.
                    ...(state.movieFacetAction && { action: state.movieFacetAction }),
                };
            } else {
                variables = {
                    query: state.query,
                    fieldcode: state.fieldCode,
                    refine: 'n',
                    sort: state.movieSort,
                    action: state.movieAction,
                    limiter: state.movieLimiter
                }
            }

            // const variables = {
            //     query: movieResultsQueryString !== '' ? movieResultsQueryString : movieQueryString,
            //     refine: 'y',
            //     sort: sort, // Assuming 'sort' is defined and holds the sorting parameter
            //     ...(movieFacetAction && { action: movieFacetAction }),
            // };
    
            executeSearchRef.current({ variables });
            state.setShouldRefetch(false);
    
            // Reset movieFacetAction if it was used
            if (state.movieFacetAction) {
                state.setMovieFacetAction('');
            }
        }
    }, [movieQueryString, movieResultsQueryString, movieFacetAction, sort, shouldRefetch, setMovieFacetAction, setShouldRefetch]);
    
      

    const handleOnComplete = data => {
        setMovieData(data?.search?.records)
        setMovieFacets(data?.search?.facets)
        setMovieAppliedFacets(data?.search?.facetFiltersWithAction)
        setMovieHits(data?.search?.statistics?.hits)
        setMovieResultsQueryString(data?.search?.queryString)
        setMovieTotalPages(Math.ceil(data?.search?.statistics?.hits / 22))
        setMovieRefine('y')
    }

    const [executeSearch, { data, loading, error, fetchMore }] = useLazyQuery(GET_BROWSE, {
        fetchPolicy: 'network-only',
        onCompleted: data => { handleOnComplete(data) }
    });
    executeSearchRef.current = executeSearch;

    useEffect(() => {
        // Assuming 'data' is the state that gets updated with the query result
        if (data?.search) {
          setMovieData(data.search.records);
          setMovieFacets(data.search.facets);
          setMovieAppliedFacets(data.search.facetFiltersWithAction);
          setMovieHits(data.search.statistics.hits);
          setMovieResultsQueryString(data.search.queryString);
          setMovieTotalPages(Math.ceil(data.search.statistics.hits / 22));
          setMovieRefine('y');
        }
      }, [data, setMovieData, setMovieFacets, setMovieAppliedFacets, setMovieHits, setMovieResultsQueryString, setMovieTotalPages, setMovieRefine]);
    
    setLoading(loading)
    
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const records = movieData
    

    const handleFacetAction = (action) => {
        setMovieFacetAction(action)
        setShouldRefetch(true);
    }

    const handleRemoveFacetAction = (action) => {
        setMovieFacetAction(action)
        setShouldRefetch(true);
    }

    const handleSelectGenre = (genre) => {
        setMovieFacetAction(`addfacetfilter(SubjectEDS:${genre})`)
        setShouldRefetch(true);
    }

    const handleLazyLoad = () => {
        setLoadMore(true)
        handleFetchMore()
       setMoviePage(moviePage + 1)
    }



    const handleFetchMore = () => {
        return fetchMore({
          variables: {
              query: movieResultsQueryString, 
              action: `gotopage(${moviePage + 1})`, 
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
            activatedFacets={movieFacetAction}
            facetDisplay={movieFacets}
            handleFacetAction={handleFacetAction}
            handleRemoveFacetAction={handleRemoveFacetAction}
            genre={movieSubjectHeadings}
            movieSubjectHeadings={movieSubjectHeadings}
            onSelect={handleSelectGenre}
            appliedFacets={movieAppliedFacets}
            hits={movieHits}
            materialType="Movie"
            page={moviePage}
            totalPages={movieTotalPages}
            handleLazyLoad={handleLazyLoad}
            loadMore={loadMore}
        />
      ); 
    
}

export default Movies
