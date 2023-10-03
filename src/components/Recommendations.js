import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_BROWSE } from '../lib/api';
import { buildRecommendations } from '../lib/functions';
import { RecomendationsLoading } from './Loading'
import { useRouter } from 'next/router';
import { useStore } from '../store/store';

function RecommendationDisplay(props){

    const router = useRouter();
    const [setAn,setDbid] = useStore(state => [
        state.setAn,
        state.setDbid,
    ])
    
    let query = buildRecommendations(props.data) + '&facetfilter=1,SourceType:Books&facetfilter=2,ContentProvider:Five Colleges Catalog'
    if(props.data.pubTypeItem && props.data.pubTypeItem[0] === 'Video'){
        query = buildRecommendations(props.data) + '&facetfilter=1,SourceType:Videos&facetfilter=2,ContentProvider:Five Colleges Catalog'
    }

    const { loading, error, data } = useQuery(GET_BROWSE, {
        variables: {
            query: query,
            refine: 'y',
            sort: 'relevance'
        }
    });

    const handleRecord = (an, dbid) => {
        const params = { an: an, db: dbid }
        setAn(params.an)
        setDbid(params.db)
        router.push(`/?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }

    const records = data?.search?.records;
    return(
    <div className="homeContainer">    
    {loading ? <RecomendationsLoading /> : records && records.length > 0 ? Object.keys(records).map((key,index) => {
        let image = ''
        if(records[key].imageItem){
            image = records[key].imageItem
        } else if( records[key].tmdbSearch && records[key].tmdbSearch.results && records[key].tmdbSearch.results.poster_path && records[key].tmdbSearch.results.poster_path.length > 0 ){
            image = `https://image.tmdb.org/t/p/w500${records[key].tmdbSearch.results.poster_path}`
        } else if (records[key].googleImages && records[key].googleImages.thumbnail_url && records[key].googleImages.thumbnail_url.length > 0){
            image = records[key].googleImages.thumbnail_url
        }


        return(
            <div key={index} className="col">
                <div className="card" style={{width: "14em", marginRight: "10px"}} onClick={e => handleRecord(records[key].an, records[key].dbid)}>
                    
                {image == '' ? 
                                <svg 
                                  className="bd-placeholder-img card-img-top" 
                                  width="100%" 
                                  height="248" 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  role="img" 
                                  preserveAspectRatio="xMidYMid slice" 
                                  focusable="false"
                                >
                                  <title>{records[key]?.titles[0]?.TitleFull}</title>
                                  <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                                </svg>
                                :
                            <img src={image}
                                className="card-img-top img-thumbnail rounded"
                                alt={records[key]?.titles[0]?.TitleFull} 
                            />
                    }
                    <div className="card-body">
                        <h5 className="product-title fs-sm mb-2 truncate">{records[key].titles[0]?.TitleFull}</h5>
                    </div>
                </div>
             </div>   
        )
    }) : <div className="col">No Recommendations Found</div>}
    </div>
    )
}

export default RecommendationDisplay