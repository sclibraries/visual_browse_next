import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CollectionCard = ({ collection }) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state when collection changes
  useEffect(() => {
    setImageError(false);
  }, [collection.coverImage]);

  const handleImageError = () => {
    setImageError(true);
  };



  const getMatchTypeBadge = (matchType) => {
    const badges = {
      'title': { 
        color: '#0d6efd', 
        text: 'Title Match',
        icon: '📝',
        explanation: 'Found in collection title'
      },
      'description': { 
        color: '#6c757d', 
        text: 'Description Match',
        icon: '📄',
        explanation: 'Found in collection description'
      },
      'subject': { 
        color: '#20c997', 
        text: 'Topic Match',
        icon: '🏷️',
        explanation: 'Matches collection topics'
      },
      'exact': { 
        color: '#198754', 
        text: 'Exact Match',
        icon: '🎯',
        explanation: 'Direct match found'
      }
    };
    return badges[matchType] || { 
      color: '#6f42c1', 
      text: 'Related',
      icon: '🔗',
      explanation: 'Related to your search'
    };
  };

  const badgeInfo = getMatchTypeBadge(collection.matchType);

  return (
    <div className="collection-item">
      <div className="image-container-collection">
        {!collection.coverImage || imageError ? (
          <>
            <div className="collection-image-fallback">
              <div className="fallback-icon">📚</div>
              <div className="fallback-text">Collection</div>
            </div>
            <div className="collection-description">
              {collection.description}
            </div>
          </>
        ) : (
          <>
            <Image 
              src={collection.coverImage} 
              alt={collection.name}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
              onError={handleImageError}
            />
            <div className="collection-description">{collection.description}</div>
          </>
        )}
      </div>
      <div className="collection-title">
        <h3>{collection.name}</h3>
        <div className="collection-links">
          <Link
            href={`/collections/records/${collection.collection_id}?name=${encodeURIComponent(collection.name)}`}
            className="card-link"
          >
            View Collection
          </Link>
        </div>
        {/* Match info and subjects */}
        <div className="collection-meta" style={{ marginTop: '0.75rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span 
              style={{
                fontSize: '0.75rem',
                backgroundColor: badgeInfo.color,
                color: 'white',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title={badgeInfo.explanation}
            >
              <span>{badgeInfo.icon}</span>
              {badgeInfo.text}
            </span>
          </div>
          
          {collection.subjects && collection.subjects.length > 0 && (
            <div className="subjects">
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '600', 
                color: '#495057',
                marginBottom: '0.5rem' 
              }}>
                Related Topics:
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.4rem',
                lineHeight: '1.3'
              }}>
                {collection.subjects.slice(0, 5).map((subject, index) => (
                  <span
                    key={subject.subject_id || index} 
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#f0f4f8',
                      color: '#2d3748',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e0',
                      display: 'inline-block',
                      wordBreak: 'break-word',
                      lineHeight: '1.2',
                      fontWeight: '500'
                    }}
                  >
                    {subject.subject}
                  </span>
                ))}
                {collection.subjects.length > 5 && (
                  <details style={{ display: 'inline-block', margin: 0 }}>
                    <summary style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#e2e8f0',
                      color: '#4a5568',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e0',
                      cursor: 'pointer',
                      listStyle: 'none',
                      fontWeight: '500'
                    }}>
                      +{collection.subjects.length - 5} more topics
                    </summary>
                    <div style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem'
                    }}>
                      {collection.subjects.slice(5).map((subject, index) => (
                        <span
                          key={subject.subject_id || (index + 5)} 
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#f0f4f8',
                            color: '#2d3748',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e0',
                            display: 'inline-block',
                            wordBreak: 'break-word',
                            lineHeight: '1.2',
                            fontWeight: '500'
                          }}
                        >
                          {subject.subject}
                        </span>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;