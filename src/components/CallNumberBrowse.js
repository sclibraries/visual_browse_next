import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SHELF_BROWSE } from '@/lib/api';
import Slider from 'react-slick';
import {DisplayImage} from '@/components/DisplayImage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useStore } from '@/store/store';
import { useRouter } from 'next/router';

const truncateTitle = (title, maxLength = 30) => {
    return title?.length > maxLength ? title?.substring(0, maxLength) + '...' : title;
};

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
    const [setAn,setDbid] = useStore(state => [
        state.setAn,
        state.setDbid,
    ])
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadingDirection, setLoadingDirection] = useState(null); // New state for loading direction
    const [callNumbers, setCallNumbers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const sliderRef = useRef();
    const cleanId = initialQuery.split('fs00001006.')[1];
    const initialRequest = cleanId.replace(/\./g,'-');

    const { loading, error, fetchMore } = useQuery(GET_SHELF_BROWSE, {
        variables: { query: initialRequest, type: 'initial', precedingRecordsCount: 10 },
        onCompleted: (data) => {
            setCallNumbers(data.foliocallnumberbrowse.items);
            setTimeout(() => {
                const initialIndex = data.foliocallnumberbrowse.items.findIndex(item => item?.instance?.id === initialRequest);
                if (sliderRef.current) {
                    sliderRef.current.slickGoTo(initialIndex);
                }
            }, 100);
        }
    });

    const loadMoreItems = async (direction) => {
        setIsLoadingMore(true);
        setLoadingDirection(direction);
        let query;
        if (direction === 'after') {
            const lastItem = callNumbers[callNumbers.length - 1];
            query = lastItem.fullCallNumber; // Adjust this to the correct property
        } else {
            const firstItem = callNumbers[0];
            query = firstItem.fullCallNumber; // Adjust this to the correct property
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

            setIsLoadingMore(false);
            return updatedItems;
        });
        setIsLoadingMore(false);
    };
    
    

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
        afterChange: (current) => {
            setCurrentIndex(current);
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <Slider ref={sliderRef} {...settings}>
            {isLoadingMore && loadingDirection === 'before' && <FontAwesomeIcon size="3x"  icon={faSpinner} spin />}
                {callNumbers.map((item, index) => (
                    <div key={index} className="col">
                    <div className="card" style={{ width: '12rem', margin: '10px' }} onClick={() => handleRecord(item?.instance?.id)}>
                        {item?.instance?.googleImages?.thumbnail_url ? (
                            <img
                                src={item?.instance?.googleImages?.thumbnail_url}
                                className="card-img-top"
                                alt={item?.instance?.title}
                            />
                        ) : (
                            <DisplayImage
                                an={item?.instance?.id}
                            />
                        )}
                        <div className="card-body">
                        <h5 className="card-title">{truncateTitle(item?.instance?.title)}</h5> {/* Truncated title */}
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
