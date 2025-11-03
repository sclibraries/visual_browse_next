const initialState = {
    //These are core to the movies store and work in conjunction with main > query. Initial searches should always be *
    movieRefine: 'n',
    movieSort: 'date',
    movieFieldCode: '',
    movieAction: 'addfacetfilter(SourceType:Videos,ContentProvider:Five Colleges Catalog)',
    //


    //Results after a search
    movieHits: 0,
    moviePage: 1,
    movieTotalPages: 0,
    // movieAction: [],
    movieData: [],
    movieQuery: '',
    movieResultsQueryString: '',
    expanded: [],
    movieDateLimiter: '',
    dateLimiter: '',
    limiter: [],
    movieAppliedFacets: [],
    movieLocalOnly: false,
    movieFacets: [],
    movieFacetAction: '',
    // sort: 'date',
    movieSubjectHeadings: [
        "Adventure films",
        "Animated films",
        "Bible films",
        "Comedy films",
        "Epic films",
        "Fantasy films",
        "Film noir",
        "Gangster films",
        "Historical films",
        "Horror films",
        "Legal drama (Films)",
        "Martial arts films",
        "Medical drama (Films)",
        "Monster films",
        "Mystery films",
        "Police films",
        "Romance films",
        "Science fiction films",
        "Short films",
        "Sports films",
        "Spy films",
        "Superhero films",
        "Suspense films",
        "War films",
        "Western films"
    ]
}


export const createMoviesStore = (set) => ({
    ...initialState,
    setMovieAction: (action) => set({ action }),
    setMovieData: (movieData) => set({ movieData }),
    setMovieQueryString: (movieQueryString) => set({ movieQueryString }),
    setExpanded: (expanded) => set({ expanded }),
    setMovieDateLimiter: (movieDateLimiter) => set({ movieDateLimiter }),
    setLimiter: (limiter) => set({ limiter }),
    setAppliedFacets: (appliedFacets) => set({ appliedFacets }),
    setLocalOnly: (localOnly) => set({ localOnly }),
    setSmith: (smith) => set({ smith }),
    setFacets: (facets) => set({ facets }),
    reset: () => set({ ...initialState }),
    setMovieFacets: (movieFacets) => set({ movieFacets }),
    setMovieAppliedFacets: (movieAppliedFacets) => set({ movieAppliedFacets }),
    setMovieFacetAction: (movieFacetAction) => set({ movieFacetAction }),
    removeMovieFacetAction: (facetAction) => {
        set((state) => ({
            movieFacetAction: state.movieFacetAction.filter(action => action !== facetAction),
        }));
    },
    setSort: (sort) => set({ sort }),
    setSubjectHeadings: (subjectHeadings) => set({ subjectHeadings }),
    setMovieHits: (hits) => set({ movieHits: hits }),
    setMovieResultsQueryString: (movieResultsQueryString) => set({ movieResultsQueryString }),
    setMoviePage: (page) => set({ moviePage: page }),
    setMovieTotalPages: (totalPages) => set({ movieTotalPages: totalPages }),
    setMovieRefine: (refine) => set({ movieRefine: refine }),
    setMovieFieldCode: (fieldCode) => set({ movieFieldCode: fieldCode }),
    setMovieSort: (sort) => set({ movieSort: sort }),
})