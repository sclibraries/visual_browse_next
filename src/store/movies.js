const initialState = {
    movieHits: 0,
    moviePage: 1,
    movieTotalPages: 0,
    movieAction: [],
    movieData: [],
    movieQueryString: 'query-1=AND,*&facetfilter=1,SourceType:Videos&facetfilter=2,ContentProvider:Five+Colleges+Catalog',
    movieResultsQueryString: '',
    expanded: [],
    dateLimiter: '',
    smith: [
        'LB:Five Colleges Catalog-Smith College Annex',
        'LB:Five Colleges Catalog-Smith College Hillyer Art Library',
        'LB:Five Colleges Catalog-Smith College Josten Library',
        'LB:Five Colleges Catalog-Smith College Neilson Library',
        'LB:Five Colleges Catalog-Smith College Online',
        'LB:Five Colleges Catalog-Smith College Special Collections',
        'LB:Five Colleges Catalog-Smith College Storage',
        'LB:Smith College Online Resources',
        'LB:Smith College Online Resources-Smith College Online'
    ],
    dateLimiter: '',
    limiter: [],
    movieAppliedFacets: [],
    movieLocalOnly: false,
    movieFacets: [],
    movieFacetAction: '',
    sort: 'date',
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
const processFacetAction = (facetAction) => {
    return facetAction.replace("addfacetfilter(", "").replace(")", "");
}


export const createMoviesStore = (set, get) => ({
    ...initialState,
    setMovieAction: (action) => set({ action }),
    setMovieData: (movieData) => set({ movieData }),
    setMovieQueryString: (movieQueryString) => set({ movieQueryString }),
    setExpanded: (expanded) => set({ expanded }),
    setDateLimiter: (dateLimiter) => set({ dateLimiter }),
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
})