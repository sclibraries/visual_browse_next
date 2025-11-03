import { useState, useEffect} from 'react'
import Link from 'next/link';
import { useFetchPublicCollectionName} from '../../hooks/useFetchPublicCollectionName';
import HomeLayout from '../../layouts/HomeLayout';
import SafeImage from '../../components/SafeImage';


const LIMIT = 25;

function NewPublicCollections() {

    const {
        loading,
        hasMore,
        loadMore,
        collections
    } = useFetchPublicCollectionName(LIMIT, '', 'new'); //Limit value, no id, and type new

    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (collectionId) => {
        setImageErrors(prev => ({
            ...prev,
            [collectionId]: true
        }));
    };

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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>{' '}
                Public collections created in the last 30 days
                </i>
            </strong>
            <div className="collections-grid">
            {loading ? (
                [...Array(12)].map((_, i) => (
                    <div key={i} className="collection-item loading-skeleton">
                        <div className="image-container-collection">
                            <div className="placeholder-image"></div>
                        </div>
                        <div className="collection-title">
                            <div className="placeholder-glow">
                                <span className="placeholder col-8"></span>
                                <span className="placeholder col-6"></span>
                            </div>
                            <div className="collection-links">
                                <div className="placeholder-glow">
                                    <span className="placeholder col-6"></span>
                                    <span className="placeholder col-8"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : collections.map((collection, index) => {
                const hasImageError = imageErrors[collection.collection_id];
                return (
                <div key={index} className="collection-item">
                    <div className="image-container-collection">
                        {!collection.cover_image || hasImageError ? (
                            <div className="collection-image-fallback">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-book" viewBox="0 0 16 16">
                                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                                </svg>
                                <span className="fallback-text">Collection</span>
                            </div>
                        ) : (
                            <>
                                <SafeImage 
                                    src={collection.cover_image} 
                                    alt={collection.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    onError={() => handleImageError(collection.collection_id)}
                                />
                                <div className="collection-description">{collection.description}</div>
                            </>
                        )}
                    </div>
                    <div className="collection-title">{collection.name}
                    <div className="collection-links">
                        <Link href={`/collections/records/${collection.collection_id}?name=${collection.name}&author_id=${collection.user_id}`} className="card-link">View Collection</Link>
                        <Link href={`/collections/author/${collection.user_id}`} className="card-link">View more by this author</Link>
                    </div>
                    </div>
                </div>
            )})}
        </div>
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
    </HomeLayout>
    );
}



export default NewPublicCollections;