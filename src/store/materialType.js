const getInitialState = (type) => {
    const baseState = {
        hits: 0,
        action: [],
        resultsQueryString: '',
        expanded: [],
        dateLimiter: '',
        limiter: [],
        appliedFacets: [],
        localOnly: false,
        facets: [],
        facetAction: '',
    };

    if (type === 'movie') {
        return {
            ...baseState,
            data: [],
            sort: 'date',
            queryString: 'query-1=AND,*&facetfilter=1,SourceType:Videos&facetfilter=2,ContentProvider:Five+Colleges+Catalog',
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
            ], // your movie-specific smith data
            subjectHeadings: [
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
            ], // movie subject headings
        };
    } else if (type === 'book') {
        return {
            ...baseState,
            data: [],
            sort: "relevance",
            queryString: 'query-1=AND,*&facetfilter=1,SourceType:Books&facetfilter=2,ContentProvider:Five+Colleges+Catalog',
            subjectHeadings: [
                "Action and adventure fiction",
                "Alternative histories (Fiction)",
                "Animal fiction",
                "Bildungsromans",
                "Biographical fiction",
                "Bisexual fiction",
                "Campus fiction",
                "Choose-your-own stories",
                "Christmas fiction",
                "Confessional fiction",
                "Detective and mystery fiction",
                "Diary fiction",
                "Didactic fiction",
                "Domestic fiction",
                "Easter fiction",
                "Epic fiction",
                "Epistolary fiction",
                "Erotic fiction",
                "Experimental fiction",
                "Fantasy fiction",
                "Fictional autobiographies",
                "Folk tales",
                "Frame stories",
                "Gay fiction",
                "Gothic fiction",
                "Historical fiction",
                "Horror fiction",
                "Humorous fiction",
                "Legal fiction (Literature)",
                "Lesbian fiction",
                "Light novels",
                "Magic realist fiction",
                "Martial arts fiction",
                "Mathematical fiction",
                "Medical fiction",
                "Military fiction",
                "Monster fiction",
                "Mythological fiction",
                "Nature fiction",
                "Nonfiction novels",
                "Novellas",
                "Novelle",
                "Novels",
                "Paranormal fiction",
                "Pastoral fiction",
                "Philosophical fiction",
                "Picaresque fiction",
                "Political fiction",
                "Prison fiction",
                "Proletarian fiction",
                "Psychological fiction",
                "Religious fiction",
                "Road fiction",
                "Robinsonades",
                "Romance fiction",
                "Romans à clef",
                "School fiction",
                "Science fiction",
                "Sea fiction",
                "Serialized fiction",
                "Short stories",
                "Social problem fiction",
                "Sports fiction",
                "Spy fiction",
                "Stories in rhyme",
                "Thrillers (Fiction)",
                "Transgender fiction",
                "Urban fiction",
                "Utopian fiction",
                "War fiction",
                "Western fiction"
            ], // book subject headings
        };
    }
}

export const createMaterialStore = (set, get, type) => {
    const initialState = getInitialState(type);

    // This function ensures you're updating only the specific type's state
    const updateTypeState = (partialState) => {
        console.log("Previous State:", get()[type]);
        console.log("Partial Update:", partialState);
        
        set(prevState => ({
            [type]: {
                ...prevState[type],
                ...partialState
            }
        }));
    };

    return {
        [type]: initialState, // initialize the state
        setAction: (action) => updateTypeState({ action }),
        setData: (data) => updateTypeState({ data }),
        setQueryString: (queryString) => updateTypeState({ queryString }),
        setExpanded: (expanded) => updateTypeState({ expanded }),
        setDateLimiter: (dateLimiter) => updateTypeState({ dateLimiter }),
        setLimiter: (limiter) => updateTypeState({ limiter }),
        setAppliedFacets: (appliedFacets) => updateTypeState({ appliedFacets }),
        setLocalOnly: (localOnly) => updateTypeState({ localOnly }),
        setSmith: (smith) => updateTypeState({ smith }),
        setFacets: (facets) => updateTypeState({ facets }),
        reset: () => updateTypeState({ ...initialState }),
        setFacetAction: (facetAction) => updateTypeState({ facetAction }),
        removeFacetAction: (facetAction) => {
            set((state) => ({
                [type]: {
                    ...state[type],
                    facetAction: state[type].facetAction.filter(action => action !== facetAction)
                }
            }));
        },
        setSort: (sort) => updateTypeState({ sort }),
        setSubjectHeadings: (subjectHeadings) => updateTypeState({ subjectHeadings }),
        setHits: (hits) => updateTypeState({ hits }),
        setResultsQueryString: (resultsQueryString) => updateTypeState({ resultsQueryString }),
    };
}

