const initialState = {

    allRefine: 'n',
    allSort: 'relevance',
    allFieldCode: '',
    allAction: 'addfacetfilter(ContentProvider:Five Colleges Catalog,ContentProvider:Smith College Finding Aids)',
    allHits: 0,
    allPage: 1,
    allTotalPages: 0,
    allData: [],
    allResultsQueryString: '',
    allExpanded: [],
    allDateLimiter: '',
    allLimiter: "DT1:1600-01/2025-12",
    allAppliedFacets: [],
    allFacets: [],
    
    // Collections-related state
    allCollections: [],
    allCollectionHits: 0,
    includeCollections: true,
    collectionsLimit: 5,
}


export const createAllStore = (set) => ({
    ...initialState,
    setAllAction: (action) => set({ action }),
    setAllData: (allData) => set({ allData }),
    setAllQueryString: (allQueryString) => set({ allQueryString }),
    setAllResultsQueryString: (allResultsQueryString) => set({ allResultsQueryString }),
    setAllExpanded: (allExpanded) => set({ allExpanded }),
    setAllDateLimiter: (dateLimiter) => set({ dateLimiter }),
    setAllLimiter: (limiter) => set({ limiter }),
    setAllAppliedFacets: (allAppliedFacets) => set({ allAppliedFacets }),
    setAllFacets: (allFacets) => set({ allFacets}),
    reset: () => set({ ...initialState }),
    setAllHits: (allHits) => set({ allHits }),
    setAllSort: (allSort) => set({ allSort }),
    setAllSubjectHeadings: (allSubjectHeadings) => set({ allSubjectHeadings }),
    removeAllFacetAction: (facetAction) => {
        set((state) => ({
            allAction: state.allAction.filter(action => action !== facetAction),
        }))
    },
    setAllFacetAction: (allFacetAction) => set({ allFacetAction }),
    setAllPage: (allPage) => set({ allPage }),
    setAllTotalPages: (allTotalPages) => set({ allTotalPages }),
    setAllFieldCode: (allFieldCode) => set({ allFieldCode }),
    setAllRefine: (allRefine) => set({ allRefine }),
    
    // Collections actions
    setAllCollections: (collections) => set({ allCollections: collections }),
    setAllCollectionHits: (hits) => set({ allCollectionHits: hits }),
    setIncludeCollections: (include) => set({ includeCollections: include }),
    setCollectionsLimit: (limit) => set({ collectionsLimit: limit }),
})