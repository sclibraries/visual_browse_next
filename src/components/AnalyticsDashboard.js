import { Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSearch, faUsers, faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import CollectionDetailsModal from './CollectionDetailsModal';

const AnalyticsCard = ({ title, value, icon, color = 'primary', subtitle = '' }) => (
  <Card className="h-100">
    <CardBody>
      <Row className="align-items-center">
        <Col className="col-auto">
          <div className={`bg-${color} text-white p-3 rounded`} style={{ fontSize: '1.5rem' }}>
            <FontAwesomeIcon icon={icon} />
          </div>
        </Col>
        <Col>
          <h6 className="text-uppercase text-dark mb-1" style={{ fontSize: '0.85rem', fontWeight: '600' }}>{title}</h6>
          <span className="h2 font-weight-bold mb-0">{value}</span>
          {subtitle && <p className="text-dark mb-0" style={{ fontSize: '0.9rem' }}>{subtitle}</p>}
        </Col>
      </Row>
    </CardBody>
  </Card>
);

const EventTypeChart = ({ eventCounts = [] }) => {
  const getEventTypeLabel = (eventType) => {
    const labels = {
      'view_collection': 'Collection Views',
      'view_record': 'Record Views',
      'search_collection': 'Collection Searches',
      'load_more_records': 'Load More Actions',
      'media_interaction': 'Media Interactions',
      'follow_collection': 'Follows',
      'share_collection': 'Shares'
    };
    return labels[eventType] || eventType;
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'view_collection': '#007bff',
      'view_record': '#28a745',
      'search_collection': '#ffc107',
      'load_more_records': '#6c757d',
      'media_interaction': '#fd7e14',
      'follow_collection': '#e83e8c',
      'share_collection': '#17a2b8'
    };
    return colors[eventType] || '#6c757d';
  };

  const totalEvents = eventCounts.reduce((sum, event) => sum + event.count, 0);

  return (
    <Card>
      <CardHeader>
        <h5 className="mb-0">Activity Breakdown</h5>
      </CardHeader>
      <CardBody>
        {eventCounts.length === 0 ? (
          <div className="text-center text-dark py-4">
            <FontAwesomeIcon icon={faMousePointer} size="3x" className="mb-3" />
            <p>No activity data available</p>
          </div>
        ) : (
          <div>
            {eventCounts.map((event, index) => {
              const percentage = totalEvents > 0 ? (event.count / totalEvents * 100).toFixed(1) : 0;
              return (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span>{getEventTypeLabel(event.event_type)}</span>
                    <span className="font-weight-bold">
                      {event.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getEventTypeColor(event.event_type)
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const TopCollectionsChart = ({ topCollections = [] }) => {
  return (
    <Card>
      <CardHeader>
        <h5 className="mb-0">Most Active Collections</h5>
      </CardHeader>
      <CardBody>
        {topCollections.length === 0 ? (
          <div className="text-center text-dark py-4">
            <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
            <p>No collection activity data available</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th className="text-right">Activity</th>
                </tr>
              </thead>
              <tbody>
                {topCollections.slice(0, 10).map((collection, index) => (
                  <tr key={collection.collection_id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="badge badge-primary me-2">{index + 1}</span>
                        <span>{collection.collection_name}</span>
                      </div>
                    </td>
                    <td className="text-right font-weight-bold">
                      {collection.activity_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const DailyActivityChart = ({ dailyActivity = [] }) => {
  const maxActivity = Math.max(...dailyActivity.map(day => day.count), 1);
  
  return (
    <Card>
      <CardHeader>
        <h5 className="mb-0">Daily Activity (Last 30 Days)</h5>
      </CardHeader>
      <CardBody>
        {dailyActivity.length === 0 ? (
          <div className="text-center text-dark py-4">
            <FontAwesomeIcon icon={faMousePointer} size="3x" className="mb-3" />
            <p>No daily activity data available</p>
          </div>
        ) : (
          <div style={{ height: '200px', overflowX: 'auto' }}>
            <div className="d-flex align-items-end" style={{ height: '180px', minWidth: '600px' }}>
              {dailyActivity.map((day, index) => {
                const height = (day.count / maxActivity) * 150;
                return (
                  <div 
                    key={index} 
                    className="d-flex flex-column align-items-center mx-1"
                    style={{ minWidth: '20px' }}
                  >
                    <div
                      className="bg-primary"
                      style={{
                        width: '16px',
                        height: `${height}px`,
                        minHeight: '2px'
                      }}
                      title={`${day.date}: ${day.count} events`}
                    ></div>
                    <small className="text-dark mt-1" style={{ 
                      fontSize: '0.7rem', 
                      writingMode: 'vertical-rl', 
                      textOrientation: 'mixed',
                      fontWeight: '600'
                    }}>
                      {new Date(day.date).getDate()}
                    </small>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const AnalyticsDashboard = ({ analyticsData, loading, error }) => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openCollectionDetails = (collection) => {
    setSelectedCollection(collection);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCollection(null);
  };
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h6>Error loading analytics</h6>
        <p className="mb-0">{error}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="alert alert-info">
        <p className="mb-0">No analytics data available.</p>
      </div>
    );
  }

  const { 
    collections = [], 
    eventCounts = [], 
    topCollections = [], 
    dailyActivity = [], 
    summary = {} 
  } = analyticsData;
  
  // Calculate summary metrics from the new response format
  const totalViews = eventCounts.find(e => e.event_type === 'view_collection')?.count || 0;
  const totalRecordViews = eventCounts.find(e => e.event_type === 'view_record')?.count || 0;
  const totalActivity = summary.totalEvents || eventCounts.reduce((sum, event) => sum + event.count, 0);
  const totalCollections = summary.totalCollections || collections.length;

  return (
    <div>
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <AnalyticsCard
            title="Total Collections"
            value={totalCollections.toLocaleString()}
            icon={faUsers}
            color="info"
            subtitle={summary.dateRange ? `${summary.dateRange.start_date} to ${summary.dateRange.end_date}` : "All time"}
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <AnalyticsCard
            title="Collection Views"
            value={totalViews.toLocaleString()}
            icon={faEye}
            color="primary"
            subtitle="Page visits"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <AnalyticsCard
            title="Record Views"
            value={totalRecordViews.toLocaleString()}
            icon={faMousePointer}
            color="success"
            subtitle="Individual records"
          />
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <AnalyticsCard
            title="Total Activity"
            value={totalActivity.toLocaleString()}
            icon={faSearch}
            color="warning"
            subtitle="All events"
          />
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row>
        <Col lg={6} className="mb-4">
          <EventTypeChart eventCounts={eventCounts} />
        </Col>
        <Col lg={6} className="mb-4">
          <TopCollectionsChart topCollections={topCollections} />
        </Col>
      </Row>

      {/* Collections List */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h5 className="mb-0">Your Collections</h5>
            </CardHeader>
            <CardBody>
              {collections.length === 0 ? (
                <div className="text-center text-dark py-4">
                  <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3" />
                  <p>No collections found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Collection Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th className="text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections.map((collection) => (
                        <tr key={collection.collection_id}>
                          <td>
                            <button 
                              className="btn btn-link p-0 text-left"
                              style={{ 
                                color: '#007bff',
                                textDecoration: 'none',
                                border: 'none',
                                background: 'none',
                                fontWeight: 'bold'
                              }}
                              onClick={() => openCollectionDetails(collection)}
                              title="Click to view detailed analytics"
                            >
                              {collection.name}
                            </button>
                          </td>
                          <td>
                            <span className="text-dark">
                              {collection.description || 'No description'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${collection.public === 'Private' ? 'badge-secondary' : 'badge-success'}`} style={{
                              backgroundColor: collection.public === 'Private' ? '#6c757d' : '#28a745',
                              color: 'white',
                              padding: '0.25em 0.6em',
                              fontSize: '0.75em',
                              fontWeight: '700',
                              lineHeight: '1',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              verticalAlign: 'baseline',
                              borderRadius: '0.25rem'
                            }}>
                              {collection.public}
                            </span>
                          </td>
                          <td>
                            <small className="text-dark">
                              {new Date(collection.timestamp).toLocaleDateString()}
                            </small>
                          </td>
                          <td className="text-right">
                            <span className="font-weight-bold">{collection.views}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <DailyActivityChart dailyActivity={dailyActivity} />
        </Col>
      </Row>

      {/* Collection Details Modal */}
      <CollectionDetailsModal 
        isOpen={modalOpen}
        toggle={closeModal}
        collection={selectedCollection}
      />
    </div>
  );
};

export default AnalyticsDashboard;
export { AnalyticsCard, EventTypeChart, TopCollectionsChart, DailyActivityChart };
