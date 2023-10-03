import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_BROWSE } from '../../lib/api';
import { useStore } from '../../store/store'
import MaterialDisplay from '../../components/MaterialDisplay';
import { shallow } from 'zustand/shallow';

function All() {
    const [loadMore, setLoadMore] = useState(false);

    const [
        query,
        setAllData,
        setAllFacets,
        setAllAppliedFacets,
        allAppliedFacets,
        allFacetAction,
        allLimiter,
        allDateLimiter,
        allData,
        setAllFacetAction,
        removeAllFacetAction,
        allSort,
        allQueryString,
        setAllQueryString,
        allSubjectHeadings,
        allHits,
        setAllHits,
        allFacets,
        allResultsQueryString,
        setAllResultsQueryString,
        shouldRefetch,
        setShouldRefetch,
        allPage,
        setAllPage,
        allTotalPages,
        setAllTotalPages
    ] = useStore(state => [
        state.query,
        state.setAllData,
        state.setAllFacets,
        state.setAllAppliedFacets,
        state.allAppliedFacets,
        state.allFacetAction,
        state.allLimiter,
        state.allDateLimiter,
        state.allData,
        state.setAllFacetAction,
        state.removeAllFacetAction,
        state.allSort,
        state.allQueryString,
        state.setAllQueryString,
        state.allSubjectHeadings,
        state.allHits,
        state.setAllHits,
        state.allFacets,
        state.allResultsQueryString,
        state.setAllResultsQueryString,
        state.shouldRefetch,
        state.setShouldRefetch,
        state.allPage,
        state.setAllPage,
        state.allTotalPages,
        state.setAllTotalPages
    ], shallow)

  useEffect(() => {
    setShouldRefetch(true);
},[])

useEffect(() => {
    if(shouldRefetch){
        executeSearch({
            variables: {
                query: allQueryString,
                action: allFacetAction,
                refine: 'y',
                sort: allSort,
                dateLimiter: allDateLimiter
            }
        });
        setShouldRefetch(false)
    }
}, [allQueryString, allFacetAction, allSort, allLimiter, allDateLimiter, shouldRefetch])

    const handleOnComplete = data => {
        setAllData(data?.search?.records)
        setAllFacets(data?.search?.facets)
        setAllAppliedFacets(data?.search?.facetFiltersWithAction)
        setAllHits(data?.search?.statistics?.hits)
        setAllResultsQueryString(data?.search?.queryString)
        setAllTotalPages(data?.search?.statistics?.hits / 22)
    }

    const [executeSearch, { loading, data, error, fetchMore }] = useLazyQuery(GET_BROWSE, {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onCompleted: data => { handleOnComplete(data) }
    })

    if (error) return <div>Error loading.</div>

    const records = allData

    console.log(allData)

    const handleFacetAction = (action) => {
        setAllFacetAction(action)
        setShouldRefetch(true)
    }

    const handleRemoveFacetAction = (action) => {
        setAllFacetAction(action)
        setShouldRefetch(true)
    }

    const handleSelectGenre = (genre) => {
        setAllFacetAction(`addfacetfilter(SubjectEDS:${genre})`)
        setShouldRefetch(true)
    }

    const handleLazyLoad = () => {
        setLoadMore(true)
        handleFetchMore()
       setAllPage(allPage + 1)
    }



    const handleFetchMore = () => {
        return fetchMore({
          variables: {
              query: allQueryString, 
              action: `gotopage(${allPage + 1})`, 
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
            activatedFacets={allFacetAction}
            facetDisplay={allFacets}
            handleFacetAction={handleFacetAction}
            handleRemoveFacetAction={handleRemoveFacetAction}
            genre={allSubjectHeadings}
            allSubjectHeadings={allSubjectHeadings}
            onSelect={handleSelectGenre}
            appliedFacets={allAppliedFacets}
            hits={allHits}
            materialType="All"
            totalPages={allTotalPages}
            page={allPage}
            handleLazyLoad={handleLazyLoad}
            loadMore={loadMore}
        />
    )
}

export default All;
