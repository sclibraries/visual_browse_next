import { Modal, ModalBody, ModalHeader, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCheck,
  faCheckSquare,
  faChevronDown,
  faChevronUp,
  faEllipsisV,
  faEye,
  faGripVertical,
  faSortAlphaDown,
  faTrash,
  faUndo,
  faUpload,
  faArrowDown,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';

export default function CollectionsHelpModal({ isOpen, toggle }) {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Collections Help</ModalHeader>
      <ModalBody>
        <Row>
          <Col md="6">
            <h5>Basic Functions</h5>
            <ul>
              <li>
                <strong><FontAwesomeIcon icon={faGripVertical} className="me-1" />Drag Handle:</strong>
                &nbsp;Use the <FontAwesomeIcon icon={faGripVertical} /> icon to drag and reorder items in your collection.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faChevronUp} className="me-1" /><FontAwesomeIcon icon={faChevronDown} className="me-1" />Precision Arrows:</strong>
                &nbsp;Use the up/down arrows in the &quot;Move&quot; column to move items one position at a time.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faEllipsisV} className="me-1" />Collection Actions:</strong>
                &nbsp;Click the <FontAwesomeIcon icon={faEllipsisV} /> (three dots) next to a collection to edit, delete, or empty it.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faTrash} className="me-1" />Delete Collection:</strong>
                &nbsp;You must <b>empty</b> a collection before you can delete it.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faEye} className="me-1" />View Record:</strong>
                &nbsp;Click the <FontAwesomeIcon icon={faEye} /> button or the cover/title to view record details.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faUpload} className="me-1" />Upload Image:</strong>
                &nbsp;Click the <FontAwesomeIcon icon={faUpload} /> button to upload a new cover image for a record.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faBook} className="me-1" />Set Cover:</strong>
                &nbsp;Click &quot;Set Cover&quot; to make a record&#39;s image the collection&#39;s cover. The green &quot;Cover&quot; button indicates the current cover image.
              </li>
            </ul>
          </Col>
          <Col md="6">
            <h5>Advanced Sorting & Organization</h5>
            <ul>
              <li>
                <strong><FontAwesomeIcon icon={faCheckSquare} className="me-1" />Multi-Select:</strong>
                &nbsp;Use checkboxes to select multiple records. Select all with the header checkbox.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faArrowUp} className="me-1" />Selection Actions:</strong>
                &nbsp;When records are selected, a blue action bar appears with Top/Bottom buttons and precise positioning.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faSortAlphaDown} className="me-1" />Dropdown Sorting:</strong>
                &nbsp;Use the &quot;Sort by&quot; dropdown to organize records by title, author, type, or year.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faArrowDown} className="me-1" />Precision Move:</strong>
                &nbsp;Select records, then use the dropdown arrow on any row to move selected items to that position.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faUndo} className="me-1" />Reset Changes:</strong>
                &nbsp;Click &quot;Reset&quot; to undo all local sorting and return to original order.
              </li>
              <li>
                <strong><FontAwesomeIcon icon={faCheck} className="me-1" />Apply Changes:</strong>
                &nbsp;Click &quot;Apply Changes&quot; to save your new order to the server permanently.
              </li>
            </ul>
            <div className="alert alert-info mt-3">
              <strong>Tip:</strong> All sorting and reordering happens locally until you click &quot;Apply Changes&quot;. This lets you experiment with different arrangements before saving.
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
}
