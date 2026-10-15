import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client';
import { GET_RECORD } from '../../lib/api';
import { useStore } from '../../store/store';
import { useShallow } from 'zustand/react/shallow'
import Image from 'next/image'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRecordImage } from '../../hooks/useRecordImage';
import ImageUploadModal from '../../components/ImageUploadModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faUpload } from '@fortawesome/free-solid-svg-icons';

function RecordDisplay({ an, dbid, folio_id, router, id, handleDeleteRecord, collection_id, isDraggable = false }){
    const [setAn, setDbid, setRecordModal, collectionCoverImage, baseUrl, updateCollection, setCollectionCoverImage] = useStore(useShallow(state => [
        state.setAn,
        state.setDbid,
        state.setRecordModal,
        state.collectionCoverImage,
        state.baseUrl,
        state.updateCollection,
        state.setCollectionCoverImage
    ]))

  const { loading, error, data } = useQuery(GET_RECORD, {
    variables: {
      an: an,
      dbid: dbid
    },
  });

  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Initialize `record` before any Hooks
  const record = data?.record?.records || {};

  // Call `useRecordImage` before any returns
  const image = useRecordImage(record);

  // Handle image loading errors
  useEffect(() => {
    setImageError(false); // Reset error state when record changes
  }, [record]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSave = async (updatedFields) => {
    try {
      const response = await axios.put(
        `${baseUrl}/collection_name/update/${collection_id}`,
        {cover_image: updatedFields},
        { withCredentials: true }
      );

      if (response.status === 200) {
        updateCollection(collection_id, response.data.updatedCollection);
        setCollectionCoverImage(updatedFields)
        toast.success('Collection updated successfully', {
          autoClose: 2000,
          position: "top-right"
        });
      } else {
        toast.error('An error occurred while updating the collection', {
          autoClose: 2000,
          position: "top-right"
        });
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

 const toggleImageUploadModal = (record) => {
  setSelectedRecord(record);
  setImageUploadModalOpen(!imageUploadModalOpen);
};


  if (loading) return (
    <div className="col">
        <div className="card" style={{width: isDraggable ? "100%" : "14em"}}>
        <svg className="bd-placeholder-img card-img-top" width="100%" height="180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#868e96"></rect></svg>
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
  const titleFull = record.titles?.[0]?.TitleFull || 'No Title';

  return (
    <div className={isDraggable ? "" : "col"}>
          {imageUploadModalOpen && (
            <ImageUploadModal
              isOpen={imageUploadModalOpen}
              toggle={toggleImageUploadModal}
              record={selectedRecord}
            />
          )}
        <div className="card" style={{width: isDraggable ? "100%" : "13em"}}>
          <div className="image-container" aria-hidden="true">
            {/* Replace div with button for proper accessibility */}
            <button 
              onClick={() => handleRecord(an, dbid)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRecord(an, dbid);
                }
              }}
              style={{
                width: '100%',
                padding: 0,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'block'
              }}
            >
              {image !== '' && !imageError ? (
                  <Image
                    src={image}
                    alt={titleFull}
                    layout="responsive"
                    width={500}
                    height={300}
                    className="rounded card-img-top"
                    objectFit="cover"
                    unoptimized={true}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: "180px" }}>
                    <FontAwesomeIcon icon={faBook} size="3x" style={{ color: "#adb5bd" }} />
                  </div>
                )}
            </button>
            <button 
              className="upload-button"
              onClick={() => toggleImageUploadModal({
                an: an,
                dbid: dbid,
              })}
              style={{
                width: '100%',
                padding: '8px',
                background: 'rgba(240,240,240,0.9)',
                border: 'none',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                color: '#555'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220,220,220,0.9)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(240,240,240,0.9)'}
              onFocus={(e) => e.currentTarget.style.background = 'rgba(220,220,220,0.9)'}
              onBlur={(e) => e.currentTarget.style.background = 'rgba(240,240,240,0.9)'}
            >
              <FontAwesomeIcon icon={faUpload} /> Upload Image
            </button>
          </div>
          <div className="card-body">
              <h5 className="card-title">
                  {titleFull}
              </h5>
          </div>
          <div className="card-footer" style={{ padding: '10px', background: 'transparent', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {collection_id && (
                      image === collectionCoverImage ? 
                      <span className="text-success" style={{ fontSize: '0.85rem', alignSelf: 'center' }}>Cover image</span> :
                      <button 
                        style={{
                          padding: '5px 10px',
                          background: '#f8f9fa', 
                          color: '#212529',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s'
                        }} 
                        onClick={() => handleSave(image)}
                      >
                        Set as cover
                      </button>
                  )}
                  <button 
                    style={{
                      padding: '5px 10px',
                      background: '#f8f9fa',
                      color: '#dc3545',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      marginLeft: 'auto'
                    }} 
                    onClick={() => handleDeleteRecord(an, folio_id, id)}
                  >
                    Remove
                  </button>
              </div>
          </div>
        </div>    
    </div>
  );
}

export default RecordDisplay;