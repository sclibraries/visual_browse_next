import { useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SHELF_BROWSE } from '../lib/api';
import Slider from 'react-slick';
import {DisplayImage} from './DisplayImage';
import SafeImage from './SafeImage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useStore } from '../store/store';
import { useRouter } from 'next/router';

const truncateTitle = (title, maxLength = 30) => {
    return title?.length > maxLength ? title?.substring(0, maxLength) + '...' : title;
};

// Loading skeleton component for CallNumberBrowse
function CallNumberBrowseLoading() {
    return (
        <div style={{ display: 'flex', gap: '15px', padding: '20px 0', background: '#f8f9fa', borderRadius: '8px', margin: '10px 0' }}>
            {[...Array(4)].map((_, i) => (
                <div key={i} style={{ 
                    width: '10rem',
                    flexShrink: 0,
                    background: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    margin: '0 6px'
                }}>
                    <div style={{
                        height: '120px',
                        background: '#f0f0f0',
                        position: 'relative'
                    }}>
                        <div className="placeholder-glow h-100 w-100">
                            <span className="placeholder h-100 w-100" style={{ borderRadius: '0' }}></span>
                        </div>
                    </div>
                    <div style={{ padding: '0.25rem' }}>
                        <div className="placeholder-glow">
                            <span className="placeholder col-10 mb-2"></span>
                            <span className="placeholder col-8"></span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Arrow components
function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <button
            className={`${className} btn btn-primary`}
            style={{ 
                ...style, 
                display: "block", 
                background: "gray", 
                borderRadius: "50%", 
                height: "50px", 
                width: "50px", 
                alignItems: "center", 
                justifyContent: "center", 
                zIndex: 2 
            }}
            onClick={onClick}
        >
            <i className="bi bi-chevron-right" style={{ fontSize: "20px", color: "white" }}></i>
        </button>
    );
}

function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <button
            className={`${className} btn btn-primary`}
            style={{ 
                ...style, 
                display: "block", 
                background: "gray", 
                borderRadius: "50%", 
                height: "50px", 
                width: "50px", 
                alignItems: "center", 
                justifyContent: "center", 
                zIndex: 2 
            }}
            onClick={onClick}
        >
            <i className="bi bi-chevron-left" style={{ fontSize: "20px", color: "white" }}></i>
        </button>
    );
}


const CallNumberBrowse = ({ initialQuery }) => {
    const router = useRouter();
    const [setAn, setDbid] = useStore(state => [
        state.setAn,
        state.setDbid,
    ]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadingDirection, setLoadingDirection] = useState(null);
    const [callNumbers, setCallNumbers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef();

    // Preprocessing `initialQuery` to derive `initialRequest`
    const containsFs00001006 = initialQuery.includes('fs00001006');
    const cleanId = containsFs00001006 ? initialQuery.split('fs00001006.')[1] : '';
    const initialRequest = cleanId.replace(/\./g, '-');

    // Using the skip option to conditionally execute the query
    const { loading, error, fetchMore } = useQuery(GET_SHELF_BROWSE, {
        skip: !containsFs00001006, // Skip the query if 'fs00001006' is not in the initialQuery
        variables: {
            query: initialRequest,
            type: 'initial',
            precedingRecordsCount: 10,
        },
        onCompleted: data => {
            setCallNumbers(data.foliocallnumberbrowse.items);
            // Attempting to set the slider to the initial index
            setTimeout(() => {
                const initialIndex = data.foliocallnumberbrowse.items.findIndex(item => item?.instance?.id === initialRequest);
                if (sliderRef.current) {
                    sliderRef.current.slickGoTo(initialIndex, true);
                }
            }, 100);
        }
    });

    // Effectively handle loading and error states
    if (loading) return <CallNumberBrowseLoading />;
    if (error) return <p>Error: {error.message}</p>;

    const loadMoreItems = async (direction) => {
        // Early return if no items in the array
        if (!callNumbers || callNumbers.length === 0) {
            return;
        }
        
        setIsLoadingMore(true);
        setLoadingDirection(direction);
        let query;
        
        try {
            if (direction === 'after') {
                const lastItem = callNumbers[callNumbers.length - 1];
                query = lastItem?.fullCallNumber || lastItem?.callNumber || '';
            } else {
                const firstItem = callNumbers[0];
                query = firstItem?.fullCallNumber || firstItem?.callNumber || '';
            }
            
            // If we don't have a valid query, just return without making the request
            if (!query) {
                setIsLoadingMore(false);
                setLoadingDirection(null);
                return;
            }
        
            const newItems = await fetchMore({
                variables: { query, type: direction },
            });
        
            const numberOfNewItems = newItems.data.foliocallnumberbrowse.items.length;
        
            setCallNumbers((currentItems) => {
                let updatedItems;
                if (direction === 'after') {
                    updatedItems = [...currentItems, ...newItems.data.foliocallnumberbrowse.items];
                } else {
                    updatedItems = [...newItems.data.foliocallnumberbrowse.items, ...currentItems];
                    // Adjust currentIndex for the 'before' direction
                    if (sliderRef.current) {
                        sliderRef.current.slickGoTo(currentIndex + numberOfNewItems);
                    }
                }
                return updatedItems;
            });
        } catch (error) {
            console.warn('Error loading more items:', error);
        } finally {
            setIsLoadingMore(false);
            setLoadingDirection(null);
        }
    };

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 4,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1024, // Tablets
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768, // Small tablets and large phones
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480, // Small phones
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
        afterChange: (current) => {
            setCurrentIndex(current);
            
            // Safety check to ensure we have items before checking end conditions
            if (!callNumbers || callNumbers.length === 0) {
                return;
            }
            
            const isAtEnd = current + settings.slidesToShow >= callNumbers.length;
            const isAtStart = current === 0;
            if (isAtEnd) {
                loadMoreItems('after');
            } else if (isAtStart) {
                loadMoreItems('before');
            }
        },
    };

    const handleRecord = (id) => {
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${id.replace(/-/g, ".")}` , db: 'cat09206a' }
        setAn(params.an)
        setDbid(params.db)
        router.push(`/?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }

    return (
        <div style={{ 
            padding: '20px 0',
            background: '#f8f9fa',
            borderRadius: '8px',
            margin: '10px 0'
        }}>
            <Slider ref={sliderRef} {...settings}>
            {isLoadingMore && loadingDirection === 'before' && <FontAwesomeIcon size="3x"  icon={faSpinner} spin />}
                {callNumbers.map((item, index) => (
                    <div key={index} className="col" style={{ padding: '0 6px' }}>
                        <div 
                            className="record-item" 
                            style={{  
                                cursor: 'pointer',
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                width: '10rem',
                                margin: '0 auto'
                            }} 
                            onClick={() => handleRecord(item?.instance?.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleRecord(item?.instance?.id);
                                }
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`View details for ${truncateTitle(item?.instance?.title)}`}
                        >
                            <div 
                                className="image-container" 
                                style={{ 
                                    height: '120px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {item?.instance?.googleImages?.thumbnail_url ? (
                                    <SafeImage
                                        src={item?.instance?.googleImages?.thumbnail_url}
                                        alt={item?.instance?.title}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div style={{ height: '100%', position: 'relative' }}>
                                        <DisplayImage
                                            an={item?.instance?.id}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="card-info" style={{ padding: '0.25rem' }}>
                                <div className="record-title" style={{ 
                                    fontSize: '0.75rem', 
                                    lineHeight: '1.1', 
                                    fontWeight: '500',
                                    color: '#333',
                                    height: '2.2rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    marginBottom: '0.1rem'
                                }}>
                                    {truncateTitle(item?.instance?.title, 45)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoadingMore && loadingDirection === 'after' && <FontAwesomeIcon icon={faSpinner} size="3x" spin />}
            </Slider>
        </div>
    );
};

export default CallNumberBrowse;
