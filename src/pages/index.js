import React, { useState, Fragment } from 'react'
import { GET_ORDERS } from '../lib/api'
import { useQuery } from '@apollo/client'
import { DashboardLoading } from '../components/Loading';
import moment from 'moment';
import HomeLayout from '../layouts/HomeLayout';
import { DisplayImage } from '../components/DisplayImage';
import { useRouter } from 'next/router';
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow'
import LocationSort from '@/components/LocationSort';
import SubjectSort from '@/components/SubjectSort';

function Home() {
  const router = useRouter();
  const { material } = router.query;
  const [records, setRecord] = useState([]);
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loadMore, setLoadMore] = useState(false);
  const today = new Date();
  const oneDay = new Date(new Date().setDate(today.getDate() - 1));
  const thirtyDays = new Date(new Date().setDate(today.getDate() - 90)); 

  const [setAn,setDbid, setRecordModal,location, subject] = useStore(state => [
      state.setAn,
      state.setDbid,
      state.setRecordModal,
      state.location,
      state.subject
  ], shallow)

  const handleRecord = (an) => {
      const params = { an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${an.replace(/-/g, ".")}` , db: 'cat09206a' }
      setAn(params.an)
      setDbid(params.db)
      setRecordModal(true)
      router.push(`/?an=${params.an}&dbid=${params.db}`, undefined, { shallow: true });
  }

  const { loading, error,fetchMore, networkStatus } = useQuery(GET_ORDERS, {
      variables: {
          offset: 0,
          limit: limit,
          acquisitionsUnit: location,
          fundDistribution: subject,
          start: moment(thirtyDays).format('YYYY-MM-DD'),
          end: moment(oneDay).format('YYYY-MM-DD')
      },
      onCompleted: setRecord
  })

  const { folioorders } = records || [];
  const { poLines } = folioorders || [];
  const { totalRecords }  = folioorders || 0

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
            start: moment(thirtyDays).format('YYYY-MM-DD'),
            end: moment(oneDay).format('YYYY-MM-DD')
          },
        updateQuery: (previousResult, {fetchMoreResult}) => {
          setLoadMore(false)
          const newCollections = fetchMoreResult?.folioorders?.poLines
          return newCollections.length
            ? {
              folioorders: {
                  poLines : [...previousResult.folioorders.poLines, ...newCollections],
                  totalRecords: fetchMoreResult.folioorders.totalRecords,
                  _typename: previousResult.folioorders._typename
              },
              }
            : previousResult;
        },
      })
    }

  return(
      <HomeLayout>
      <Fragment>
              <Fragment>
                    <div className="d-flex mb-3">
                        <div className="p-2">
                            <p>Results: <strong>{totalRecords}</strong></p>
                        </div>
                        <div className="ms-auto p-2">
                            <LocationSort />
                        </div>
                        <div className="p-2">
                            <SubjectSort />
                        </div>
                    </div>
              {loading ? <DashboardLoading /> : poLines && poLines.length > 0 ? Object.keys(poLines).map((key, index) => {
                  return(
                      <div className="col" key={index} onClick={e => handleRecord(poLines[key].instanceId)}>
                          <div className="card h-100 shadow-sm p-3 mb-5 bg-body rounded" style={{width: "14em"}}>
                          <DisplayImage
                              an={poLines[key].instanceId}
                           />
                              <div className="card-body">
                                  <h5 className="product-title fs-sm mb-2">{poLines[key].titleOrPackage.split('/')[0]}</h5>
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
      </Fragment>
      </HomeLayout>
  )
}

export default Home