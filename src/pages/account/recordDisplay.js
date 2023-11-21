import React, { useState } from 'react'
import { useQuery } from '@apollo/client';
import { GET_RECORD } from '../../lib/api';
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow'
import Image from 'next/image'
import axios from 'axios';
import { toast } from 'react-toastify';

function RecordDisplay({ an, dbid, folio_id, router,id, handleDeleteRecord, collection_id }){
    const [setAn, setDbid, setRecordModal, collectionCoverImage, baseUrl, updateCollection, setCollectionCoverImage] = useStore(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.collectionCoverImage,
        state.baseUrl,
        state.updateCollection,
        state.setCollectionCoverImage
    ], shallow)

  const { loading, error, data } = useQuery(GET_RECORD, {
    variables: {
      an: an,
      dbid: dbid
    },
  });


  const handleSave = async (updatedFields) => {
    try {
      const response = await axios.put(
        `${baseUrl}/collection_name/update/${collection_id}`,
        {cover_image: updatedFields},
        { withCredentials: true }
      );

      if (response.status === 200) {
        updateCollection(collection_id, response.data.updatedCollection);
        setCollectionCoverImage(response.data.updatedCollection.cover_image)
        toast.success('Collection updated successfully', {
          autoClose: 2000,
          position: "top-right"
        });
      } else {
        handleError(response.data.message);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('An error occurred while updating the collection', {
        autoClose: 2000,
        position: "top-right"
      });
    }
  };

  const handleRecord = (an, dbid) => {
    setAn(an)
    setDbid(dbid)
    setRecordModal(true)
    router.push(`${router.pathname}?an=${an}&dbid=${dbid}`, undefined, { shallow: true });
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
        <div className="card" style={{width: "16em"}}>
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
            <div className="card-footer">
                <div className="d-grid gap-2 d-md-block">
                    {collection_id && (
                        image === collectionCoverImage ?  <p className="text-success">This is your collection cover image</p> :
                        <button style={{marginRight: "10px"}} className="btn btn-primary" onClick={() => handleSave(image)}>Cover image</button>
                    )}
                    <button className="btn btn-danger" onClick={() => handleDeleteRecord(an, folio_id, id)}>Remove</button>
                </div>
            </div>
        </div>    
    </div>
  );
}

export default RecordDisplay