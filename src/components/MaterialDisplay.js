import RecordBadges from './RecordBadges';
import { useState, useEffect } from "react";
import { getMaterialType } from '../utils/materialTypeUtils'; // Adjust the path as necessary
import {
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Facets from "./Facets";
import RecordCoverImage from './RecordCoverImage';
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store/store";
import { useRouter } from "next/router";
import DateSlider from "./DateSlider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart, 
  faPlusSquare,
  faUpload
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from "react-toastify";
import CollectionsModal from "./CollectionsModal";
import Sort from "./Sort";
import LinesEllipsis from "react-lines-ellipsis";
import ImageUploadModal from "./ImageUploadModal";
import { useRecordImage } from "../hooks/useRecordImage";
import PlaceholderCover from "./PlaceholderCover";
import CollectionsSection from "./CollectionsSection";

const { getPlaceholderCoverConfig } = require('../utils/placeholderCover.cjs');


function MaterialDisplay(props) {
  const [collectionModal, setCollectionModal] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [setButtonRef] = useState(null);
  const router = useRouter();
  const [isDateSliderOpen, setIsDateSliderOpen] = useState(false);

  const [
    setAn,
    setDbid,
    setMaterial,
    recordModal,
    setRecordModal,
    loading,
    loggedIn,
    baseUrl,
    setCollectionAn,
    setCollectionDbid,
  ] = useStore(useShallow((state) => [
      state.setAn,
      state.setDbid,
      state.setMaterial,
      state.recordModal,
      state.setRecordModal,
      state.loading,
      state.loggedIn,
      state.baseUrl,
      state.setCollectionAn,
      state.setCollectionDbid,
    ]));

  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const toggleImageUploadModal = (record) => {
    setSelectedRecord(record);
    setImageUploadModalOpen(!imageUploadModalOpen);
  };

  const toggleCollectionModal = (an, dbid) => {
    if (an && an !== "") {
      setCollectionAn(an);
      setCollectionDbid(dbid);
      setCollectionModal(!collectionModal); // Toggle the modal state
    } 
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      const baseUrl = useStore.getState().baseUrl; // Or however you get baseUrl
      const newFavorites = {};

      for (const record of props.records) {
        try {
          const response = await axios.get(
            `${baseUrl}/records/read/${record.an}`,
            { withCredentials: true }
          );
          newFavorites[record.an] =
            response.data && response.data.record_id ? true : false;
        } catch (error) {
          ''
        }
      }

      setFavorites(newFavorites);
    };

    if (props.records && props.records.length > 0 && loggedIn) {
      fetchFavorites();
    }
  }, [props.records, loggedIn]);

  const handleRecord = (an, dbid, e) => {
    e.preventDefault();
    setAn(an);
    setDbid(dbid);
    setMaterial(props.material);
    setRecordModal(!recordModal);
    router.push(`${router.pathname}?an=${an}&dbid=${dbid}`, undefined, {
      shallow: true,
    });
  };

  const toggleDateSlider = () => {
    setIsDateSliderOpen(!isDateSliderOpen);
  };

  const records = props.records;

  const toggleFavorite = async (record) => {
    const eds_id = record.an;
    const dbid = record.dbid;
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
          withCredentials: true,
        });
        setFavorites((prev) => ({ ...prev, [eds_id]: false }));
        toast.success("Removed from favorites");
      } else {
        // POST request to add to favorites
        await axios.post(
          `${baseUrl}/records/create`,
          {
            eds_id,
            folio_id,
            dbid
          },
          { withCredentials: true }
        );
        setFavorites((prev) => ({ ...prev, [eds_id]: true }));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };



  return (
    <>
      <Modal
        size="xl"
        isOpen={collectionModal}
        toggle={toggleCollectionModal}
        className="modal-dialog modal-dialog-centered"
      >
        <ModalHeader toggle={toggleCollectionModal}>
          Add to Collection
        </ModalHeader>
        <ModalBody>
          <CollectionsModal toggleCollectionModal={toggleCollectionModal} />
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-secondary" onClick={toggleCollectionModal}>
            Cancel
          </button>
        </ModalFooter>
      </Modal>
      <div>
        <Facets
          activatedFacets={props.activatedFacet}
          facetDisplay={props.facetDisplay}
          handleFacetAction={props.handleFacetAction}
          handleRemoveFacetAction={props.handleRemoveFacetAction}
          genre={props.genre}
          subjectHeadings={props.subjectHeadings}
          onSelect={props.onSelect}
          appliedFacets={props.appliedFacets}
          materialType={props.materialType}
          bookGenres={props.bookGenres}
          comicSubjectHeadings={props.comicSubjectHeadings}
        />
        <div className="hide-scrollbar flex-1 h-100">
          <div className="d-flex mb-3">
            <div className="p-2">
              <p className="text-dark font-weight-medium">
                Your search resulted in {props.hits} hits{" "}
              </p>
            </div>
            <div className="ms-auto p-2">
              <button className="btn btn-secondary" onClick={toggleDateSlider}>
                {isDateSliderOpen
                  ? "Hide Publication Date Filter"
                  : "Show Publication Date Filter"}
              </button>
            </div>
            <div className="p-2">
              <Sort />
            </div>
          </div>
          <Collapse isOpen={isDateSliderOpen}>
            <DateSlider />
          </Collapse>
          
          {/* Collections Section - only show if there are collections */}
          {props.collections && props.collections.length > 0 && (
            <CollectionsSection 
              collections={props.collections}
              collectionHits={props.collectionHits}
              query={useStore.getState().query || ''}
            />
          )}
          
          {loading ? (
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
          ) : (
            ""
          )}
          <div className="records-grid">
            {records && records.length > 0
              ? Object.keys(records).map((key, index) => {
                  const record = records[key];
                  const isFavorite = favorites[record.an] || false;
                  return (
                    <RecordItem
                      key={index}
                      record={record}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                      toggleCollectionModal={toggleCollectionModal}
                      toggleImageUploadModal={toggleImageUploadModal}
                      handleRecord={handleRecord}
                      loggedIn={loggedIn}
                    />
                  );
                })
              : ""}
          </div>
          {imageUploadModalOpen && (
            <ImageUploadModal
              isOpen={imageUploadModalOpen}
              toggle={toggleImageUploadModal}
              record={selectedRecord}
            />
          )}
          {props.page < props.totalPages ? (
            <div
              className="d-grid gap-2 list"
              style={{ paddingTop: "20px", paddingBottom: "50px" }}
            >
              <button
                className={
                  props.loadMore ? "btn btn-info disabled" : "btn btn-primary"
                }
                ref={setButtonRef}
                id="buttonLoadMore"
                onClick={() => props.handleLazyLoad()}
              >
                {props.loadMore ? "Loading..." : "Load more"}
              </button>
            </div>
          ) : (
            <div
              className="d-grid gap-2 list"
              style={{ paddingTop: "20px", paddingBottom: "50px" }}
            >
              <button className="btn btn-primary" disabled>
                End of results
              </button>
            </div>
          )}
        </div>
      </div>
  </>
  );
}

// New RecordItem component to handle individual record rendering and state
function RecordItem({
  record,
  isFavorite,
  toggleFavorite,
  toggleCollectionModal,
  toggleImageUploadModal,
  handleRecord,
  loggedIn,
}) {
  const imageUrl = useRecordImage(record);

  const titleString =
    record.titleItem?.toString() ||
    record.items?.map((items) =>
      items.label === "Title" ? items.data : ""
    ) ||
    "";
  let titleStringDisplay = titleString || "";
  if (titleString !== "" && titleString.includes("/")) {
    const titleClean = titleString.split("/");
    titleStringDisplay = titleClean[0];
  } else {
    titleStringDisplay = record.titles[0]?.TitleFull || titleString;
  }
  const materialType = getMaterialType(record);

  return (
    <div 
      className="record-item" 
      id={"eds-" + record.an}
      onClick={(e) => {
        // Only trigger if clicking the card itself, not the interaction buttons
        if (!e.target.closest('.interaction-icons')) {
          handleRecord(record.an, record.dbid, e);
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.interaction-icons')) {
          e.preventDefault();
          handleRecord(record.an, record.dbid, e);
        }
      }}
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
      aria-label={`View details for ${titleStringDisplay}`}
    >
      <div className="image-container">
        {imageUrl && imageUrl !== '' ? (
          <RecordCoverImage src={imageUrl} alt={titleStringDisplay} />
        ) : (
          <PlaceholderCover
            {...getPlaceholderCoverConfig({ materialType: materialType?.label, pubType: record?.pubType })}
            ariaLabel={`No cover for ${titleStringDisplay}`}
          />
        )}
        <RecordBadges record={record} />
      </div>
      <div className="card-info">
        <div className="record-title">
          <LinesEllipsis
            text={titleStringDisplay}
            maxLine="3"
            ellipsis="..."
            trimRight
            basedOn="letters"
          />
        </div>
        <div className="material-type-badge">
          <FontAwesomeIcon icon={materialType.icon} />
          <span> {materialType.label}</span>
        </div>
        {loggedIn ? (
          <div className="interaction-icons">
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(record);
              }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <FontAwesomeIcon
                  icon={faHeart}
                  style={{ color: "#fc0303" }}
                />
              ) : (
                <FontAwesomeIcon icon={faHeart} />
              )}
            </button>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollectionModal(record.an, record.dbid);
              }}
              aria-label="Add to collection"
            >
              <FontAwesomeIcon icon={faPlusSquare} />
            </button>
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleImageUploadModal(record);
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

export default MaterialDisplay;
