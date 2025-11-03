import { useStore } from '../store/store'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { GET_TMDB_CAST } from '../lib/api'
import { useState, useEffect } from 'react'

function FullCast(props) {
    const router = useRouter();
    const [castData, setCastData] = useState([]);
    const defaultActorImg = `${router.basePath || ''}/image/default_actor.svg`;

    const [
        setMovieRefine,
        setQuery, 
        setFieldCode,
        setShouldRefetch,
        setSearchValue
    ] = useStore(state => [
        state.setMovieRefine,
        state.setQuery,
        state.setFieldCode,
        state.setShouldRefetch,
        state.setSearchValue
    ])

    // Determine the query value - use IMDb ID if available, otherwise use title
    const queryValue = props.imdb || props.title;
    // Handle year - convert array to string if needed
    const yearValue = Array.isArray(props.year) ? props.year[0] : props.year || null;

    // Use the new TMDB cast query
    const { data, loading, error } = useQuery(GET_TMDB_CAST, {
        variables: {
            query: queryValue,
            year: yearValue
        },
        skip: !queryValue // Skip the query if no title or IMDb ID is provided
    });

    useEffect(() => {
        if (data?.tmdbSearch?.results?.[0]?.fullrecordcast?.cast) {
            setCastData(data.tmdbSearch.results[0].fullrecordcast.cast);
        }
    }, [data]);

    const handleImgError = (e) => {
        // Prevent infinite error loops
        e.currentTarget.onerror = null;
        e.currentTarget.src = defaultActorImg;
    }

    const handleActorSearch = (name) => {
        const parts = name.split(' ');
        const lastName = parts.pop(); // Assuming the last part is the last name
        const firstName = parts.join(' '); // The rest is considered the first name
    
        // Rearrange to "Last Name, First Name"
        const rearrangedName = `${lastName}, ${firstName}`;
    
        // URL encode the name
        const encodedName = encodeURIComponent(`"${rearrangedName}"`);
        setSearchValue(rearrangedName);
        setMovieRefine('n');
        setFieldCode('AR');
        setQuery(encodedName);
        router.push(`/movies?search=${encodedName}&fieldcode=AR`, undefined, { shallow: true });
        setShouldRefetch(true);
    }

    if (loading) {
        return <div className="castContainer">Loading cast information...</div>;
    }

    if (error) {
        console.error('Error fetching cast data:', error);
        return <div className="castContainer">Error loading cast information</div>;
    }

    return (
        <div className="castContainer">
            {castData.length > 0 ? castData.map((actor, index) => (
                <button 
                    key={actor.id || index} 
                    className="col btn p-0 text-start" 
                    style={{ maxWidth: '13em', paddingRight: "10px" }} 
                    onClick={() => handleActorSearch(actor.name)}
                >
                    <div className="card">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : defaultActorImg}
                            className="card-img-top img-thumbnail rounded"
                            alt={actor.name}
                            onError={handleImgError}
                        />
                        <div className="card-body">
                            <h5 className="product-title fs-sm mb-2 truncate">{actor.name}</h5>
                            <p>{actor.character}</p>
                        </div>
                    </div>
                </button>
            )) : 'Could not find cast for this title'}
        </div>
    )
}

export default FullCast
