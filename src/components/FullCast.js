import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_TMDB } from '../lib/api'
import { extractTitle } from '../lib/functions'
import { useStore } from '../store/store'
import { useRouter } from 'next/router'

function FullCast(props) {

    const router = useRouter();

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

    const queryTitle = props.imdb === '' ? extractTitle(props.title) : props.imdb;
    // Use the same query for both IMDb ID and title searches
    const { data } = useQuery(GET_TMDB, {
        variables: {
            query: queryTitle
        }
    });

    // Extract the cast based on the returned data structure
    let results = data?.tmdbSearch?.results?.[0]?.fullrecordcast?.cast || [];

    const handleActorSearch = (name, image) => {
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


    return (
        <div className="castContainer">
            {results.length > 0 ? results.map((actor, index) => (
                <div key={index} className="col" style={{ maxWidth: '13em', paddingRight: "10px" }} onClick={e => handleActorSearch(actor.name, actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : `https://via.placeholder.com/185x278?text=${actor.name}`)}>
                    <div className="card">
                        <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : `https://via.placeholder.com/185x278?text=${actor.name}`}
                            className="card-img-top img-thumbnail rounded"
                            alt={actor.name}
                        />
                        <div className="card-body">
                            <h5 className="product-title fs-sm mb-2 truncate">{actor.name}</h5>
                            <p>{actor.character}</p>
                        </div>
                    </div>
                </div>
            )) : 'Could not find cast for this title'}
        </div>
    )
}

export default FullCast
