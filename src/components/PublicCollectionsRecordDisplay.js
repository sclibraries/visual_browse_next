import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECORD } from '../lib/api';
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DisplayImage } from './DisplayImage';
import PlaceholderCover from './PlaceholderCover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPlusSquare, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import CollectionsModal from './CollectionsModal';
import { getMaterialType } from '../utils/materialTypeUtils';
import { useRecordImage } from '../hooks/useRecordImage';
import ImageUploadModal from './ImageUploadModal';
import LinesEllipsis from 'react-lines-ellipsis';
import { useTracking } from '../hooks/useTracking';

function PublicCollectionsRecordDisplay(props) {
  const router = useRouter();
  const [favorites, setFavorites] = useState({});
  const [collectionModal, setCollectionModal] = useState(false);
  const { an, dbid, collection_id, recordKey } = props;
  const { trackRecordView, trackMediaInteraction } = useTracking();
  const [
    setAn,
    setDbid,
    setRecordModal,
    loggedIn,
    baseUrl,
    setCollectionAn,
    setCollectionDbid,
  ] = useStore(
    (state) => [
      state.setAn,
      state.setDbid,
      state.setRecordModal,
      state.loggedIn,
      state.baseUrl,
      state.setCollectionAn,
      state.setCollectionDbid,
    ],
    shallow
  );
    // Add state variables for the image upload modal
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { loading, data } = useQuery(GET_RECORD, {
    variables: {
      an: an,
      dbid: dbid,
    },
  });

  // Initialize `record` before any Hooks
  const record = data?.record?.records || {};

  // Call `useRecordImage` before any returns
  const image = useRecordImage(record);

  // Move `useEffect` before any returns
  useEffect(() => {
    const fetchFavorites = async () => {
      const baseUrl = useStore.getState().baseUrl;
      const newFavorites = {};

      try {
        const response = await axios.get(`${baseUrl}/records/read/${an}`, {
          withCredentials: true,
        });
        newFavorites[an] = response.data && response.data.record_id ? true : false;
      } catch (error) {
        console.error('Error checking favorite:', error);
      }

      setFavorites(newFavorites);
    };

    if (loggedIn) {
      fetchFavorites();
    }
  }, [an, loggedIn]);

  // Now handle conditional returns
  if (loading) {
    return (
      <div className="record-item">
        <div className="image-container">
          <DisplayImage an="" />
        </div>
        <div className="card-info">
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
    );
  }

  if (!record || Object.keys(record).length === 0) {
    return null; // Or a placeholder component
  }

  const toggleImageUploadModal = (record) => {
    setSelectedRecord(record);
    setImageUploadModalOpen(!imageUploadModalOpen);
  };


  const toggleCollectionModal = (an, dbid) => {
    if (an && an !== '') {
      setCollectionAn(an);
      setCollectionDbid(dbid);
    }
    setCollectionModal(!collectionModal);
  };


  const toggleFavorite = async (an, db_id) => {
    const eds_id = an
    const dbid = db_id
    let folio_id;
    if (eds_id.includes("fs00001006.")) {
      folio_id = eds_id.split("fs00001006.")[1];
    } else {
        folio_id = eds_id;
    }
    const isCurrentlyFavorite = favorites[eds_id] || false;

    try {
        if (isCurrentlyFavorite) {
            // DELETE request to remove from favorites
            await axios.delete(`${baseUrl}/records/delete`, {
                data: { eds_id, folio_id },
                withCredentials: true
            });
            setFavorites(prev => ({ ...prev, [an]: false }));
            toast.success('Removed from favorites');
        } else {
            // POST request to add to favorites
            await axios.post(`${baseUrl}/records/create`, {
                eds_id, folio_id, dbid
            }, { withCredentials: true });
            setFavorites(prev => ({ ...prev, [an]: true }));
            toast.success('Added to favorites');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
};

const handleRecord = (an, dbid) => {
  setAn(an);
  setDbid(dbid);
  setRecordModal(true);
  router.push(`/collections/records/${collection_id}?an=${an}&dbid=${dbid}`, undefined, {
    shallow: true,
  });
  
  // Track record view with detailed record information
  if (collection_id && an && record) {
    const titleFull = record.titles?.[0]?.TitleFull || 'No Title';
    const author = record.items?.find(item => item.label === 'Authors')?.data || 'Unknown Author';
    const publicationYear = Array.isArray(record.year) && record.year.length > 0 ? record.year[0] : null;
    
    console.log('=== RECORD CLICK TRACKING ===');
    console.log('About to call trackRecordView with event_type: view_record');
    console.log('Collection ID:', collection_id, 'Record AN:', an);
    
    trackRecordView(parseInt(collection_id), an, {
      dbid: dbid,
      title: titleFull,
      author: author,
      publication_year: publicationYear,
      material_type: materialType?.label,
      source: 'collection_browse',
      has_image: !!image,
      is_open_access: isOpenAccess
    });
  }
};

const handleImageClick = (an, dbid) => {
  // Track image interaction separately
  if (collection_id && an && record) {
    const titleFull = record.titles?.[0]?.TitleFull || 'No Title';
    trackMediaInteraction(parseInt(collection_id), an, image ? 'cover_image' : 'placeholder', {
      title: titleFull,
      has_actual_image: !!image,
      material_type: materialType?.label,
      source: 'collection_browse'
    });
  }
  
  // Then handle the record view normally
  handleRecord(an, dbid);
};

const isFavorite = favorites[an] || false;
const materialType = getMaterialType(record);

const titleFull = record.titles?.[0]?.TitleFull || 'No Title';
const sanitizedAn = an.replace(/[^a-zA-Z0-9_-]/g, '_');

const publicationYear = Array.isArray(record.year) && record.year.length > 0 ? record.year[0] : null;

// Check if the record is open access based on SeriesInfo
const isOpenAccess = record.items?.some(item => 
  item.name === 'SeriesInfo' && 
  item.data?.some(data => 
    typeof data === 'string' && data.toLowerCase().includes('open access')
  )
) || false;


return (
  <div key={recordKey} className="record-item">
    {imageUploadModalOpen && (
      <ImageUploadModal
        isOpen={imageUploadModalOpen}
        toggle={toggleImageUploadModal}
        record={selectedRecord}
      />
    )}
    <Modal
      size="xl"
      isOpen={collectionModal}
      toggle={toggleCollectionModal}
      className="modal-dialog modal-dialog-centered"
    >
      <ModalHeader toggle={toggleCollectionModal}>Add to Collection</ModalHeader>
      <ModalBody>
        <CollectionsModal toggleCollectionModal={toggleCollectionModal} />
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-secondary" onClick={toggleCollectionModal}>
          Cancel
        </button>
      </ModalFooter>
    </Modal>
    <div className="image-container" aria-hidden="true" onClick={() => handleImageClick(an, dbid)} style={{ position: 'relative' }}>
      {image !== '' ? (
        <Image
          src={image}
          alt={titleFull}
          layout="responsive"
          width={500}
          height={300}
          className="rounded card-img-top"
          objectFit="contain"
          unoptimized={true}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <PlaceholderCover 
          ariaLabel={`No cover for ${titleFull}`}
          icon={(() => {
            const label = (getMaterialType(record)?.label || '').toLowerCase();
            return (label.includes('video') || label.includes('movie') || label.includes('dvd') || label.includes('film')) ? '🎬' : '📚';
          })()}
        />
      )}
      {isOpenAccess && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          zIndex: 10
        }}>
          <span style={{ fontSize: '0.8em' }}>🔓</span>
          <span>OPEN ACCESS</span>
        </div>
      )}
    </div>
    <div className="card-info">
      <div className="record-title" id={`titleTooltip-${sanitizedAn}`}>
        <LinesEllipsis
          text={titleFull}
          maxLine="3"
          ellipsis="..."
          trimRight
          basedOn="letters"
        />
      </div>
      {publicationYear && (
        <div className="publication-year">
          {publicationYear}
        </div>
      )}
      <div className="material-type-badge">
        <FontAwesomeIcon icon={materialType.icon} />
        <span>{materialType.label}</span>
      </div>
      <button 
        className="view-details-btn"
        onClick={() => handleRecord(an, dbid)}
      >
        View Details
      </button>
      {loggedIn ? (
        <div className="interaction-icons">
          <button 
            onClick={() => toggleFavorite(an, dbid)} 
            className={`icon-button ${isFavorite ? 'favorite' : ''}`}
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button onClick={() => toggleCollectionModal(an, dbid)} className="icon-button">
            <FontAwesomeIcon icon={faPlusSquare} />
          </button>
          <button
            className="icon-button"
            onClick={() =>
              toggleImageUploadModal({
                an: an,
                dbid: dbid,
              })
            }
          >
            <FontAwesomeIcon icon={faUpload} />
          </button>
        </div>
      ) : (
        ''
      )}
    </div>
  </div>
);
}

export default PublicCollectionsRecordDisplay;