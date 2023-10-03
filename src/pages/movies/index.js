import React, { useEffect, useState} from 'react'
import { useLazyQuery } from '@apollo/client'
import { GET_BROWSE } from '../../lib/api'
import { useStore } from '../../store/store'
import { shallow } from 'zustand/shallow'
import Image from 'next/image'
import Facets from '../../components/Facets'
import { Row, Col, Container } from 'reactstrap';
import MaterialDisplay from '../../components/MaterialDisplay'


function Movies() {
    
    const [loadMore, setLoadMore] = useState(false);

    const [
        query,
        setMovieData,
        setMovieFacets,
        setMovieAppliedFacets,
        movieAppliedFacets,
        movieFacetAction,
        limiter,
        smith,
        localOnly,
        dateLimiter,
        movieData,
        setMovieFacetAction,
        removeMovieFacetAction,
        sort,
        movieQueryString,
        setMovieQueryString,
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
        setLoading
    ] = useStore(state => [
        state.query,
        state.setMovieData,
        state.setMovieFacets,
        state.setMovieAppliedFacets,
        state.movieAppliedFacets,
        state.movieFacetAction,
        state.limiter,
        state.smith,
        state.localOnly,
        state.dateLimiter,
        state.movieData,
        state.setMovieFacetAction,
        state.removeMovieFacetAction,
        state.sort,
        state.movieQueryString,
        state.setMovieQueryString,
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
        state.setLoading
    ], shallow)

    useEffect(() => {
        setShouldRefetch(true);
    },[])


    useEffect(() => {
        if (shouldRefetch) {
            executeSearch({
                variables: {
                    query: movieQueryString,
                    // other variables...
                    action: movieFacetAction,
                    refine: 'y',
                    sort: sort
                }
            });
            // Reset the refetch flag
            setShouldRefetch(false);
        }
    }, [movieQueryString, movieFacetAction, query, shouldRefetch]);


    const handleOnComplete = data => {
        setMovieData(data?.search?.records)
        setMovieFacets(data?.search?.facets)
        setMovieAppliedFacets(data?.search?.facetFiltersWithAction)
        setMovieHits(data?.search?.statistics?.hits)
        setMovieQueryString(data?.search?.queryString)
        setMovieTotalPages(Math.ceil(data?.search?.statistics?.hits / 22))
    }

    const [executeSearch, { data, loading, error, fetchMore }] = useLazyQuery(GET_BROWSE, {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: data => { handleOnComplete(data) }
    });
    
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
        console.log(genre)
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
              query: movieQueryString, 
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