# Enhanced Tracking - Record Detail Capture

## What Was Enhanced

The tracking system now captures detailed information about the records users click on, providing much richer analytics data.

## Key Improvements

### 1. **Detailed Record Information Capture**
When a user clicks on a record, we now track:
- **Title** - Full record title
- **Author** - Record author/creator
- **Publication Year** - When the item was published
- **Material Type** - Book, Video, Article, etc.
- **Image Availability** - Whether the record has a cover image
- **Open Access Status** - If the item is freely accessible
- **Database ID** - Source database identifier

### 2. **Enhanced Collection Context**
Collection views now include:
- **Collection Name** - Human-readable collection title
- **Collection Description** - Collection description text
- **Author User ID** - Who created the collection
- **Record Count** - How many items are in the collection

### 3. **Media Interaction Tracking** (New)
Separate tracking for when users interact with images:
- **Media Type** - cover_image, placeholder, etc.
- **Image Availability** - Whether actual image or placeholder
- **Context** - What record the image belongs to

### 4. **Improved Load More Tracking**
Load more actions now capture:
- **Collection Context** - Name and details of collection
- **Pagination State** - Current page, records loaded so far
- **Load Size** - How many records per page

## Backend Data Examples

### Before (Basic)
```json
{
  "user_id": 123,
  "event_type": "view_record",
  "collection_id": 45,
  "record_id": "abc123",
  "metadata": {
    "source": "collection_browse"
  }
}
```

### After (Enhanced)
```json
{
  "user_id": 123,
  "event_type": "view_record", 
  "collection_id": 45,
  "record_id": "abc123",
  "metadata": {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald", 
    "publication_year": 1925,
    "material_type": "Book",
    "source": "collection_browse",
    "has_image": true,
    "is_open_access": false,
    "dbid": "edb"
  }
}
```

## Analytics Benefits

### For Collection Owners
- See **which specific items** are most popular
- Understand **what types of materials** users prefer
- Track **author popularity** within collections
- Monitor **image effectiveness** (items with images vs without)

### For Administrators
- Identify **popular content types** across the system
- Track **open access** vs **subscription content** usage
- Monitor **image upload** effectiveness
- Analyze **year/era preferences** in user behavior

### For Researchers
- Export detailed **CSV data** with full record information
- Analyze **usage patterns** by material type, author, year
- Study **discovery patterns** (how users find content)
- Track **engagement metrics** at the item level

## New Event Types

### `media_interaction`
Tracks when users click on images or media elements:
```json
{
  "event_type": "media_interaction",
  "collection_id": 45,
  "record_id": "abc123",
  "metadata": {
    "media_type": "cover_image",
    "title": "The Great Gatsby",
    "has_actual_image": true,
    "material_type": "Book"
  }
}
```

## Testing

Visit `/test-tracking` to test the enhanced functionality:
1. **Enhanced Collection View** - Tests detailed collection metadata
2. **Enhanced Record View** - Tests detailed record metadata  
3. **Media Interaction** - Tests image click tracking
4. **Basic Event** - Tests generic event tracking

## Files Modified

- `src/hooks/useTracking.js` - Added detailed tracking functions
- `src/components/PublicCollectionsRecordDisplay.js` - Enhanced record click tracking
- `src/pages/collections/records/[collection_id].js` - Enhanced collection view tracking
- `src/pages/test-tracking.js` - Added comprehensive test cases
- `ANALYTICS_IMPLEMENTATION.md` - Updated documentation

The system now provides comprehensive insight into not just *that* users are interacting with content, but *what specific content* they're engaging with and *how* they're discovering it.
