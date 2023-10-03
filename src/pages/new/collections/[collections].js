import React, { useState, Fragment} from 'react'
import { FOLIO_SEARCH } from '../../../lib/api'
import { useQuery } from '@apollo/client';
import HomeLayout from '../../../layouts/HomeLayout';
import { DisplayImage } from '../../../components/DisplayImage';
import { useRouter } from 'next/router';
import { DisplayLoadingSkeleton } from '../../../components/Loading';

function FolioLocationsMaterial(){
    const router = useRouter();
    const { collections } = router.query;
    const [offset, setOffset] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [loadMore, setLoadMore] = useState(false);
    const [records, setRecord] = useState([]);

    console.log(collections)

    const endPointMapping = {
        'fiction-nonfiction' : "%28items.effectiveLocationId%3D%3D%2294842c61-93dc-44e4-b167-a29192c14b30%22%29%20sortby%20title"
    }
    

    const { loading, error,fetchMore, networkStatus } = useQuery(FOLIO_SEARCH, {
        variables: {
            offset: 0,
            limit: limit,
            query: endPointMapping[collections]
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

    const handleFetchMore = () => {
        return fetchMore({
          variables: {
              offset: offset + limit,
              limit: limit,
              query: endPointMapping[props.material],
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
        <HomeLayout>
            {instances && instances.length > 0 ?
                <Fragment>
                    <p>Results: <strong>{totalRecords}</strong></p>
                {loading ? <DisplayLoadingSkeleton /> : Object.keys(instances).map((key, index) => {
                    return(
                        <div className="col" key={index} onClick={e => handleRecord(instances[key].id)}>
                            <div className="card h-100 shadow-sm p-3 mb-5 bg-body rounded" style={{width: "14em"}}>
                            <DisplayImage
                                an={instances[key].id}
                             />
                                <div className="card-body">
                                    <h5 className="product-title fs-sm mb-2">{instances[key].title}</h5>
                                </div>
                            </div>
                        </div>
                    )
                })}
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
            : ''}
        </HomeLayout>
    )
}


export default FolioLocationsMaterial