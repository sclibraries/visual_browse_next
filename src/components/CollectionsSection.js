import CollectionCard from './CollectionCard';

const CollectionsSection = ({ collections, collectionHits, query }) => {

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className="collections-section mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#2d3748' }}>
            📚 Related Collections
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: 0, marginTop: '4px' }}>
            {collectionHits ? `${collectionHits} collections` : `${collections.length} collections`} related to &ldquo;{query}&rdquo;
          </p>
        </div>
        
        {collectionHits > collections.length && (
          <a 
            href={`/collections/search?q=${encodeURIComponent(query)}`}
            style={{
              fontSize: '0.85rem',
              color: '#7c3aed',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            View all {collectionHits} →
          </a>
        )}
      </div>
      
      <div className="collections-grid">
        {collections.map((collection, index) => (
          <CollectionCard 
            key={collection.collection_id || index}
            collection={collection} 
          />
        ))}
      </div>
      
      {/* Divider */}
      <div style={{
        height: '1px',
        backgroundColor: '#e9ecef',
        margin: '1.5rem 0'
      }} />
    </div>
  );
};

export default CollectionsSection;