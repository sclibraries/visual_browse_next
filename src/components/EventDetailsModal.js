import { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Badge
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar,
  faTag,
  faSearch,
  faMousePointer,
  faGlobe,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

const EventDetailsModal = ({ isOpen, toggle, event }) => {
  if (!event) return null;

  const getEventTypeIcon = (eventType) => {
    const icons = {
      'view_collection': faGlobe,
      'view_record': faMousePointer,
      'search_collection': faSearch,
      'load_more_records': faDatabase,
      'media_interaction': faMousePointer
    };
    return icons[eventType] || faTag;
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'view_collection': 'primary',
      'view_record': 'success',
      'search_collection': 'warning',
      'load_more_records': 'info',
      'media_interaction': 'danger'
    };
    return colors[eventType] || 'secondary';
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      'view_collection': 'Collection View',
      'view_record': 'Record View',
      'search_collection': 'Collection Search',
      'load_more_records': 'Load More Records',
      'media_interaction': 'Media Interaction'
    };
    return labels[eventType] || eventType;
  };

  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    
    const entries = Object.entries(metadata);
    if (entries.length === 0) return null;

    return entries.map(([key, value]) => (
      <Row key={key} className="mb-2">
        <Col sm={4}>
          <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
        </Col>
        <Col sm={8}>
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </Col>
      </Row>
    ));
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <div className="d-flex align-items-center">
          <FontAwesomeIcon 
            icon={getEventTypeIcon(event.event_type)} 
            className={`me-2 text-${getEventTypeColor(event.event_type)}`} 
          />
          Event Details - {getEventTypeLabel(event.event_type)}
        </div>
      </ModalHeader>
      <ModalBody>
        <Card>
          <CardHeader>
            <h6 className="mb-0">Event Data</h6>
          </CardHeader>
          <CardBody>
            <Row className="mb-3">
              <Col sm={12}>
                <Badge color={getEventTypeColor(event.event_type)} className="me-2">
                  {getEventTypeLabel(event.event_type)}
                </Badge>
                <small className="text-dark">
                  Occurred on {new Date(event.created_at).toLocaleDateString()} at {new Date(event.created_at).toLocaleTimeString()}
                </small>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col sm={4}>
                <strong>
                  <FontAwesomeIcon icon={faCalendar} className="me-2" />
                  Event ID:
                </strong>
              </Col>
              <Col sm={8}>
                {event.id}
              </Col>
            </Row>

            {event.record_id && (
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>
                    <FontAwesomeIcon icon={faDatabase} className="me-2" />
                    Record ID:
                  </strong>
                </Col>
                <Col sm={8}>
                  <code>{event.record_id}</code>
                </Col>
              </Row>
            )}

            {event.search_query && (
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>
                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                    Search Query:
                  </strong>
                </Col>
                <Col sm={8}>
                  <code>{event.search_query}</code>
                </Col>
              </Row>
            )}

            {event.ip_address && (
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>IP Address:</strong>
                </Col>
                <Col sm={8}>
                  <code>{event.ip_address}</code>
                </Col>
              </Row>
            )}

            {event.user_agent && (
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>User Agent:</strong>
                </Col>
                <Col sm={8}>
                  <small className="text-dark font-monospace">
                    {event.user_agent}
                  </small>
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>

        {event.metadata && (
          <Card className="mt-3">
            <CardHeader>
              <h6 className="mb-0">Additional Information</h6>
            </CardHeader>
            <CardBody>
              {formatMetadata(event.metadata)}
              
              <details className="mt-3">
                <summary className="text-dark" style={{ cursor: 'pointer' }}>
                  <small>▼ View Raw Metadata</small>
                </summary>
                <pre style={{ 
                  fontSize: '0.8rem',
                  backgroundColor: '#e9ecef',
                  border: '1px solid #ced4da',
                  color: '#212529',
                  padding: '0.5rem',
                  marginTop: '0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {JSON.stringify(event.metadata, null, 2)}
                </pre>
              </details>
            </CardBody>
          </Card>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EventDetailsModal;
