const initialState = {
    query: '*',
    shouldRefetch: true,
    recordModal: false,
}

export const createMainStore = (set, get) => ({
    ...initialState,
    setQuery: (query) => set({ query }),
    setShouldRefetch: (shouldRefetch) => set({ shouldRefetch }),
    setRecordModal: (recordModal) => set({ recordModal }),
})