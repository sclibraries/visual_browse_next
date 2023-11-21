import React, { useState, useEffect, Fragment } from 'react'
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image'
import { useFetchPublicCollectionName} from '../../hooks/useFetchPublicCollectionName';
import HomeLayout from '../../layouts/HomeLayout';

const LIMIT = 25;

function NewPublicCollections(props) {

    const {
        loading,
        error,
        hasMore,
        loadMore,
        collections
    } = useFetchPublicCollectionName(LIMIT, '', 'new'); //Limit value, no id, and type new

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
        <HomeLayout>

        <div className="hide-scrollbar flex-1 h-100 container">
            <strong>
                <i>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>{' '}
                Public collections created in the last 30 days
                </i>
            </strong>
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
    </HomeLayout>
    );
}



export default NewPublicCollections;