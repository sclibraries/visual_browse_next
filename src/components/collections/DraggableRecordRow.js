import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle,
  faEye,
  faGripVertical,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { GET_RECORD } from '../../lib/api';
import { useRecordImage } from '../../hooks/useRecordImage';
import ImageUploadModal from '../ImageUploadModal';
import RecordDetailsModal from '../RecordDetailsModal';
import styles from '../../styles/CollectionsPage.module.css';

function LoadingRow({ isDragging }) {
  return (
    <tr className={`${styles.tableRow} ${isDragging ? styles.dragging : ''}`}>
      <td className={styles.selectCell}><input type="checkbox" disabled /></td>
      <td className={styles.dragHandleCell}><div className={styles.dragHandle}><FontAwesomeIcon icon={faGripVertical} /></div></td>
      <td className={styles.imageCell}><div className={styles.imagePlaceholder}><Spinner size="sm" /></div></td>
      <td className={styles.titleCell}><div className="placeholder-glow"><span className="placeholder col-8"></span></div></td>
      <td className={styles.authorCell}><div className="placeholder-glow"><span className="placeholder col-6"></span></div></td>
      <td className={styles.typeCell}><div className="placeholder-glow"><span className="placeholder col-4"></span></div></td>
      <td className={styles.yearCell}><div className="placeholder-glow"><span className="placeholder col-3"></span></div></td>
      <td className={styles.actionsCell}></td>
      <td className={styles.setCoverCell}></td>
    </tr>
  );
}

function ErrorRow({ isDragging, onDelete, record }) {
  return (
    <tr className={`${styles.tableRow} ${isDragging ? styles.dragging : ''}`}>
      <td className={styles.selectCell}><input type="checkbox" disabled /></td>
      <td className={styles.dragHandleCell}><div className={styles.dragHandle}><FontAwesomeIcon icon={faGripVertical} /></div></td>
      <td className={styles.imageCell}><div className={styles.errorImage}><FontAwesomeIcon icon={faExclamationTriangle} /></div></td>
      <td colSpan={4} className={styles.titleCell} style={{ fontSize: '0.9rem' }}>Error loading record</td>
      <td className={styles.actionsCell}>
        <Button color="danger" size="sm" onClick={() => onDelete(record.folio_id, record.folio_id, record.collection_records_id)} style={{ padding: '2px 4px' }}>
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </Button>
      </td>
      <td className={styles.setCoverCell}></td>
    </tr>
  );
}

export default function DraggableRecordRow({
  id,
  record,
  index,
  moveRecord,
  onDelete,
  onViewRecord,
  onSetCoverImage,
  isSelected,
  onToggleSelect,
  selectedRecords,
  onMoveToPosition,
  totalRecords,
  currentCover,
}) {
  const [imageError, setImageError] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const { loading, error, data } = useQuery(GET_RECORD, {
    variables: { an: record.eds_id || record.folio_id, dbid: record.dbid },
    skip: !record.folio_id,
  });

  const recordData = useMemo(() => data?.record?.records || {}, [data]);
  const image = useRecordImage(recordData);

  const handleImageError = () => setImageError(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleUploadModal = useCallback(() => setShowUploadModal((s) => !s), []);
  const toggleDetailsModal = useCallback(() => setShowDetailsModal((s) => !s), []);

  const titleFull = recordData.titles?.[0]?.TitleFull || 'Loading...';
  const author = recordData.items?.find(item => item.label === 'Authors')?.data || '';
  const publicationyear = recordData.year?.[0] || '';
  const materialType = recordData.pubType || 'Unknown';

  useEffect(() => {
    if (recordData && Object.keys(recordData).length > 0) {
      record.titleFull = titleFull;
      record.author = author;
      record.publicationyear = publicationyear;
      record.materialType = materialType;
    }
  }, [recordData, titleFull, author, publicationyear, materialType, record]);

  if (loading) return <LoadingRow isDragging={isDragging} />;
  if (error) return <ErrorRow isDragging={isDragging} onDelete={onDelete} record={record} />;

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={`${styles.tableRow} ${isDragging ? styles.dragging : ''} ${isSelected ? styles.selectedRow : ''}`}
      >
        <td className={styles.selectCell}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(record.collection_records_id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
        <td className={styles.dragHandleCell} {...attributes} {...listeners}>
          <div className={styles.dragHandle} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
            <FontAwesomeIcon icon={faGripVertical} />
          </div>
        </td>
        <td className={styles.precisionArrowsCell}>
          <div className={styles.precisionArrows}>
            <Button color="outline-secondary" size="sm" onClick={(e) => { e.stopPropagation(); if (index > 0) moveRecord(index, index - 1); }} disabled={index === 0} title="Move up one position" className={styles.precisionButton}>
              <FontAwesomeIcon icon={faChevronUp} size="xs" />
            </Button>
            <Button color="outline-secondary" size="sm" onClick={(e) => { e.stopPropagation(); if (index < totalRecords - 1) moveRecord(index, index + 1); }} disabled={index >= totalRecords - 1} title="Move down one position" className={styles.precisionButton}>
              <FontAwesomeIcon icon={faChevronDown} size="xs" />
            </Button>
          </div>
        </td>
        <td className={styles.imageCell}>
          {image && !imageError ? (
            <div className={styles.thumbnailContainer}>
              <Image src={image} alt={titleFull} width={35} height={50} className={styles.thumbnail} unoptimized={true} onError={handleImageError} />
            </div>
          ) : (
            <div className={styles.noImageIcon}><FontAwesomeIcon icon={faBook} size="lg" /></div>
          )}
        </td>
        <td className={styles.titleCell}>
          <button
            onClick={toggleDetailsModal}
            style={{ background: 'none', border: 'none', padding: 0, color: '#007bff', textDecoration: 'underline', cursor: 'pointer', textAlign: 'left', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.9rem' }}
            title="Click to see full record details"
          >
            {titleFull}
          </button>
        </td>
        <td className={styles.authorCell}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', maxWidth: '150px' }}>{author}</div>
        </td>
        <td className={styles.typeCell}><span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{materialType}</span></td>
        <td className={styles.yearCell} style={{ fontSize: '0.85rem' }}>{publicationyear}</td>
        <td className={styles.actionsCell}>
          <div className={styles.actionButtons} style={{ display: 'flex', gap: '2px' }}>
            <Button color="primary" size="sm" onClick={() => onViewRecord(record)} title="View Record" style={{ padding: '2px 4px' }}>
              <FontAwesomeIcon icon={faEye} size="sm" />
            </Button>
            <Button color="secondary" size="sm" onClick={toggleUploadModal} title="Upload Image" style={{ padding: '2px 4px' }}>
              <FontAwesomeIcon icon={faUpload} size="sm" />
            </Button>
            <Button color="danger" size="sm" onClick={() => onDelete(record.folio_id, record.folio_id, record.collection_records_id)} title="Remove from Collection" style={{ padding: '2px 4px' }}>
              <FontAwesomeIcon icon={faTrash} size="sm" />
            </Button>
            {selectedRecords.length > 0 && (
              <Dropdown isOpen={showMoveMenu} toggle={() => setShowMoveMenu(!showMoveMenu)}>
                <DropdownToggle color="info" size="sm" style={{ padding: '2px 4px' }}>
                  <FontAwesomeIcon icon={faChevronDown} size="sm" />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => onMoveToPosition(index)}>Move selected here</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
        </td>
        <td className={styles.setCoverCell}>
          {image && (
            <Button
              color={image === currentCover ? 'success' : 'primary'}
              size="sm"
              onClick={() => onSetCoverImage(image)}
              disabled={image === currentCover}
              title={image === currentCover ? 'This is the current cover image' : 'Set as cover'}
              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            >
              {image === currentCover ? (<><FontAwesomeIcon icon={faBook} size="xs" className="me-1" />Cover</>) : 'Set'}
            </Button>
          )}
        </td>
      </tr>

      {showUploadModal && (
        <ImageUploadModal isOpen={showUploadModal} toggle={toggleUploadModal} record={{ an: record.eds_id || record.folio_id, dbid: record.dbid }} />
      )}
      {showDetailsModal && (
        <RecordDetailsModal isOpen={showDetailsModal} toggle={toggleDetailsModal} recordData={recordData} image={image} />
      )}
    </>
  );
}
