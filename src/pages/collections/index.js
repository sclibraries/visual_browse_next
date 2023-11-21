import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image'
import { useFetchPublicCollectionName} from '../../hooks/useFetchPublicCollectionName';

const LIMIT = 25;

function Collections(props) {

    const {
        loading,
        error,
        hasMore,
        loadMore,
        collections
    } = useFetchPublicCollectionName(LIMIT);

    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const handleClickLoadMore = () => {
        setIsFetchingMore(true); // Indicate that the next batch of records is loading
        loadMore();
    }

    useEffect(() => {
        if (!loading) {
        setIsFetchingMore(false); // Set this after new data is fetched
        }
    }, [loading]);


    return (
        <div className="hide-scrollbar flex-1 h-100 container">
            <h1 className="display-4">Collections</h1>
        <div className="row row-cols-* g-4" style={{marginTop: "30px"}}>
            {collections.map((collection, index) => (
                <div className="col" key={index}>
                    <div className="card" style={{width: "18em"}}>                                 
                        {!collection.cover_image ? 
                            <svg 
                              className="bd-placeholder-img card-img-top" 
                              width="100%" 
                              height="248" 
                              xmlns="http://www.w3.org/2000/svg" 
                              role="img" 
                              preserveAspectRatio="xMidYMid slice" 
                              focusable="false"
                            >
                              <title>{collection.name}</title>
                              <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                            </svg>
                            :
                        <Image
                            src={collection.cover_image}
                            alt={collection.name}
                            width={500}
                            height={300}
                            className="card-img-top"
                            style={{objectFit: "cover"}}
                            priority={true}
                        />
                        }
                        <div className="card-body">
                            <h5 className="card-title">{collection.name}</h5>
                            <p className="card-text">{collection.description}</p>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">
                                    <Link href={`/collections/records/${collection.collection_id}?name=${collection.name}&author_id=${collection.user_id}`} className="card-link">View Collection</Link>
                                </li>
                                <li className="list-group-item">
                                    <Link href={`/collections/author/${collection.user_id}`} className="card-link">View more by this author</Link>
                                </li>
                            </ul>
                        </div>
                        <div className="card-footer">
                            <div>Viewed <span className="badge bg-danger">{collection.views}</span></div> 
                            <div>Last update: {collection.timestamp}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>  
        <div>
                {!isFetchingMore && hasMore && (
                    <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}>
                    <button
                          className={"btn btn-primary"}
                          onClick={handleClickLoadMore} disabled={loading}>
                        Load More
                    </button>
                    </div>
                )}
                {isFetchingMore && <p>Loading more...</p>}
            </div>      
    </div>
    );
}



export default Collections;