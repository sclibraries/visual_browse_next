import { useState, useEffect, useCallback } from 'react';
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
  Table,
  Badge,
  Spinner,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faMousePointer, 
  faSearch, 
  faUser,
  faCalendar,
  faGlobe,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { useStore } from '../store/store';
import EventDetailsModal from './EventDetailsModal';

const CollectionDetailsModal = ({ isOpen, toggle, collection }) => {
  const { baseUrl } = useStore((state) => ({
    baseUrl: state.baseUrl
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const fetchCollectionDetails = useCallback(async () => {
    if (!collection?.collection_id) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/tracking_events/analytics/collection/${collection.collection_id}?include_events=true&limit=100`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch collection details: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalytics(data);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching collection details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, collection?.collection_id]);

  useEffect(() => {
    if (isOpen && collection?.collection_id) {
      fetchCollectionDetails();
    }
  }, [isOpen, collection?.collection_id, fetchCollectionDetails]);

  const getEventTypeIcon = (eventType) => {
    const icons = {
      'view_collection': faEye,
      'view_record': faMousePointer,
      'search_collection': faSearch,
      'load_more_records': faGlobe,
      'media_interaction': faMousePointer
    };
    return icons[eventType] || faGlobe;
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

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const closeEventModal = () => {
    setEventModalOpen(false);
    setSelectedEvent(null);
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      'view_collection': 'Collection Views',
      'view_record': 'Record Views',
      'search_collection': 'Collection Searches',
      'load_more_records': 'Load More Actions',
      'media_interaction': 'Media Interactions'
    };
    return labels[eventType] || eventType;
  };

  const exportEvents = () => {
    if (!events || events.length === 0) return;

    const headers = ['Date', 'Time', 'Event Type', 'Record ID', 'Search Query', 'IP Address', 'User Agent', 'Metadata'];
    const rows = events.map(event => [
      new Date(event.created_at).toLocaleDateString(),
      new Date(event.created_at).toLocaleTimeString(),
      event.event_type,
      event.record_id || '',
      event.search_query || '',
      event.ip_address || '',
      event.user_agent || '',
      event.metadata ? JSON.stringify(event.metadata) : ''
    ]);

    const csvContent = [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `collection-${collection.collection_id}-events.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!collection) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>
        <div>
          <h4 className="mb-1">{collection.name}</h4>
          <small className="text-dark">Collection ID: {collection.collection_id}</small>
        </div>
      </ModalHeader>
      <ModalBody>
        {loading && (
          <div className="text-center py-4">
            <Spinner color="primary" />
            <p className="mt-2">Loading collection details...</p>
          </div>
        )}

        {error && (
          <Alert color="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {analytics && (
          <>
            {/* Collection Info */}
            <Card className="mb-4">
              <CardHeader>
                <h6 className="mb-0">Collection Information</h6>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {analytics.collection_name}</p>
                    <p><strong>Description:</strong> {analytics.collection_description || 'No description'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Status:</strong> <Badge color={collection.public === 'Private' ? 'secondary' : 'success'}>{collection.public}</Badge></p>
                    <p><strong>Created:</strong> {new Date(collection.timestamp).toLocaleDateString()}</p>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Tabs */}
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={activeTab === 'analytics' ? 'active' : ''}
                  onClick={() => setActiveTab('analytics')}
                  style={{ cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faEye} className="me-2" />
                  Analytics Summary
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === 'events' ? 'active' : ''}
                  onClick={() => setActiveTab('events')}
                  style={{ cursor: 'pointer' }}
                >
                  <FontAwesomeIcon icon={faCalendar} className="me-2" />
                  Recent Events ({events.length})
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent activeTab={activeTab}>
              {/* Analytics Tab */}
              <TabPane tabId="analytics">
                <Card className="mt-3">
                  <CardHeader>
                    <h6 className="mb-0">Event Type Breakdown</h6>
                  </CardHeader>
                  <CardBody>
                    {analytics.analytics && analytics.analytics.length > 0 ? (
                      <Row>
                        {analytics.analytics.map((item, index) => (
                          <Col md={6} lg={4} key={index} className="mb-3">
                            <Card className="h-100 border-left-primary">
                              <CardBody>
                                <div className="d-flex align-items-center">
                                  <div className={`bg-${getEventTypeColor(item.event_type)} text-white p-2 rounded me-3`}>
                                    <FontAwesomeIcon icon={getEventTypeIcon(item.event_type)} />
                                  </div>
                                  <div>
                                    <h6 className="mb-0">{getEventTypeLabel(item.event_type)}</h6>
                                    <div className="text-dark small">
                                      <strong>{item.count}</strong> events
                                      {item.unique_users > 0 && (
                                        <>
                                          <br />
                                          <FontAwesomeIcon icon={faUser} className="me-1" />
                                          {item.unique_users} unique users
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <div className="text-center text-dark py-4">
                        <p>No analytics data available for this collection.</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </TabPane>

              {/* Events Tab */}
              <TabPane tabId="events">
                <Card className="mt-3">
                  <CardHeader className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Recent Events</h6>
                    {events.length > 0 && (
                      <Button color="outline-primary" size="sm" onClick={exportEvents}>
                        <FontAwesomeIcon icon={faDownload} className="me-1" />
                        Export CSV
                      </Button>
                    )}
                  </CardHeader>
                  <CardBody>
                    {events.length > 0 ? (
                      <div className="table-responsive">
                        <Table striped hover size="sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Event Type</th>
                              <th>Record ID</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {events.map((event) => (
                              <tr 
                                key={event.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => openEventDetails(event)}
                                title="Click to view event details"
                              >
                                <td>
                                  <small>{new Date(event.created_at).toLocaleDateString()}</small>
                                  <br />
                                  <small className="text-dark">{new Date(event.created_at).toLocaleTimeString()}</small>
                                </td>
                                <td>
                                  <Badge color={getEventTypeColor(event.event_type)}>
                                    {getEventTypeLabel(event.event_type)}
                                  </Badge>
                                </td>
                                <td>
                                  <small>{event.record_id || '-'}</small>
                                </td>
                                <td>
                                  <Button 
                                    color="outline-primary" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEventDetails(event);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center text-dark py-4">
                        <p>No events recorded for this collection yet.</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </TabPane>
            </TabContent>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>

      {/* Event Details Modal */}
      <EventDetailsModal 
        isOpen={eventModalOpen}
        toggle={closeEventModal}
        event={selectedEvent}
      />
    </Modal>
  );
};

export default CollectionDetailsModal;
