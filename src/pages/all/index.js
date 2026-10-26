import { useState, useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_BROWSE } from '../../lib/api';
import { useStore } from '../../store/store'
import MaterialDisplay from '../../components/MaterialDisplay';
import { useShallow } from 'zustand/react/shallow';

function All() {
    const [loadMore, setLoadMore] = useState(false);
    const executeSearchRef = useRef(null);

    const [
        setAllData,
        setAllFacets,
        setAllAppliedFacets,
        allAppliedFacets,
        allFacetAction,
        allDateLimiter,
        allData,
        setAllFacetAction,
        allSort,
        allQueryString,
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
        setAllTotalPages,
        setLoading,
        setAllRefine,
    ] = useStore(useShallow(state => [
        state.setAllData,
        state.setAllFacets,
        state.setAllAppliedFacets,
        state.allAppliedFacets,
        state.allFacetAction,
        state.allDateLimiter,
        state.allData,
        state.setAllFacetAction,
        state.allSort,
        state.allQueryString,
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
        state.setAllTotalPages,
        state.setLoading,
        state.setAllRefine,
    ]))

  useEffect(() => {
    setShouldRefetch(true);
}, [setShouldRefetch])

useEffect(() => {
    if (shouldRefetch) {
        const state = useStore.getState();
        let variables = {}
        if(state.allRefine === 'y') {
            variables = {
                query: state.allResultsQueryString,
                refine: 'y',
                sort: allSort,
                ...(state.allFacetAction && { action: state.allFacetAction }),
            };
        } else {
            variables = {
                query: state.query,
                fieldcode: state.fieldCode,
                refine: 'n',
                sort: allSort,
                action: state.allAction,
                limiter: state.allLimiter
            }
        }

        executeSearchRef.current({ variables });
        state.setShouldRefetch(false);

        // Reset allFacetAction if it was used
        if (state.allFacetAction) {
            state.setAllFacetAction('');
        }
    }
}, [allQueryString, allFacetAction, allSort, allDateLimiter, shouldRefetch, setAllFacetAction, setShouldRefetch]);


    const handleOnComplete = data => {
        setAllData(data?.search?.records)
        setAllFacets(data?.search?.facets)
        setAllAppliedFacets(data?.search?.facetFiltersWithAction)
        setAllHits(data?.search?.statistics?.hits)
        setAllResultsQueryString(data?.search?.queryString)
        setAllTotalPages(data?.search?.statistics?.hits / 22)
        setAllRefine('y')
    }

    const [executeSearch, { loading, data, error, fetchMore }] = useLazyQuery(GET_BROWSE, {
        fetchPolicy: 'network-only',
        onCompleted: data => { handleOnComplete(data) }
    })
    executeSearchRef.current = executeSearch;

    useEffect(() => {
        // Assuming 'data' is the state that gets updated with the query result
        if (data?.search) {
            setAllData(data?.search?.records)
            setAllFacets(data?.search?.facets)
            setAllAppliedFacets(data?.search?.facetFiltersWithAction)
            setAllHits(data?.search?.statistics?.hits)
            setAllResultsQueryString(data?.search?.queryString)
            setAllTotalPages(data?.search?.statistics?.hits / 22)
            setAllRefine('y')
        }
      }, [data, setAllData, setAllFacets, setAllAppliedFacets, setAllHits, setAllResultsQueryString, setAllTotalPages, setAllRefine]);

    if (error) return <div>Error loading.</div>
    setLoading(loading)

    const records = allData

    

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
              query: allResultsQueryString, 
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
