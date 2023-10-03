import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import axios from 'axios';

function Collections(props) {

    const [collections, setCollections] = useState([])

    useEffect(() => {
        getPublicCollections()
    }, [])

    const getPublicCollections = async () => {

        axios
        .get('https://libtools2.smith.edu/visual_browse/backend/web/collection-name/get-public-collections', { withCredentials: true })
        .then((response) => {
          setCollections(response.data)
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
        // const response = await fetch('https://libtools2.smith.edu/visual_browse/backend/web/collection-name/get-public-collections')
        // const data = await response.json()
        
    }


    return (
        <div className="container">
            <CollectionsDisplay
                collections={collections}
            />
        </div>
    );
}

const CollectionsDisplay = props => {

    const results = props.collections?.items || []
    console.log(results)
    return(
        <div className="hide-scrollbar flex-1 h-100 container">
            <div className="row row-cols-* g-4" style={{marginTop: "30px"}}>
                {results.map((collection, index) => (
                    <div className="col" key={index}>
                        <div className="card" style={{width: "13em"}}>
                            <img src={collection.cover_image} className="card-img-top" alt="..." />
                            <div className="card-body">
                                <h5 className="card-title">{collection.name}</h5>
                                <p className="card-text">{collection.description}</p>
                                <Link href={`/collections/records/${collection.collection_id}`} className="btn btn-primary">View Collection</Link>
                            </div>
                            <div className="card-footer text-muted">
                                <div>Viewed <span className="badge bg-secondary">{collection.views}</span></div> 
                                <div>Last update: {collection.timestamp}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>        
        </div>
    )
}


export default Collections;