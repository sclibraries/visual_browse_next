import { Fragment, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart,faPlusSquare,faUpload} from '@fortawesome/free-solid-svg-icons';
import { DisplayImage } from './DisplayImage';
import { useStore } from '../store/store';
import HomeLayout from '../layouts/HomeLayout';
import LocationSort from './LocationSort';
import SubjectSort from './SubjectSort';
import DateSort from './DateSort';
import axios from 'axios';
import { toast } from 'react-toastify';
import { shallow } from 'zustand/shallow';
import CollectionsModal from './CollectionsModal';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import LinesEllipsis from 'react-lines-ellipsis';
import ImageUploadModal from "./ImageUploadModal";
import { getMaterialType } from '../utils/materialTypeUtils';



function NewMaterialDisplay(props) {

    const [favorites, setFavorites] = useState({});
    const [collectionModal, setCollectionModal] = useState(false);
    const [imageRefreshKey, setImageRefreshKey] = useState(0);

    const handleImageUploadSuccess = () => {
        setImageRefreshKey((prevKey) => prevKey + 1);
      };

    const [loggedIn, baseUrl, setCollectionAn] = useStore(state => [
        state.loggedIn,
        state.baseUrl,
        state.setCollectionAn
      ], shallow)

    const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const openImageUploadModal = (instanceID) => {
        const eds_id = `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${instanceID.replace(
          /-/g,
          '.'
        )}`;
        const record = {
          an: eds_id,
          dbid: 'cat09206a',
        };
        setSelectedRecord(record);
        setImageUploadModalOpen(true);
      };
    
      const closeImageUploadModal = () => {
        setImageUploadModalOpen(false);
      };

    const toggleFavorite = async (record) => {
        const eds_id = `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${record.replace(/-/g, ".")}`
        const folio_id = record
        const isCurrentlyFavorite = favorites[folio_id] || false;
  
        try {
            if (isCurrentlyFavorite) {
                // DELETE request to remove from favorites
                await axios.delete(`${baseUrl}/records/delete`, {
                    data: { eds_id, folio_id },
                    withCredentials: true
                });
                setFavorites(prev => ({ ...prev, [folio_id]: false }));
                toast.success('Removed from favorites');
            } else {
                // POST request to add to favorites
                await axios.post(`${baseUrl}/records/create`, {
                    eds_id, folio_id
                }, { withCredentials: true });
                setFavorites(prev => ({ ...prev, [folio_id]: true }));
                toast.success('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const toggleCollectionModal = (an) => {
        if(an && an !== '') {
          setCollectionAn(an); 
        }// Update the store with the `an` value
        setCollectionModal(!collectionModal); // Toggle the modal state
    };
    

    useEffect(() => {
        const fetchFavorites = async () => {
          const baseUrl = useStore.getState().baseUrl; // Or however you get baseUrl
          const newFavorites = {};
      
          for (const record of props.poLines) {
            try {
              const response = await axios.get(`${baseUrl}/records/read/scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${record.instanceId.replace(/-/g, ".")}`, { withCredentials: true });
              newFavorites[record.instanceId] = response.data && response.data.record_id ? true : false;
            } catch (error) {
              console.error('Error checking favorite:', error);
            }
          }
         
            setFavorites(newFavorites);
        };
      
        if (props.poLines && props.poLines.length > 0 && loggedIn) {
          fetchFavorites();
        }
      }, [props.poLines, loggedIn]);

    return (
        <HomeLayout>    
        <Fragment>
            <Modal size='xl' isOpen={collectionModal} toggle={toggleCollectionModal} className="modal-dialog modal-dialog-centered">
                      <ModalHeader toggle={toggleCollectionModal}>Add to Collection</ModalHeader>
                      <ModalBody>
                      <CollectionsModal
                          toggleCollectionModal={toggleCollectionModal}
                      />
                      </ModalBody>
                      <ModalFooter>
                      <button className="btn btn-secondary" onClick={toggleCollectionModal}>Cancel</button>
                      </ModalFooter>
                  </Modal>
                <Fragment>
                    <div className="d-flex mb-3">
                        <div className="p-2">
                            <p>Results: <strong>{props.totalRecords}</strong></p>
                        </div>
                        {props.material === 'books' || props.material == 'dvd' ?
                        <div className="ms-auto p-2">
                            <LocationSort />
                        </div>
                        : ''}
                        {props.material == 'books' ?
                        <div className="p-2">
                            <SubjectSort />
                        </div>
                        : '' }
                        <div className={props.material === 'books' || props.material === 'dvd' ? "p-2" : "ms-auto ps"}>
                            <DateSort />
                        </div>
                    </div>
                    {props.loading ? (
                        <div className="records-grid">
                                 {[...Array(20)].map((_, i) => (
                                   <div key={i} className="record-item loading-skeleton">
                                       <div className="image-container">
                                           <div className="placeholder-image"></div>
                                       </div>
                                     <div className="card-info">
                                       <div className="record-title">
                                         <div className="placeholder-glow">
                                           <span className="placeholder col-8"></span>
                                           <span className="placeholder col-6"></span>
                                           <span className="placeholder col-7"></span>
                                         </div>
                                       </div>
                                       <div className="placeholder-glow">
                                         <span className="placeholder col-10" style={{height: '40px', borderRadius: '8px'}}></span>
                                       </div>
                                       {loggedIn ? (
                                       <div className="interaction-icons">
                                         <div className="placeholder-glow d-flex gap-2">
                                           <span className="placeholder rounded-circle" style={{width: '24px', height: '24px'}}></span>
                                           <span className="placeholder rounded-circle" style={{width: '24px', height: '24px'}}></span>
                                           <span className="placeholder rounded-circle" style={{width: '24px', height: '24px'}}></span>
                                         </div>
                                       </div>
                                       ) : ''}
                                     </div>
                                   </div>
                                 ))}
                        </div>
                    ): ''}
                    <div className="records-grid">
                        {props.poLines && !props.loading &&
                            props.poLines && props.poLines.length > 0 ? Object.keys(props.poLines).map((key, index) => {
                            const poLine = props.poLines[key];
                            const isFavorite = favorites[poLine.instanceId] || false;
                            return(
                                <NewRecordItem
                                    key={index}
                                    poLine={poLine}
                                    isFavorite={isFavorite}
                                    toggleFavorite={toggleFavorite}
                                    toggleCollectionModal={toggleCollectionModal}
                                    openImageUploadModal={openImageUploadModal}
                                    handleRecord={props.handleRecord}
                                    loggedIn={loggedIn}
                                    imageRefreshKey={imageRefreshKey}
                                />
                            )
                            }
                        ): ''}
                        </div>

                {props.page <= Math.ceil(props.totalRecords/props.limit) ?
                <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}>
                    <button
                        className={props.loadMore ? "btn btn-info disabled" : "btn btn-primary"}
                        id="buttonLoadMore"
                        onClick={() =>
                            props.handleLazyLoad()
                          }
                    >
                    {props.loadMore ? "Loading..." : "Load more"}
                    </button>
                </div>
                : <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}><button className="btn btn-primary" disabled>End of results</button></div>}
                </Fragment> 
        </Fragment>
        {imageUploadModalOpen && (
            <ImageUploadModal
              isOpen={imageUploadModalOpen}
              toggle={closeImageUploadModal}
              record={selectedRecord}
              onUploadSuccess={handleImageUploadSuccess}
            />
          )}
        </HomeLayout>
    )
}

// NewRecordItem component to handle individual record rendering
function NewRecordItem({
  poLine,
  isFavorite,
  toggleFavorite,
  toggleCollectionModal,
  openImageUploadModal,
  handleRecord,
  loggedIn,
  imageRefreshKey,
}) {
  // Extract title from FOLIO instance data with fallback to titleOrPackage
  const instanceTitle = poLine.retrieveorderitems?.instances?.[0]?.title;
  const titleDisplay = instanceTitle || poLine.titleOrPackage;
  const imageUrl = poLine?.uriImage || poLine?.coverImageUrl || '';
  
  // Get material type from items section
  const materialTypeName = poLine.retrieveorderitems?.instances?.[0]?.items?.[0]?.retrievemattype?.[0]?.name;
  const materialType = getMaterialType({ materialType: materialTypeName });

  return (
    <div 
      className="record-item"
      onClick={(e) => {
        if (!e.target.closest('.interaction-icons')) {
          handleRecord(poLine.instanceId, imageUrl);
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.interaction-icons')) {
          e.preventDefault();
          handleRecord(poLine.instanceId, imageUrl);
        }
      }}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
      aria-label={`View details for ${titleDisplay}`}
    >
      <div className="image-container">
        <DisplayImage 
          an={poLine.instanceId} 
          materialType={poLine.materialType}
          refresh={imageRefreshKey}
        />
      </div>
      <div className="card-info">
        <div className="record-title">
          <LinesEllipsis
            text={titleDisplay}
            maxLine='3'
            ellipsis='...'
            trimRight
            basedOn='letters'
          />
        </div>
        <div className="material-type-badge">
          <FontAwesomeIcon icon={materialType.icon} />
          <span> {materialType.label}</span>
        </div>
        {loggedIn ? (
          <div className="interaction-icons">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(poLine.instanceId);
              }} 
              className="icon-button"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <FontAwesomeIcon icon={faHeart} style={{color: "#fc0303"}} />
              ) : (
                <FontAwesomeIcon icon={faHeart} />
              )}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleCollectionModal(poLine.instanceId);
              }} 
              className="icon-button"
              aria-label="Add to collection"
            >
              <FontAwesomeIcon icon={faPlusSquare} />
            </button>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                openImageUploadModal(poLine.instanceId);
              }}
              aria-label="Upload custom image"
            >
              <FontAwesomeIcon icon={faUpload} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default NewMaterialDisplay;