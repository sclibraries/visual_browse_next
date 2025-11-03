// Test page for tracking functionality
import { useState } from 'react';
import { useTracking } from '../hooks/useTracking';
import { Button, Card, CardBody, Container, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';

const TrackingTestPage = () => {
  const { trackEvent, trackCollectionView, trackRecordView, trackMediaInteraction, trackLoadMore, trackCollectionSearch } = useTracking();
  const [lastResult, setLastResult] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [allResults, setAllResults] = useState([]);

  const addResult = (eventType, result) => {
    const newResult = {
      eventType,
      timestamp: new Date().toLocaleString(),
      success: !!result,
      data: result
    };
    setAllResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
    setLastResult(newResult);
  };

  const testBasicTracking = async () => {
    try {
      const result = await trackEvent({
        event_type: 'test_event',
        metadata: { test: true, timestamp: new Date().toISOString() }
      });
      addResult('test_event', result);
      console.log('Basic tracking result:', result);
      console.log('Expected event_type: test_event');
      toast.success('Basic tracking test successful! Check console for event_type.');
    } catch (error) {
      console.error('Error:', error);
      addResult('test_event', null);
      toast.error('Basic tracking test failed!');
    }
  };

  const testCollectionView = async () => {
    try {
      const result = await trackCollectionView(1, { 
        test: true,
        collection_name: 'Test Collection',
        source: 'test_page',
        record_count: 25
      });
      addResult('view_collection', result);
      console.log('Collection view tracking result:', result);
      console.log('Expected event_type: view_collection');
      toast.success('Collection view tracking test successful! Check console for event_type.');
    } catch (error) {
      console.error('Error:', error);
      addResult('view_collection', null);
      toast.error('Collection view tracking test failed!');
    }
  };

  const testRecordView = async () => {
    try {
      const result = await trackRecordView(1, 'test_record_123', { 
        test: true,
        title: 'Test Book Title',
        author: 'Test Author',
        publication_year: 2024,
        material_type: 'Book',
        source: 'test_page',
        has_image: true
      });
      addResult('view_record', result);
      console.log('Record view tracking result:', result);
      console.log('Expected event_type: view_record');
      toast.success('Record view tracking test successful! Check console for event_type.');
    } catch (error) {
      console.error('Error:', error);
      addResult('view_record', null);
      toast.error('Record view tracking test failed!');
    }
  };

  const testMediaInteraction = async () => {
    try {
      const result = await trackMediaInteraction(1, 'test_record_123', 'cover_image', {
        test: true,
        title: 'Test Book Title',
        has_actual_image: true,
        material_type: 'Book'
      });
      addResult('media_interaction', result);
      console.log('Media interaction tracking result:', result);
      console.log('Expected event_type: media_interaction');
      toast.success('Media interaction tracking test successful! Check console for event_type.');
    } catch (error) {
      console.error('Error:', error);
      addResult('media_interaction', null);
      toast.error('Media interaction tracking test failed!');
    }
  };

  const testLoadMore = async () => {
    try {
      const result = await trackLoadMore(1, 50, {
        test: true,
        current_page: 2,
        collection_name: 'Test Collection',
        limit: 50
      });
      addResult('load_more_records', result);
      console.log('Load more tracking result:', result);
      console.log('Expected event_type: load_more_records');
      toast.success('Load more tracking test successful! Check console for event_type.');
    } catch (error) {
      console.error('Error:', error);
      addResult('load_more_records', null);
      toast.error('Load more tracking test failed!');
    }
  };

  const testCollectionSearch = async () => {
    try {
      const result = await trackCollectionSearch(1, 'test search query', {
        test: true,
        collection_name: 'Test Collection',
        source: 'test_page'
      });
      addResult('search_collection', result);
      console.log('Collection search tracking result:', result);
      console.log('Expected event_type: search_collection');
      toast.success('Collection search tracking test successful! Check console for event_type.');
    } catch (error) {
      console.error('Error:', error);
      addResult('search_collection', null);
      toast.error('Collection search tracking test failed!');
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={8} className="mx-auto">
          <Card>
            <CardBody>
              <h2 className="mb-4">Detailed Tracking Test Page</h2>
              <p className="text-muted mb-4">
                Test the enhanced tracking system with detailed record and collection information.
              </p>
              
              <div className="d-grid gap-3">
                <Button color="primary" onClick={testBasicTracking}>
                  Test Basic Event Tracking
                </Button>
                
                <Button color="success" onClick={testCollectionView}>
                  Test Collection View Tracking (Enhanced)
                </Button>
                
                <Button color="info" onClick={testRecordView}>
                  Test Record View Tracking (Enhanced)
                </Button>

                <Button color="warning" onClick={testMediaInteraction}>
                  Test Media Interaction Tracking (New)
                </Button>
                
                <Button color="primary" onClick={testLoadMore}>
                  Test Load More Records
                </Button>
                
                <Button color="success" onClick={testCollectionSearch}>
                  Test Collection Search
                </Button>
              </div>

              {lastResult && (
                <div className="mt-4">
                  <h5>Last Result:</h5>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-4 pt-4 border-top">
                <h6>What&apos;s Being Tracked Now:</h6>
                <ul className="small text-muted">
                  <li><strong>Collection Views:</strong> Collection name, description, author, record count</li>
                  <li><strong>Record Views:</strong> Title, author, publication year, material type, image availability</li>
                  <li><strong>Media Interactions:</strong> Image clicks, media type, availability</li>
                  <li><strong>Load More:</strong> Current record count, pagination context</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TrackingTestPage;
