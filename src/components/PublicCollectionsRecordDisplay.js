import React from 'react'
import { useQuery } from '@apollo/client';
import { GET_RECORD } from '../lib/api'
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow'
import Image from 'next/image'

function PublicCollectionsRecordDisplay({ an, dbid, folio_id, router,id, collection_id }){
    const [setAn, setDbid, setRecordModal] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal
    ], shallow)

  const { loading, error, data } = useQuery(GET_RECORD, {
    variables: {
      an: an,
      dbid: dbid
    },
  });

  const handleRecord = (an, dbid) => {
    setAn(an)
    setDbid(dbid)
    setRecordModal(true)
    router.push(`/collections/records/${collection_id}?an=${an}&dbid=${dbid}`, undefined, { shallow: true });
 }

  if (loading) return (
    <div className="col">
        <div className="card" style={{width: "14em"}}>
        <svg className="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#868e96"></rect></svg>                  {/* <img src='https://via.placeholder.com/240x348' className="card-img-top img-thumbnail rounded" alt="Loading..." /> */}
        <div className="card-body">
            <h5 className="card-title placeholder-glow">
                <span className="placeholder col-6"></span>
            </h5>
            <p className="card-text placeholder-glow">
                <span className="placeholder col-7"></span>
                <span className="placeholder col-4"></span>
                <span className="placeholder col-4"></span>
                <span className="placeholder col-6"></span>
                <span className="placeholder col-8"></span>
            </p>
        </div>
    </div>
  </div>
  )
  if (error) return <p>Error loading record</p>;
  const results = data?.record?.records || []
  let image =  results.imageItem || ''
  return (
    <div className="col">
        <div className="card" style={{width: "14em"}}>
            <span onClick={() => handleRecord(an, dbid)}>
                {image !== '' ? (
                    <Image
                       src={image}
                       alt={results.titles.map(items => items.TitleFull)}
                       width={500}
                       height={300}
                       className="card-img-top"
                       style={{objectFit: "cover"}}
                       priority={true}
                    />
                ) : (
                    <svg className="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Image cap" preserveAspectRatio="xMidYMid slice" focusable="false">
                        <title>{results.titles.map(items => items.TitleFull)}</title>
                        <rect width="100%" height="100%" fill="#868e96"></rect>
                    </svg>
                )}
            </span>
            <div className="card-body">
                <h5 className="card-title">
                    {results.titles.map(items => items.TitleFull)}
                </h5>
            </div>
        </div>    
    </div>
  );
}

export default PublicCollectionsRecordDisplay