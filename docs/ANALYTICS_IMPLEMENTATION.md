# Analytics and Tracking Implementation

This document outlines the comprehensive analytics and tracking system implemented for the Visual Browse application.

## Overview

The tracking system captures user interactions with collections and provides detailed analytics for collection owners. All tracking data is sent to the backend at `https://libtools2.smith.edu:4000/tracking_events`.

## Components Implemented

### 1. Tracking Hook (`src/hooks/useTracking.js`)

A custom hook that provides tracking functionality throughout the application.

**Main Functions:**
- `trackEvent(eventData)` - Generic event tracking
- `trackCollectionView(collectionId, metadata)` - Track collection views
- `trackRecordView(collectionId, recordId, metadata)` - Track record views within collections
- `trackRecordInteraction(collectionId, recordId, recordData, interactionType)` - Track detailed record interactions
- `trackCollectionSearch(collectionId, searchQuery, metadata)` - Track searches within collections
- `trackLoadMore(collectionId, currentCount, metadata)` - Track "load more" actions
- `trackMediaInteraction(collectionId, recordId, mediaType, metadata)` - Track media/image interactions

**Usage Example:**
```javascript
const { trackCollectionView, trackRecordView, trackMediaInteraction } = useTracking();

// Track a collection view with detailed info
await trackCollectionView(123, { 
  source: 'direct_link',
  collection_name: 'My Collection',
  record_count: 45
});

// Track a record view with full record details
await trackRecordView(123, 'record_456', {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  publication_year: 1925,
  material_type: 'Book',
  has_image: true
});

// Track media interaction
await trackMediaInteraction(123, 'record_456', 'cover_image', {
  has_actual_image: true,
  title: 'The Great Gatsby'
});
```

### 2. Analytics Hook (`src/hooks/useAnalytics.js`)

Provides functions to fetch and manage analytics data from the backend.

**Main Functions:**
- `fetchAnalyticsSummary(filters)` - Get overall analytics summary
- `fetchCollectionAnalytics(collectionId, filters)` - Get collection-specific analytics
- `fetchTrackingEvents(filters)` - Get raw tracking events with pagination

**Usage Example:**
```javascript
const { fetchAnalyticsSummary, loading, error } = useAnalytics();

const data = await fetchAnalyticsSummary({
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  collection_id: 123
});
```

### 3. Analytics Dashboard (`src/components/AnalyticsDashboard.js`)

A comprehensive dashboard component that displays analytics data with charts and metrics.

**Features:**
- Summary cards for key metrics (views, searches, users)
- Event type breakdown chart
- Top collections by activity
- Daily activity chart for the past 30 days

### 4. Collection Analytics Card (`src/components/CollectionAnalyticsCard.js`)

A compact component for displaying analytics specific to a single collection.

**Features:**
- Collection views, record views, searches, unique users
- Event breakdown badges
- Loading and error states

### 5. Analytics Page (`src/pages/account/analytics.js`)

A full analytics dashboard page accessible from the account sidebar.

**Features:**
- Date range filtering
- Collection and event type filtering
- Data export to CSV
- Real-time refresh functionality

## Tracking Events

The following events are automatically tracked with detailed metadata:

### Collection View (`view_collection`)
- **Triggered:** When a user visits a collection page
- **Location:** `/src/pages/collections/records/[collection_id].js`
- **Data Captured:**
  - Collection ID, name, description
  - Author/creator user ID
  - Current record count
  - Source (direct link, etc.)
  - Whether modal parameters were present
  
**Example metadata:**
```json
{
  "source": "direct_link",
  "has_modal_params": false,
  "collection_name": "Best Books of 2024",
  "collection_description": "My curated list of top books",
  "author_user_id": 123,
  "record_count": 45
}
```

### Record View (`view_record`)
- **Triggered:** When a user clicks to view record details
- **Location:** `/src/components/PublicCollectionsRecordDisplay.js`
- **Data Captured:**
  - Complete record information (title, author, year)
  - Material type and format
  - Image availability
  - Open access status
  - Source context
  
**Example metadata:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publication_year": 1925,
  "material_type": "Book",
  "source": "collection_browse",
  "has_image": true,
  "is_open_access": false,
  "dbid": "edb"
}
```

### Media Interaction (`media_interaction`)
- **Triggered:** When a user clicks on record images or media elements
- **Location:** `/src/components/PublicCollectionsRecordDisplay.js`
- **Data Captured:**
  - Media type (cover_image, placeholder)
  - Record title and material type
  - Whether actual image or placeholder was clicked
  
**Example metadata:**
```json
{
  "media_type": "cover_image",
  "title": "The Great Gatsby",
  "has_actual_image": true,
  "material_type": "Book",
  "source": "collection_browse"
}
```

### Load More (`load_more_records`)
- **Triggered:** When a user clicks "Load More" to see additional records
- **Location:** `/src/pages/collections/records/[collection_id].js`
- **Data Captured:**
  - Collection context and pagination info
  - Current record count before loading
  - Page size and current page number
  
**Example metadata:**
```json
{
  "current_page": 2,
  "collection_name": "Best Books of 2024",
  "total_records_before_load": 50,
  "limit": 50
}
```

## Implementation Details

### 1. Updated Collection Page
File: `/src/pages/collections/records/[collection_id].js`

**Changes:**
- Added `useTracking` hook
- Track collection view on component mount
- Track load more actions when pagination is used

### 2. Updated Record Display Component
File: `/src/components/PublicCollectionsRecordDisplay.js`

**Changes:**
- Added `useTracking` hook
- Track record view when user opens record details

### 3. Updated Account Sidebar
File: `/src/components/AccountSidebar.js`

**Changes:**
- Added "Analytics" navigation item with chart icon

### 4. Updated Collections List
File: `/src/pages/account/collections/index.js`

**Changes:**
- Display view counts for each collection
- Fetch analytics data for all user collections

### 5. Updated Collection Detail Page
File: `/src/pages/account/collections/[collectionId].js`

**Changes:**
- Added collection analytics card showing performance metrics

### 6. Updated Store
File: `/src/store/account.js`

**Changes:**
- Added analytics state management
- Functions to set and clear analytics data

## Backend Events Supported

The tracking system supports all event types defined in your backend:

- `view_collection` - Collection page views
- `view_record` - Record detail views
- `search_collection` - Searches within collections
- `load_more_records` - Pagination actions
- `follow_collection` - Collection follows (ready for implementation)
- `share_collection` - Collection shares (ready for implementation)

## Data Structure

### Event Data Format
```javascript
{
  user_id: 123,              // User ID (null for anonymous)
  event_type: 'view_collection',
  collection_id: 456,
  record_id: 'abc123',       // Optional
  search_query: 'search term', // Optional
  metadata: {                // Optional additional data
    source: 'direct_link',
    material_type: 'book'
  }
}
```

### Analytics Response Format
```javascript
{
  eventCounts: [
    { event_type: 'view_collection', count: 150 },
    { event_type: 'view_record', count: 89 }
  ],
  topCollections: [
    {
      collection_id: 123,
      collection_name: 'My Collection',
      activity_count: 245
    }
  ],
  dailyActivity: [
    { date: '2024-01-01', count: 15 },
    { date: '2024-01-02', count: 23 }
  ]
}
```

## Privacy and Performance

### Privacy Features
- Anonymous user tracking (user_id is null when not logged in)
- IP addresses and user agents are captured server-side for analytics
- No personally identifiable information stored in metadata

### Performance Optimizations
- Tracking failures don't interrupt user experience
- Analytics data is fetched asynchronously
- Components show loading states during data fetch

## Testing

A test page has been created at `/test-tracking` to verify tracking functionality:

1. Visit `http://localhost:3000/test-tracking`
2. Use the buttons to test different tracking functions
3. Check browser network tab to see tracking requests
4. Verify data appears in backend analytics

## Usage Guide

### For Users
1. **View Analytics:** Navigate to Account → Analytics to see overall statistics
2. **Collection Analytics:** View individual collection performance in collection detail pages
3. **Export Data:** Use the export button in analytics dashboard to download CSV reports

### For Developers
1. **Add New Tracking:** Use the `useTracking` hook and call appropriate tracking functions
2. **Display Analytics:** Use `useAnalytics` hook to fetch data and display with provided components
3. **Custom Events:** Add new event types by extending the tracking hook

## File Structure

```
src/
├── hooks/
│   ├── useTracking.js          # Main tracking functionality
│   └── useAnalytics.js         # Analytics data fetching
├── components/
│   ├── AnalyticsDashboard.js   # Full analytics dashboard
│   └── CollectionAnalyticsCard.js # Collection-specific analytics
├── pages/
│   ├── account/
│   │   └── analytics.js        # Analytics page
│   └── test-tracking.js        # Test page
└── store/
    └── account.js              # Updated with analytics state
```

## Next Steps

1. Test the implementation with real data
2. Add more specific tracking events as needed (favorites, shares, etc.)
3. Consider adding real-time analytics updates
4. Implement more sophisticated analytics visualizations
5. Add analytics for admin users to see system-wide statistics
