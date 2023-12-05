const initialState = {

    allRefine: 'n',
    allSort: 'relevance',
    allFieldCode: '',
    allAction: 'addlimiter(FC:Y)',
    allHits: 0,
    allPage: 1,
    allTotalPages: 0,
    allData: [],
    allResultsQueryString: '',
    allExpanded: [],
    allDateLimiter: '',
    allLimiter: [],
    allAppliedFacets: [],
    allFacets: [],
    allSort: 'relevance',
}


export const createAllStore = (set, get) => ({
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
    setAllResultsQueryString: (allResultsQueryString) => set({ allResultsQueryString }),
    setAllPage: (allPage) => set({ allPage }),
    setAllTotalPages: (allTotalPages) => set({ allTotalPages }),
    setAllFieldCode: (allFieldCode) => set({ allFieldCode }),
    setAllRefine: (allRefine) => set({ allRefine }),
})