import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Row, Col, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSearch, faUsers, faMousePointer, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAnalytics } from '../hooks/useAnalytics';

const CollectionAnalyticsCard = ({ collectionId, collectionName }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { fetchCollectionAnalytics } = useAnalytics();

  useEffect(() => {
    if (collectionId) {
      loadAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchCollectionAnalytics(collectionId);
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-4">
          <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
          Loading analytics...
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-4 text-muted">
          <p>Unable to load analytics data</p>
          <small>{error}</small>
        </CardBody>
      </Card>
    );
  }

  if (!analytics || !analytics.analytics || analytics.analytics.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-4 text-muted">
          <FontAwesomeIcon icon={faMousePointer} size="2x" className="mb-3" />
          <p>No activity data available for this collection yet.</p>
        </CardBody>
      </Card>
    );
  }

  const { analytics: eventData } = analytics;

  // Calculate metrics
  const views = eventData.find(e => e.event_type === 'view_collection')?.count || 0;
  const recordViews = eventData.find(e => e.event_type === 'view_record')?.count || 0;
  const searches = eventData.find(e => e.event_type === 'search_collection')?.count || 0;
  const loadMore = eventData.find(e => e.event_type === 'load_more_records')?.count || 0;
  
  const uniqueUsers = eventData.reduce((total, event) => {
    return total + (event.unique_users || 0);
  }, 0);

  const totalActivity = eventData.reduce((total, event) => total + event.count, 0);

  return (
    <Card>
      <CardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Collection Activity</h6>
          {collectionName && <small className="text-muted">{collectionName}</small>}
        </div>
      </CardHeader>
      <CardBody>
        <Row>
          <Col sm={6} md={3} className="mb-3">
            <div className="text-center">
              <div className="text-primary mb-1">
                <FontAwesomeIcon icon={faEye} size="lg" />
              </div>
              <div className="h4 mb-0 font-weight-bold">{views.toLocaleString()}</div>
              <small className="text-muted">Collection Views</small>
            </div>
          </Col>
          <Col sm={6} md={3} className="mb-3">
            <div className="text-center">
              <div className="text-success mb-1">
                <FontAwesomeIcon icon={faMousePointer} size="lg" />
              </div>
              <div className="h4 mb-0 font-weight-bold">{recordViews.toLocaleString()}</div>
              <small className="text-muted">Record Views</small>
            </div>
          </Col>
          <Col sm={6} md={3} className="mb-3">
            <div className="text-center">
              <div className="text-warning mb-1">
                <FontAwesomeIcon icon={faSearch} size="lg" />
              </div>
              <div className="h4 mb-0 font-weight-bold">{searches.toLocaleString()}</div>
              <small className="text-muted">Searches</small>
            </div>
          </Col>
          <Col sm={6} md={3} className="mb-3">
            <div className="text-center">
              <div className="text-info mb-1">
                <FontAwesomeIcon icon={faUsers} size="lg" />
              </div>
              <div className="h4 mb-0 font-weight-bold">{uniqueUsers.toLocaleString()}</div>
              <small className="text-muted">Unique Users</small>
            </div>
          </Col>
        </Row>

        {/* Additional metrics */}
        <div className="border-top pt-3 mt-3">
          <Row>
            <Col>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Total Activity:</span>
                <strong>{totalActivity.toLocaleString()}</strong>
              </div>
            </Col>
            {loadMore > 0 && (
              <Col>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Load More Actions:</span>
                  <strong>{loadMore.toLocaleString()}</strong>
                </div>
              </Col>
            )}
          </Row>
        </div>

        {/* Event breakdown */}
        <div className="border-top pt-3 mt-3">
          <small className="text-muted mb-2 d-block">Activity Breakdown:</small>
          <div className="d-flex flex-wrap gap-2">
            {eventData.map((event, index) => {
              const eventLabels = {
                'view_collection': 'Views',
                'view_record': 'Record Views',
                'search_collection': 'Searches',
                'load_more_records': 'Load More',
                'follow_collection': 'Follows',
                'share_collection': 'Shares'
              };
              
              const eventColors = {
                'view_collection': 'primary',
                'view_record': 'success',
                'search_collection': 'warning',
                'load_more_records': 'secondary',
                'follow_collection': 'danger',
                'share_collection': 'info'
              };

              return (
                <Badge 
                  key={index}
                  color={eventColors[event.event_type] || 'secondary'}
                  title={`${event.count} ${eventLabels[event.event_type] || event.event_type} by ${event.unique_users} unique users`}
                >
                  {eventLabels[event.event_type] || event.event_type}: {event.count}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CollectionAnalyticsCard;
