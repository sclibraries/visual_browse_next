import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
import { useStore } from '../../store/store';
import { useAnalyticsData } from '../../hooks/useAnalytics';
import AdminLayout from '../../layouts/AdminLayout';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Row, 
  Col, 
  Button, 
  Input,
  Form,
  FormGroup,
  Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faFilter, faDownload } from '@fortawesome/free-solid-svg-icons';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { downloadCSV } from '../../lib/download';

const AnalyticsPage = () => {
  // const router = useRouter();
  const { baseUrl } = useStore((state) => ({ baseUrl: state.baseUrl }));
  const { ready, authorized } = useAuthRedirect();

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Analytics data
  const { 
    analyticsData, 
    loading, 
    error, 
    refreshAnalytics,
    lastFetched 
  } = useAnalyticsData(false);

  useEffect(() => {
    if (authorized) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  // keep a no-op to satisfy linter when dependencies change

  const loadAnalytics = () => {
    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    if (collectionFilter) filters.collection_id = collectionFilter;
    if (eventTypeFilter) filters.event_type = eventTypeFilter;
    
    refreshAnalytics(filters);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadAnalytics();
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setCollectionFilter('');
    setEventTypeFilter('');
    refreshAnalytics();
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      // First, get the user's collections to make sure we only export their data
      if (!analyticsData || !analyticsData.collections) {
        console.error('No analytics data available for export');
        return;
      }

      const userCollections = analyticsData.collections;
      const allEvents = [];

      // For each collection, fetch detailed events
      for (const collection of userCollections) {
        try {
          const filters = {};
          if (startDate) filters.start_date = startDate;
          if (endDate) filters.end_date = endDate;
          if (eventTypeFilter) filters.event_type = eventTypeFilter;

          const queryParams = new URLSearchParams(filters);
          const url = `${baseUrl}/tracking_events/analytics/collection/${collection.collection_id}?${queryParams}&include_events=true&limit=1000`;
          
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.events && data.events.length > 0) {
              // Add collection context to each event
              const eventsWithCollection = data.events.map(event => ({
                ...event,
                collection_name: collection.name,
                collection_description: collection.description,
                collection_status: collection.public
              }));
              allEvents.push(...eventsWithCollection);
            }
          }
        } catch (error) {
          console.error(`Error fetching events for collection ${collection.collection_id}:`, error);
        }
      }

      // Filter by collection if specified
      const filteredEvents = collectionFilter 
        ? allEvents.filter(event => event.collection_id == collectionFilter)
        : allEvents;

      // Sort events by date (newest first)
      filteredEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Create CSV content with detailed event information
      const headers = [
        'Date', 
        'Time', 
        'Event Type', 
        'Collection Name', 
        'Collection Status',
        'Record ID', 
        'Search Query', 
        'IP Address',
        'User Agent',
        'Metadata'
      ];

      const rows = filteredEvents.map(event => [
        new Date(event.created_at).toLocaleDateString(),
        new Date(event.created_at).toLocaleTimeString(),
        event.event_type,
        event.collection_name || '',
        event.collection_status || '',
        event.record_id || '',
        event.search_query || '',
        event.ip_address || '',
        event.user_agent || '',
        event.metadata ? JSON.stringify(event.metadata) : ''
      ]);

      const csvContent = [headers, ...rows].map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      const filename = `analytics-detailed-events-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);

      
    } catch (error) {
      console.error('Error exporting detailed data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // downloadCSV is imported from lib

  if (!ready) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Analytics Dashboard</h1>
          {lastFetched && (
            <small className="text-dark" style={{ fontWeight: '500' }}>
              Last updated: {lastFetched.toLocaleString()}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button 
            color="outline-secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filters
          </Button>
          <Button color="outline-primary" onClick={exportData} disabled={exportLoading}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            {exportLoading ? 'Exporting...' : 'Export'}
          </Button>
          <Button color="primary" onClick={loadAnalytics} disabled={loading}>
            <FontAwesomeIcon icon={faRefresh} className="me-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      {showFilters && (
        <Card className="mb-4">
          <CardHeader>
            <h6 className="mb-0">Filters</h6>
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleFilterSubmit}>
              <Row>
                <Col md={3}>
                  <FormGroup>
                    <Label for="startDate">Start Date</Label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="endDate">End Date</Label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="collectionFilter">Collection</Label>
                    <Input
                      type="select"
                      id="collectionFilter"
                      value={collectionFilter}
                      onChange={(e) => setCollectionFilter(e.target.value)}
                    >
                      <option value="">All Collections</option>
                      {analyticsData?.collections?.map((collection) => (
                        <option key={collection.collection_id} value={collection.collection_id}>
                          {collection.name} ({collection.views} views)
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label for="eventTypeFilter">Event Type</Label>
                    <Input
                      type="select"
                      id="eventTypeFilter"
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value)}
                    >
                      <option value="">All Events</option>
                      <option value="view_collection">Collection Views</option>
                      <option value="view_record">Record Views</option>
                      <option value="search_collection">Collection Searches</option>
                      <option value="load_more_records">Load More Actions</option>
                      <option value="media_interaction">Media Interactions</option>
                      <option value="follow_collection">Follows</option>
                      <option value="share_collection">Shares</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button type="submit" color="primary">
                  Apply Filters
                </Button>
                <Button type="button" color="outline-secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      )}

      {/* Analytics Dashboard */}
      <AnalyticsDashboard 
        analyticsData={analyticsData}
        loading={loading}
        error={error}
      />
    </AdminLayout>
  );
};

export default AnalyticsPage;
