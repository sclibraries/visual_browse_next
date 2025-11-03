const initialState = {
    query: '*',
    fieldCode: '',
    searchValue: '',
    shouldRefetch: false,
    recordModal: false,
    loading: false,
    location: '',
    subject: '',
    baseUrl: "https://libtools2.smith.edu:4000",
    currentURL: '',
    date: 30,
    dateLimiter: '',
    isStreaming: false,
    isStreamingImageUrl: ''
}

export const createMainStore = (set) => ({
    ...initialState,
    setQuery: (query) => set({ query }),
    setShouldRefetch: (shouldRefetch) => set({ shouldRefetch }),
    setRecordModal: (recordModal) => set({ recordModal }),
    setLoading: (loading) => set({ loading }),
    setLocation: (location) => set({ location }),
    setSubject: (subject) => set({ subject }),
    setCurrentURL: (url) => set({ currentURL: url }),
    setDate: (date) => set({ date }),
    setDateLimiter: (dateLimiter) => set({ dateLimiter }),
    setIsStreaming: (isStreaming) => set({ isStreaming }),
    setIsStreamingImageUrl: (isStreamingImageUrl) => set({ isStreamingImageUrl }),
    setSearchValue: (searchValue) => set({ searchValue }),
    setFieldCode: (fieldCode) => set({ fieldCode }),
})