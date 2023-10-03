import React from 'react'
import { useQuery } from '@apollo/client'
import {GET_TMDB, GET_TMDB_EXTERNAL_ID} from '../lib/api'

function FullCast(props){
    const { data } = useQuery(props.imdb == '' ? GET_TMDB : GET_TMDB_EXTERNAL_ID, {
        variables: {
            query: props.imdb == '' ? props.title : props.imdb
        }
    })

    let results = data?.tmdbExternalId?.fullrecordcast?.cast || data?.tmdbSearch?.results[0]?.fullrecordcast?.cast || []
    return(
        <div className="castContainer">  
        {results && results.length > 0 ? Object.keys(results).map((key,index) => {
            return(
                    <div key={index} className="col" style={{maxWidth: '13em', paddingRight: "10px"}} onClick={e => props.handleActorSearch(results[key].name, results[key].profile_path ? `https://image.tmdb.org/t/p/w185${results[key].profile_path}`: `https://via.placeholder.com/185x278?text=${results[key].name}`)}>
                        <div className="card">
                            <img src={results[key].profile_path ? `https://image.tmdb.org/t/p/w185${results[key].profile_path}`: `https://via.placeholder.com/185x278?text=${results[key].name}`}
                                className="card-img-top img-thumbnail rounded"
                                alt={results[key].name} 
                            />
                            <div className="card-body">
                                <h5 className="product-title fs-sm mb-2 truncate">{results[key].name}</h5>
                                <p>{results[key].character}</p>
                            </div>
                        </div>
                     </div> 
            )
        }) : 'Could not find cast for this title'}
        </div>
    )
}

export default FullCast