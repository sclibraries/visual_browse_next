import { useQuery } from '@apollo/client';
import { GET_BROWSE } from '../lib/api';
import { buildRecommendations } from '../lib/functions';
import { RecomendationsLoading } from './Loading'
import { useRouter } from 'next/router';
import { useStore } from '../store/store';
import SafeImage from './SafeImage';
import { useRecordImage } from '../hooks/useRecordImage';

function RecommendationDisplay(props){

    const router = useRouter();
    const [setAn,setDbid] = useStore(state => [
        state.setAn,
        state.setDbid,
    ])

    let action = ''
    if(props.data.pubType === 'Video Recording'){
        action = 'addfacetfilter(SourceType:Videos,ContentProvider:Five Colleges Catalog)'
    } else {
        action = 'addfacetfilter(SourceType:Books,ContentProvider:Five Colleges Catalog)'
    }


    
    // let query = buildRecommendations(props.data) + '&facetfilter=1,SourceType:Books&facetfilter=2,ContentProvider:Five Colleges Catalog'
    // if(props.data.pubTypeItem && props.data.pubTypeItem[0] === 'Video'){
    //     query = buildRecommendations(props.data) + '&facetfilter=1,SourceType:Videos&facetfilter=2,ContentProvider:Five Colleges Catalog'
    // }

    const { loading, data } = useQuery(GET_BROWSE, {
        variables: {
            query: buildRecommendations(props.data.itemsRaw),
            refine: 'n',
            sort: 'relevance',
            fieldcode: 'DE',
            action: action
        }
    });

    const handleRecord = (an, dbid) => {
        const params = { an: an, db: dbid }
        setAn(params.an)
        setDbid(params.db)
        router.push(`/?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }

    const records = data?.search?.records;
    const hasRecords = records && records.length > 0;
    
    return(
    <div className="homeContainer" style={{ position: 'relative' }}>    
        {/* Scroll indicators - only show when there are records */}
        {hasRecords && (
            <>
                <div className="scroll-indicator left" style={{ 
                    position: 'absolute', 
                    left: '5px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '0 0.5rem 0.5rem 0',
                    fontSize: '0.7rem',
                    pointerEvents: 'none',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.3)',
                    fontWeight: '500'
                }}>
                    ← Scroll
                </div>
                <div className="scroll-indicator right" style={{ 
                    position: 'absolute', 
                    right: '5px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '0.3rem 0.5rem',
                    borderRadius: '0.5rem 0 0 0.5rem',
                    fontSize: '0.7rem',
                    pointerEvents: 'none',
                    boxShadow: '-2px 0 8px rgba(0,0,0,0.3)',
                    fontWeight: '500'
                }}>
                    Scroll →
                </div>
            </>
        )}
        {loading ? <RecomendationsLoading /> : hasRecords ? Object.keys(records).map((key,index) => {
            return(
                <RecommendationItem 
                    key={index}
                    record={records[key]}
                    handleRecord={handleRecord}
                />
            )
        }) : <div className="col">No Recommendations Found</div>}
    </div>
    )
}

// RecommendationItem component to handle individual recommendation rendering
function RecommendationItem({ record, handleRecord }) {
    const imageUrl = useRecordImage(record);

    return (
        <div className="col" style={{ marginRight: "15px", flexShrink: 0, scrollSnapAlign: "start", maxWidth: "11rem" }}>
            <div className="record-item" style={{ cursor: "pointer" }}>
                <div 
                    className="image-container"
                    onClick={() => handleRecord(record.an, record.dbid)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleRecord(record.an, record.dbid);
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer", height: "140px" }}
                >
                    {imageUrl && imageUrl !== '' ? (
                        <SafeImage
                            src={imageUrl}
                            alt={record?.titles[0]?.TitleFull}
                            fill
                            className="rounded card-img-top"
                            style={{ objectFit: 'contain' }}
                            unoptimized={true}
                        />
                    ) : (
                        <div className="default-book-cover">
                            <svg 
                              className="bd-placeholder-img card-img-top" 
                              width="100%" 
                              height="100%" 
                              xmlns="http://www.w3.org/2000/svg" 
                              role="img" 
                              aria-label={`Book cover: ${record?.titles[0]?.TitleFull}`}
                              preserveAspectRatio="xMidYMid slice" 
                              focusable="false"
                            >
                              <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                              <text x="50%" y="50%" fill="#999" textAnchor="middle" dominantBaseline="middle" fontSize="11">
                                No Image Available
                              </text>
                            </svg>
                        </div>
                    )}
                </div>
                <div className="card-info" style={{ padding: "0.5rem" }}>
                    <div className="record-title" style={{ fontSize: "0.8rem", lineHeight: "1.1", marginBottom: "0.25rem", height: "2.4rem", overflow: "hidden" }}>
                        <h5 className="product-title fs-sm mb-0 truncate" style={{ fontSize: "0.75rem", fontWeight: "500", lineHeight: "1.2" }}>
                            {record.titles[0]?.TitleFull}
                        </h5>
                    </div>
                    <button 
                        className="view-details-btn"
                        onClick={() => handleRecord(record.an, record.dbid)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleRecord(record.an, record.dbid);
                            }
                        }}
                        aria-label={`View details for ${record?.titles[0]?.TitleFull}`}
                        style={{
                            width: '100%',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                        onFocus={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onBlur={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>   
    );
}

export default RecommendationDisplay