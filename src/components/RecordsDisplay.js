import RecordBadges from './RecordBadges';
import { Fragment, useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';
import { decode } from 'html-entities';
import {
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import RecordAvailability from './RecordAvailability';
import FullCast from './FullCast';
import RecommendationDisplay from './Recommendations';
import { useFavorite } from '../hooks/useFavorite';
import  useCollections  from '../hooks/useCollections';
import { useToggleFavorite } from '../hooks/useToggleFavorite';
import useCurrentCollections from '../hooks/useCurrentCollections';
import { useAddToCollection } from '../hooks/useAddToCollection';
import { useRemoveFromCollection } from '../hooks/useRemoveFromCollection';
import { getTitleString } from '../lib/functions';
import NewCollectionForm from './NewCollectionForm';
import CallNumberBrowse from './CallNumberBrowse';
import RecordCoverImage from './RecordCoverImage';
import { useRouter } from 'next/router';

// Import the custom hook and other necessary components
import { useRecordImage } from '../hooks/useRecordImage';
import ImageUploadModal from './ImageUploadModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const { isEbook } = require('../utils/ebook.cjs');

function RecordsDisplay() {
  const containerRef = useRef(null);
  const router = useRouter();

  const [
    recordData,
    an,
    dbid,
    recordImageOverride,
    loggedIn,
    currentCollections,
    collections,
    setQuery,
    setFieldCode,
    setSearchValue,
  ] = useStore(useShallow((state) => [
      state.recordData,
      state.an,
      state.dbid,
      state.recordImageOverride,
      state.loggedIn,
      state.currentCollections,
      state.collections,
      state.setQuery,
      state.setFieldCode,
      state.setSearchValue,
    ]));

  // Change from single open state to array of all accordion IDs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useFavorite(an);
  const [hasStreamingVideo, setHasStreamingVideo] = useState(false);
  const [hasEbook, setHasEbook] = useState(false);
  const [ebookURL, setEbookURL] = useState('');
  const [streamingURL, setStreamingURL] = useState('');
  useCollections();
  const { refreshCurrentCollections } = useCurrentCollections(an, dbid);
  const toggleFavorite = useToggleFavorite(an, dbid, isFavorite, setIsFavorite);
  const addToCollection = useAddToCollection(refreshCurrentCollections);
  const removeFromCollection = useRemoveFromCollection(refreshCurrentCollections);

  // State variables for the image upload modal
  const [imageUploadModalOpen, setImageUploadModalOpen] = useState(false);
  
  // State for abstract expansion
  const [isAbstractExpanded, setIsAbstractExpanded] = useState(false);
  
  // State for responsive design
  const [isMobile, setIsMobile] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState(2 / 3);
  
  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getFallbackAspectRatio = useCallback(() => {
    const type = String(recordData?.pubType || '').toLowerCase();
    if (
      type.includes('sound recording') ||
      type.includes('audio') ||
      type.includes('music') ||
      type.includes('compact disc') ||
      type.includes('cd')
    ) {
      return 1;
    }

    return 2 / 3;
  }, [recordData?.pubType]);

  const toggleImageUploadModal = () => {
    setImageUploadModalOpen(!imageUploadModalOpen);
  };

  const toggleAbstractExpansion = () => {
    setIsAbstractExpanded(!isAbstractExpanded);
  };

  const handleRemoveFromCollection = (collectionRecordsId) => {
    removeFromCollection(collectionRecordsId);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


  // Utility function to clean and format URLs
  const cleanUrl = (urlString) => {
    if (!urlString || typeof urlString !== 'string') return '';
    
    // Extract just the URL part before any spaces or notes
    const urlMatch = urlString.match(/^(https?:\/\/[^\s]+)/);
    return urlMatch ? urlMatch[1] : urlString.trim();
  };

  useEffect(() => {
    if (recordData?.urlItem) {
      const streamingURLFound = recordData.urlItem.find((url) =>
        url.includes('digitalcampus.swankmp.net')
      );
      setHasStreamingVideo(!!streamingURLFound);
      if (streamingURLFound) {
        setStreamingURL(cleanUrl(streamingURLFound));
      }
    }

    const ebook = isEbook(recordData);
    setHasEbook(ebook);
    setEbookURL(ebook && recordData?.urlItem?.length > 0 ? cleanUrl(recordData.urlItem[0]) : '');
  }, [recordData]);

  const titleStringDisplay = getTitleString(recordData);

  let imdb = '';
  if (recordData?.urlItem?.length > 0) {
    recordData.urlItem.forEach((urlItem) => {
      const cleanedUrl = cleanUrl(urlItem);
      if (cleanedUrl.includes('imdb')) {
        const list = cleanedUrl.match(/tt\d+/g);
        if (list && list.length > 0) {
          imdb = list[0];
        }
      }
    });
  }

  const handleClick = useCallback(
    (event) => {
      const target = event.target.closest('.itemData');
      if (target) {
        event.preventDefault();
        const fieldCode = target.getAttribute('data-fieldcode');
        const term = target.getAttribute('term');
        setQuery(term);
        setSearchValue(decodeURI(term));
        setFieldCode(fieldCode);

        // Determine the material type and set the routing path
        let routingPath = '/all';
        if (recordData.pubType === 'Book') {
          routingPath = '/books';
        } else if (recordData.pubType === 'Video Recording') {
          routingPath = '/movies';
        }

        // Perform the routing
        router.push(
          `${routingPath}?search=${encodeURIComponent(term)}&fieldcode=${encodeURIComponent(
            fieldCode
          )}`,
          undefined,
          {
            shallow: true,
          }
        );
      }
    },
    [recordData, router, setFieldCode, setQuery, setSearchValue]
  );

  // Add ref for each accordion section
  const castRef = useRef(null);
  const recommendationsRef = useRef(null);
  const shelfBrowseRef = useRef(null);
  const fullRecordRef = useRef(null);
  const topRef = useRef(null); // Add this missing ref declaration
  
  // Function to scroll back to top
  const scrollToTop = () => {
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
      modalBody.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleClick);

      // Cleanup to remove event listener
      return () => {
        container.removeEventListener('click', handleClick);
      };
    }
  }, [handleClick]);

  // Use the custom hook to get the image URL
  const resolvedImage = useRecordImage(recordData);
  const image = recordImageOverride || resolvedImage;

  useEffect(() => {
    const fallbackAspectRatio = getFallbackAspectRatio();

    if (!image) {
      setImageAspectRatio(fallbackAspectRatio);
      return;
    }

    let cancelled = false;
    const probe = new window.Image();

    probe.onload = () => {
      if (cancelled) {
        return;
      }

      const width = probe.naturalWidth || 0;
      const height = probe.naturalHeight || 0;

      if (!width || !height) {
        setImageAspectRatio(fallbackAspectRatio);
        return;
      }

      const detectedRatio = width / height;
      const boundedRatio = Math.min(Math.max(detectedRatio, 0.55), 1.4);
      setImageAspectRatio(boundedRatio);
    };

    probe.onerror = () => {
      if (!cancelled) {
        setImageAspectRatio(fallbackAspectRatio);
      }
    };

    probe.src = image;

    return () => {
      cancelled = true;
    };
  }, [getFallbackAspectRatio, image]);

  const cardWidth = isMobile ? 210 : 300;
  const frameAspectRatio = imageAspectRatio || getFallbackAspectRatio();

  // Check if the record is open access based on SeriesInfo
  const isOpenAccess = recordData?.items?.some(item => 
    item.name === 'SeriesInfo' && 
    item.data?.some(data => 
      typeof data === 'string' && data.toLowerCase().includes('open access')
    )
  ) || false;


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Add a reference point at the top */}
      <div ref={topRef} style={{ position: 'absolute', top: 0 }}></div>
      
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: isMobile ? '50vh' : '60vh',
        display: 'flex',
        alignItems: 'flex-start',
        padding: isMobile ? '20px 0' : '40px 0 40px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          width: '100%', 
          padding: isMobile ? '0 10px' : '0 20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '20px' : '40px',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          {/* Poster Image - Always show container */}
          <div style={{ 
            flexShrink: 0,
            position: 'relative',
            width: `${cardWidth}px`,
            maxWidth: '100%'
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: image && image.length > 0 ? '0 20px 40px rgba(0,0,0,0.4)' : '0 8px 25px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s ease',
              cursor: image && image.length > 0 ? 'pointer' : 'default',
              background: image && image.length > 0 ? 'transparent' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              border: image && image.length > 0 ? 'none' : '2px dashed #cbd5e1',
              width: '100%',
              aspectRatio: `${frameAspectRatio} / 1`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              if (image && image.length > 0) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onFocus={(e) => {
              if (image && image.length > 0) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onBlur={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {image && image.length > 0 ? (
                <RecordCoverImage src={image} alt={titleStringDisplay} />
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: isMobile ? '16px' : '32px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: isMobile ? '3rem' : '4rem',
                    opacity: 0.6,
                    color: '#64748b'
                  }}>
                    {recordData?.pubType === 'Primary Source' ? '📜' : 
                     recordData?.pubType === 'Video Recording' ? '🎬' : '📚'}
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: isMobile ? '0.85rem' : '1rem',
                    fontWeight: '500',
                    lineHeight: '1.4'
                  }}>
                    No Cover Image Available
                  </div>
                  <div style={{
                    color: '#94a3b8',
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
                    lineHeight: '1.4'
                  }}>
                    {recordData?.pubType === 'Primary Source' ? 'Archival Collection' :
                     recordData?.pubType === 'Video Recording' ? 'Video Recording' :
                     recordData?.pubType || 'Resource'}
                  </div>
                </div>
              )}
            </div>
              
              <RecordBadges record={recordData} isOpenAccess={isOpenAccess} />

              {/* Upload Button */}
              {loggedIn && (
                <button
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    right: '12px',
                    padding: '8px 16px',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(8px)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                  onFocus={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.9)'}
                  onBlur={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                  onClick={toggleImageUploadModal}
                >
                  <FontAwesomeIcon icon={faUpload} />
                  Upload Cover
                </button>
              )}
            </div>

          {/* Main Info */}
          <div style={{ flex: 1, color: '#1e293b' }}>
            <h1 style={{
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: '700',
              marginBottom: '12px',
              lineHeight: '1.2',
              color: '#1e293b'
            }}>
              {recordData?.titles?.[0]?.TitleFull || 
               recordData?.titleItem?.[0] || 
               titleStringDisplay}
            </h1>

            {/* Authors for books and finding aids */}
            {(recordData?.pubType === 'Book' || recordData?.pubType === 'Primary Source') && (
              <div style={{ 
                marginBottom: '20px',
                fontSize: isMobile ? '1rem' : '1.2rem',
                color: '#64748b'
              }}>
                {recordData.itemsRaw?.map((item) =>
                  item.label === 'Authors' ? (
                    <div
                      key={item.label}
                      dangerouslySetInnerHTML={{
                        __html: decode(item.data, { level: 'html5' }),
                      }}
                    />
                  ) : null
                )}
                {/* Handle finding aids author data if not in itemsRaw */}
                {recordData?.authorItem && recordData.authorItem.length > 0 && (
                  <div>
                    {recordData.authorItem.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Abstract with truncation and deduplication */}
            {(() => {
              // Get abstracts from both MARC records (items) and finding aids (abstractItem)
              const marcAbstracts = recordData.items?.filter(item => item.label === 'Abstract') || [];
              const findingAidsAbstract = recordData.abstractItem || [];
              
              // Combine both sources
              const allAbstracts = [
                ...marcAbstracts,
                // Convert abstractItem array to items format for consistency
                ...findingAidsAbstract.map(text => ({ data: text }))
              ];
              
              if (allAbstracts.length === 0) return null;

              // Find the longest unique abstract (likely the most complete one)
              const uniqueAbstracts = [];
              allAbstracts.forEach(abstract => {
                // Handle both array and string data types
                let text = '';
                if (Array.isArray(abstract.data)) {
                  text = abstract.data.join(' ').trim();
                } else {
                  text = typeof abstract.data === 'string' 
                    ? abstract.data.trim() 
                    : String(abstract.data || '').trim();
                }
                
                if (!text) return; // Skip empty abstracts
                
                // Check if this text is not already contained in or doesn't contain existing abstracts
                const isDuplicate = uniqueAbstracts.some(existing => 
                  existing.includes(text) || text.includes(existing)
                );
                if (!isDuplicate) {
                  uniqueAbstracts.push(text);
                }
              });

              // Use the longest abstract as it's likely the most complete
              const selectedAbstract = uniqueAbstracts.reduce((longest, current) => 
                current.length > longest.length ? current : longest, uniqueAbstracts[0] || ''
              );

              if (!selectedAbstract) return null;

              const maxLength = 150; // Reduced character limit for preview
              const shouldTruncate = selectedAbstract.length > maxLength;
              const displayText = shouldTruncate && !isAbstractExpanded 
                ? selectedAbstract.substring(0, maxLength) + '...'
                : selectedAbstract;

              return (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{
                    fontSize: isMobile ? '0.95rem' : '1.1rem',
                    lineHeight: '1.6',
                    color: '#475569',
                    marginBottom: shouldTruncate ? '8px' : '0',
                    maxWidth: isMobile ? '100%' : '600px'
                  }}>
                    {displayText}
                  </p>
                  {shouldTruncate && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <button
                        onClick={toggleAbstractExpansion}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          textDecoration: 'underline',
                          padding: '0'
                        }}
                      >
                        {isAbstractExpanded ? 'Show Less' : 'See More'}
                      </button>
                      {!isAbstractExpanded && (
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                          or{' '}
                          <button
                            onClick={() => {
                              const fullRecordElement = document.querySelector('[data-section="full-record"]');
                              if (fullRecordElement) {
                                fullRecordElement.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              textDecoration: 'underline',
                              padding: '0'
                            }}
                          >
                            view Full Record Details
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px',
              marginBottom: '20px',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              {hasStreamingVideo && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={streamingURL}
                  style={{
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onFocus={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onBlur={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ▶ Watch Now
                </a>
              )}

              {hasEbook && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={ebookURL}
                  style={{
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  onFocus={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onBlur={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  📖 Read Now
                </a>
              )}

              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://openurl.ebsco.com/c/4e4lys/openurl?sid=ebsco:plink&id=ebsco:${dbid}:${an}&crl=f&prompt=none`}
                style={{
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#475569',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {hasStreamingVideo || hasEbook ? 'More Info' : 'View Item'}
              </a>

              {loggedIn && (
                <button 
                  style={{
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    background: isFavorite ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.9)',
                    color: isFavorite ? '#dc2626' : '#475569',
                    border: `2px solid ${isFavorite ? '#ef4444' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = isFavorite ? 'rgba(239,68,68,0.2)' : '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isFavorite ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = isFavorite ? 'rgba(239,68,68,0.2)' : '#f1f5f9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = isFavorite ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={toggleFavorite}
                >
                  {isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
                </button>
              )}
            </div>

            {/* Ebook Access Notice */}
            {hasEbook && (
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(245,158,11,0.2)'
              }}>
                <div style={{
                  fontSize: '1.2em',
                  color: '#d97706'
                }}>
                  🔒
                </div>
                <div style={{
                  flex: 1,
                  color: '#92400e',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  <strong>Institution Access Required:</strong> This ebook is available only to patrons of the subscribing institution. Off-campus users may need to authenticate through their institution&apos;s library system.
                </div>
              </div>
            )}

            {/* Quick Availability Info - Only show for MARC records, not finding aids */}
            {recordData?.pubType !== 'Primary Source' && (
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(8px)'
              }}>
                <h4 style={{ 
                  color: '#1e293b', 
                  marginBottom: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📍 Availability
                </h4>
                <RecordAvailability id={an} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: '#ffffff',
        minHeight: '40vh',
        padding: isMobile ? '20px 0' : '40px 0'
      }}>
        {recordData && Object.keys(recordData).length > 0 && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 10px' : '0 20px' }} ref={containerRef}>
            
            {/* Collections Section */}
            {loggedIn && (
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <h3 style={{ 
                  color: '#1e293b', 
                  marginBottom: '20px',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Manage Collections
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}>
                  <select
                    style={{
                      padding: '12px 16px',
                      background: '#ffffff',
                      color: '#1e293b',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      minWidth: '220px',
                      cursor: 'pointer'
                    }}
                    onChange={(e) => addToCollection(e.target.value, an, dbid)}
                  >
                    <option value="">Add to collection</option>
                    {collections.map((collection) => (
                      <option
                        key={collection.collection_id}
                        value={collection.collection_id}
                      >
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  
                  <button 
                    style={{
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={toggleModal}
                  >
                    Create New Collection
                  </button>
                </div>
                
                {currentCollections.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentCollections.map((collection) => (
                      <button
                        key={collection.collection_records_id}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#dc2626',
                          border: '1px solid #ef4444',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleRemoveFromCollection(collection.collection_records_id)}
                      >
                        {collection.collectionName.name}
                        <span style={{ fontSize: '1.1em' }}>×</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Series Tags */}
            {recordData.items?.map((item) => (
              item.label === 'Series' && (
                <div key={item.label} style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    color: '#1e293b', 
                    marginBottom: '16px',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>
                    Series
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {item.data.map((seriesItem) => (
                      <span
                        key={seriesItem}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        {seriesItem}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}

            {/* Cast Section - Display without accordion */}
            {recordData.pubType === 'Video Recording' && (
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <div ref={castRef}>
                  <h3 style={{ 
                    color: '#1e293b', 
                    marginBottom: '16px',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}>
                    🎭 Cast & Crew
                  </h3>
                </div>
                <FullCast
                  results={recordData.tmdbSearch?.results}
                  imdb={imdb}
                  title={recordData?.titles?.[0]?.TitleFull || titleStringDisplay}
                  year={recordData?.year}
                />
              </div>
            )}

            {/* Recommendations Section - Display without accordion */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div ref={recommendationsRef}>
                <h3 style={{ 
                  color: '#1e293b', 
                  marginBottom: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  💡 Recommendations
                </h3>
              </div>
              <RecommendationDisplay
                data={recordData}
                type={recordData.pubType === 'Video Recording' ? 'Video' : 'Book'}
              />
            </div>

            {/* Shelf Browse Section - Display without accordion */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div ref={shelfBrowseRef}>
                <h3 style={{ 
                  color: '#1e293b', 
                  marginBottom: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  📚 Shelf Browse
                </h3>
              </div>
              <CallNumberBrowse initialQuery={an} />
            </div>

            {/* Full Record Section - Display without accordion */}
            <div 
              data-section="full-record"
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                overflow: 'hidden',
                maxWidth: '100%'
              }}>
              <div ref={fullRecordRef}>
                <h3 style={{ 
                  color: '#1e293b', 
                  marginBottom: '16px',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  📋 Full Record Details
                </h3>
              </div>
              <div style={{ paddingBottom: '20px', overflowX: 'auto', maxWidth: '100%' }}>
                <dl style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                  gap: '16px 24px',
                  margin: 0,
                  width: '100%',
                  maxWidth: '100%'
                }}>
                  {recordData.itemsRaw.map((item) => (
                    <Fragment key={item.label}>
                      <dt style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        alignSelf: 'start'
                      }}>
                        {item.label}
                      </dt>
                      <dd style={{
                        color: '#374151',
                        margin: 0,
                        lineHeight: '1.6',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%'
                      }}>
                        <div
                          className="record-detail-content"
                          style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '100%'
                          }}
                          dangerouslySetInnerHTML={{
                            __html: decode(item.data, { level: 'html5' }),
                          }}
                        />
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              </div>
            </div>

            {/* Back to Top */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '40px', 
              marginBottom: '40px' 
            }}>
              <button 
                onClick={scrollToTop}
                style={{
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                ↑ Back to Top
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isModalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Create New Collection
        </ModalHeader>
        <ModalBody>
          <NewCollectionForm />
        </ModalBody>
      </Modal>

      {imageUploadModalOpen && (
        <ImageUploadModal
          isOpen={imageUploadModalOpen}
          toggle={toggleImageUploadModal}
          record={{ an, dbid }}
        />
      )}
    </div>
  );
}

export default RecordsDisplay;
