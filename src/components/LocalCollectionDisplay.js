import { Fragment, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart,faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import { DisplayImage } from './DisplayImage';
import { useStore } from '../store/store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useShallow } from 'zustand/react/shallow';
import CollectionsModal from './CollectionsModal';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import LinesEllipsis from 'react-lines-ellipsis';
import Image from 'next/image'
import LocalCollectionLayout from '../layouts/LocalCollectionLayout';

function LocalCollectionItem({ instance, isFavorite, loggedIn, onViewDetails, onToggleFavorite, onToggleCollection, collectionSlug }) {
  const imageUrl = instance?.uriImage || '';
  const title = instance?.title || 'No Title';
  const handleClick = () => onViewDetails(imageUrl || '');

  return (
    <div className="record-item" key={instance.id}>
      <div className="image-container" aria-hidden="true" onClick={handleClick}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="card-img-top"
            style={{ objectFit: 'contain' }}
            unoptimized={true}
          />
        ) : (
          // Use DisplayImage for server-side lookup; it will fallback to PlaceholderCover
          <DisplayImage an={instance.id} materialType={instance?.materialType} collectionSlug={collectionSlug} />
        )}
      </div>
      <div className="card-info">
        <div className="record-title">
          <LinesEllipsis text={title} maxLine="3" ellipsis="..." trimRight basedOn="letters" />
        </div>
        <button
          className="view-details-btn"
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          aria-label={`View details for ${title}`}
        >
          View Details
        </button>
        {loggedIn ? (
          <div className="interaction-icons">
            <button onClick={onToggleFavorite} className="icon-button">
              {isFavorite ? <FontAwesomeIcon icon={faHeart} style={{ color: '#fc0303' }} /> : <FontAwesomeIcon icon={faHeart} />}
            </button>
            <button onClick={onToggleCollection} className="icon-button">
              <FontAwesomeIcon icon={faPlusSquare} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LocalCollectionDisplay(props){

  const { instances, page, totalRecords, limit, loadMore, handleLazyLoad, handleRecord, headerContent } = props;
    const [favorites, setFavorites] = useState({});
    const [collectionModal, setCollectionModal] = useState(false);


    const [loggedIn, baseUrl, setCollectionAn] = useStore(useShallow(state => [
        state.loggedIn,
        state.baseUrl,
        state.setCollectionAn
      ]))

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
          const baseUrl = useStore.getState().baseUrl;
          const newFavorites = {};
      
          for (const record of props.instances || []) {
            try {
              const response = await axios.get(`${baseUrl}/records/read/scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${record.id.replace(/-/g, ".")}`, { withCredentials: true });
              newFavorites[record.id] = response.data && response.data.record_id ? true : false;
            } catch (error) {
              console.error('Error checking favorite:', error);
            }
          }
         
            setFavorites(newFavorites);
        };
      
        if (props.instances && props.instances.length > 0 && loggedIn) {
          fetchFavorites();
        }
      }, [props.instances, loggedIn]);  


    return(
        <LocalCollectionLayout>
        <Fragment>
        <         Modal size='xl' isOpen={collectionModal} toggle={toggleCollectionModal} className="modal-dialog modal-dialog-centered">
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
                            <h1 className="h3 mb-3 fw-normal">{props.collectionTitle}</h1>
                            <p>Results: <strong>{props.totalRecords}</strong></p>
                        </div>
                    </div>
                  {headerContent ? <div className="px-2 pb-3">{headerContent}</div> : null}
                    {props.loading ? (
                       <div className="records-grid">
                                 {[...Array(20)].map((_, i) => (
                                   <div key={i} className="record-item">
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
                                       <div className="placeholder-glow mb-1">
                                         <span className="placeholder col-5" style={{height: '18px', borderRadius: '4px'}}></span>
                                       </div>
                                       <div className="placeholder-glow">
                                         <span className="placeholder col-10" style={{height: '34px', borderRadius: '8px'}}></span>
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
                        {instances && !props.loading &&
                            instances && instances.length > 0 ? Object.keys(instances).map((key) => {
                            const instance = instances[key];
                            const isFavorite = favorites[instance.id] || false;
                            return (
                              <LocalCollectionItem
                                key={instance.id}
                                instance={instance}
                                isFavorite={isFavorite}
                                loggedIn={loggedIn}
                                collectionSlug={props.collectionSlug}
                                onViewDetails={(img) => handleRecord(instance.id, img)}
                                onToggleFavorite={() => toggleFavorite(instance.id)}
                                onToggleCollection={() => toggleCollectionModal(instance.id)}
                              />
                            );
                          })
                        : ''}
                    </div>
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
        </LocalCollectionLayout>
    )
}

export default LocalCollectionDisplay

