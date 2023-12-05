import React, { useState, Fragment} from 'react'
import { FOLIO_SEARCH } from '../../../lib/api'
import { useQuery } from '@apollo/client';
import LocalCollectionLayout from '../../../layouts/LocalCollectionLayout';
import { DisplayImage } from '../../../components/DisplayImage';
import { useRouter } from 'next/router';
import { DashboardLoading } from '../../../components/Loading';
import { useStore } from '../../../store/store';
import Image from 'next/image'
import { localCollections } from '../../../lib/endpoints';


function FolioLocationsMaterial(){
    const router = useRouter();
    const { collections } = router.query;
    const [offset, setOffset] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [loadMore, setLoadMore] = useState(false);
    const [records, setRecord] = useState([]);
    const [setAn,setDbid, setRecordModal, setIsStreaming, setIsStreamingImageUrl] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.setIsStreaming,
        state.setIsStreamingImageUrl
    ])



    // const endPointMapping = {
    //     'fiction-nonfiction' : "%28items.effectiveLocationId%3D%3D%2294842c61-93dc-44e4-b167-a29192c14b30%22%29%20sortby%20title",
    //     'swank' : '%28holdings.electronicAccess.uri%3D%22%2Adigitalcampus.swankmp.net%2Fsmith353094%2A%22%29%20sortby%20title'
    // }
    
    const endpoint = collections ? localCollections[collections]['endpoint'] : ''
    const collectionTitle = collections ? localCollections[collections]['title'] : ''

    const { loading, error,fetchMore, networkStatus } = useQuery(FOLIO_SEARCH, {
        variables: {
            offset: 0,
            limit: limit,
            query: endpoint
        },
        onCompleted: setRecord
    })

    const { foliosearch } = records || [];
    const { instances } = foliosearch || [];
    const { totalRecords }  = foliosearch || 0

    const handleLazyLoad = () => {
        setPage(page + 1)
        setOffset(offset + limit)
        setLoadMore(true)
        handleFetchMore()
    }

    const handleRecord = (an, imageUrl) => {
        if(collections === 'swank'){
            setIsStreaming(true)
            setIsStreamingImageUrl(imageUrl)
        }
        const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${an.replace(/-/g, ".")}` , db: 'cat09206a' }
        setAn(params.an)
        setDbid(params.db)
        setRecordModal(true)
        router.push(`/local-collections/collections/${collections}?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
    }


    const handleFetchMore = () => {
        return fetchMore({
          variables: {
              offset: offset + limit,
              limit: limit,
              query: endpoint,
            },
          updateQuery: (previousResult, {fetchMoreResult}) => {
            setLoadMore(false)
            const newCollections = fetchMoreResult?.foliosearch?.instances
            return newCollections.length
              ? {
                foliosearch: {
                    instances : [...previousResult.foliosearch.instances, ...newCollections],
                    totalRecords: fetchMoreResult.foliosearch.totalRecords,
                    _typename: previousResult.foliosearch._typename
                },
                }
              : previousResult;
          },
        })
      }



    return(
        <LocalCollectionLayout>
                <Fragment>
                    <h1 className="h3 mb-3 fw-normal">{collectionTitle}</h1>
                    <p>Results: <strong>{totalRecords}</strong></p>
                {loading ? <DashboardLoading /> : instances && instances.length > 0 ? Object.keys(instances).map((key, index) => {
                    return(
                        <div className="col" key={index} onClick={e => handleRecord(instances[key].id, instances[key].uriImage && instances[key].uriImage !== '' ? instances[key].uriImage : '')}>
                            <div className="card h-100 shadow-sm p-3 mb-5 bg-body rounded" style={{width: "14em"}}>
                            {instances[key].uriImage && instances[key].uriImage !== '' ?
                                <Image
                                    src={instances[key].uriImage}
                                    alt={instances[key].title}
                                    width={500}
                                    height={300}
                                    className="card-img-top"
                                    style={{objectFit: "cover"}}
                                    priority={true}
                                />    
                            : 
                            <DisplayImage
                                an={instances[key].id}
                             />
                            }
                                <div className="card-body">
                                    <h5 className="product-title fs-sm mb-2">{instances[key].title}</h5>
                                </div>
                            </div>
                        </div>
                    )
                }): ''}
                {page <= Math.ceil(totalRecords/limit) ?
                <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}>
                    <button
                        className={loadMore ? "btn btn-info disabled" : "btn btn-primary"}
                        id="buttonLoadMore"
                        onClick={() =>
                            handleLazyLoad()
                          }
                    >
                    {loadMore ? "Loading..." : "Load more"}
                    </button>
                </div>
                : <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}><button className="btn btn-primary" disabled>End of results</button></div>}
                </Fragment> 
        </LocalCollectionLayout>
    )
}


export default FolioLocationsMaterial