// pages/account/collections.js
// Status: Active page for the /account/collections route.
// Note: A refactor is planned to split this into folder-based routes, but those pages do not exist yet.
// Planned (not yet created):
//   - /account/collections/index.js          // collections list
//   - /account/collections/[collectionId].js // specific collection
// Keep this file until the new routes are created and wired. After that, replace with redirects or remove.
import { useEffect, useState, useCallback, useRef } from 'react';
import { useStore } from '../../store/store'
// import { shallow } from 'zustand/shallow'
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import { useFetchAccountData } from '../../hooks/useFetchAccountData';
import { useFetchCollectionRecords } from '../../hooks/useFetchCollectionRecords';
import { 
  Card, CardBody, Row, Col, Button, Alert, Input, InputGroup, 
  Table, Spinner, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  Badge, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from '../../styles/CollectionsPage.module.css';
import NewCollectionForm from '../../components/NewCollectionForm';
import EditCollectionForm from '../../components/EditCollectionForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faGripVertical, faExclamationTriangle, 
  faSearch, faChevronDown, faEllipsisV,
  faQuestionCircle, faCheck,
  faUndo, faArrowDown, faArrowUp, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import Image from 'next/image';
import DraggableRecordRow from '../../components/collections/DraggableRecordRow';
import CollectionsHelpModal from '../../components/collections/CollectionsHelpModal';
import { useCollectionOrdering } from '../../hooks/useCollectionOrdering';

// helper to open record modal via store is inlined where used to avoid top-level evaluation order issues

const CollectionsPage = () => {
  const router = useRouter();
  const { loggedIn, authChecked, user, collections, baseUrl } = useStore((state) => ({
    loggedIn: state.loggedIn,
    authChecked: state.authChecked,
    user: state.user,
    collections: state.collections || [],
    baseUrl: state.baseUrl,
  }));

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(25); // Percentage: 25% default
  const [isResizing, setIsResizing] = useState(false);
  const [focusedCollectionIndex, setFocusedCollectionIndex] = useState(-1);
  
  // Ref for infinite scroll
  const tableBottomRef = useRef(null);
  const sidebarRef = useRef(null);
  
  const { 
    collectionRecords, 
    setCollectionRecords, 
    loading, 
    error: recordsError, 
    hasMore, 
    loadMore, 
    removeCollectionRecords,
    resetCollectionData 
  } = useFetchCollectionRecords(20, selectedCollection?.collection_id);

  // Ordering state via hook (after collectionRecords is defined)
  const {
    selectedRecords,
    setSelectedRecords,
    sortConfig,
    setSortConfig,
    localRecords,
    setLocalRecords,
    hasLocalChanges,
    setHasLocalChanges,
    setOriginalRecords,
    displayRecords,
    handleSort,
    handleToggleSelect,
    handleMoveToPosition,
    handleMoveSelectedToPosition,
    handleMoveSelectedUp,
    handleMoveSelectedDown,
    handleResetOrder,
    moveRecord,
  } = useCollectionOrdering(collectionRecords);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  const { refetch } = useFetchAccountData();

  // Sort options for the dropdown
  const sortOptions = [
    { key: 'default', label: 'Default Order', description: 'Original collection order' },
    { key: 'title-asc', label: 'Title (A-Z)', description: 'Sort by title A to Z' },
    { key: 'title-desc', label: 'Title (Z-A)', description: 'Sort by title Z to A' },
    { key: 'author-asc', label: 'Author (A-Z)', description: 'Sort by author A to Z' },
    { key: 'author-desc', label: 'Author (Z-A)', description: 'Sort by author Z to A' },
    { key: 'year-asc', label: 'Year (Oldest First)', description: 'Sort by year ascending' },
    { key: 'year-desc', label: 'Year (Newest First)', description: 'Sort by year descending' },
    { key: 'type-asc', label: 'Type (A-Z)', description: 'Sort by material type A to Z' },
    { key: 'type-desc', label: 'Type (Z-A)', description: 'Sort by material type Z to A' }
  ];

  const onSort = useCallback((sortKey) => handleSort(sortKey, collectionRecords), [handleSort, collectionRecords]);

  const onMoveToPosition = useCallback((targetIndex) => handleMoveToPosition(targetIndex, collectionRecords), [handleMoveToPosition, collectionRecords]);

  // Enhanced move function for the selection bar
  const onMoveSelectedToPosition = useCallback((position) => handleMoveSelectedToPosition(position, collectionRecords), [handleMoveSelectedToPosition, collectionRecords]);

  // Move selected records up one position
  const onMoveSelectedUp = useCallback(() => handleMoveSelectedUp(collectionRecords), [handleMoveSelectedUp, collectionRecords]);

  // Move selected records down one position
  const onMoveSelectedDown = useCallback(() => handleMoveSelectedDown(collectionRecords), [handleMoveSelectedDown, collectionRecords]);

  // Reset to original order
  // keep same handler name used in JSX
  const onResetOrder = handleResetOrder;

  // Apply changes to server
  const handleApplyChanges = useCallback(async () => {
    if (!selectedCollection || !hasLocalChanges) return;
    
    const recordsToUpdate = localRecords.length > 0 ? localRecords : collectionRecords;
    const collectionId = selectedCollection.collection_id;
    
    try {
      const recordsPayload = recordsToUpdate.map((record, idx) => ({
        collection_records_id: record.collection_records_id,
        sort_order: idx + 1,
      }));

      await axios.put(
        `${baseUrl}/collection_records/update-sort-order`,
        {
          collection_id: collectionId,
          records: recordsPayload,
        },
        { withCredentials: true }
      );
      
      setCollectionRecords(recordsToUpdate);
      setLocalRecords([]);
      setHasLocalChanges(false);
      setOriginalRecords([]);
      toast.success('Collection order updated successfully');
    } catch (error) {
      toast.error('Failed to update collection order');
      console.error('Error updating record order:', error);
    }
  }, [selectedCollection, hasLocalChanges, localRecords, collectionRecords, baseUrl, setCollectionRecords, setHasLocalChanges, setLocalRecords, setOriginalRecords]);

  // keep displayRecords in sync with hook by feeding updated collectionRecords where used

  const handleSelectCollection = useCallback((collection) => {
    if (selectedCollection?.collection_id !== collection.collection_id) {
      resetCollectionData();
      setSelectedCollection(collection);
      // Reset local state when switching collections
      setLocalRecords([]);
      setHasLocalChanges(false);
      setSortConfig({ field: 'default', direction: 'asc' });
      setSelectedRecords([]);
      setOriginalRecords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection, resetCollectionData]);

  useEffect(() => {
    if (!authChecked) return;
    if (loggedIn === false) {
      const currentPath = router.asPath;
      window.location.assign(`${baseUrl}/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [authChecked, loggedIn, router, baseUrl]);

  useEffect(() => {
    if (collections.length > 0 && !selectedCollection) {
      setSelectedCollection(collections[0]);
    }
  }, [collections, selectedCollection]);

  useEffect(() => {
    if (recordsError) {
      setError("Failed to load collection records. Please try again later.");
    } else {
      setError(null);
    }
  }, [recordsError]);

  // Reset local changes when collection records change
  useEffect(() => {
    if (collectionRecords.length > 0 && !hasLocalChanges) {
      setLocalRecords([]);
      setOriginalRecords([]);
    }
  }, [collectionRecords, hasLocalChanges, setLocalRecords, setOriginalRecords]);

  const moveRow = useCallback(async (dragIndex, hoverIndex) => {
    if (!selectedCollection) return;
    moveRecord(dragIndex, hoverIndex, collectionRecords);
  }, [selectedCollection, moveRecord, collectionRecords]);

  const deleteCollection = async (collectionId) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      try {
        await axios.delete(`${baseUrl}/collection_name/delete/${collectionId}`, { 
          withCredentials: true 
        });
        toast.success('Collection deleted successfully');
        
        const updatedCollections = collections.filter(c => c.collection_id !== collectionId);
        useStore.setState({ collections: updatedCollections });
        
        if (selectedCollection?.collection_id === collectionId) {
          setSelectedCollection(updatedCollections[0] || null);
        }
      } catch (error) {
        console.log(error)
        toast.error(error?.response?.data?.message|| 'Error deleting collection');
        console.error('Error deleting collection:', error);
      }
    }
  };

  const handleDeleteRecord = (an, folio_id, id) => {
    if (window.confirm('Are you sure you want to remove this record?')) {
      const endpoint = `${baseUrl}/collection_records/delete/${id}`;
      axios.delete(endpoint, {
        withCredentials: true
      })
      .then(() => {
        toast.success('Successfully removed from collection');
        removeCollectionRecords(folio_id);
      })
      .catch(error => {
        toast.error('Error removing from collection');
        console.error('Error removing from collection:', error);
      });
    }
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);
  
  const toggleCollectionMenu = (id) => {
    setCollectionMenuOpen(collectionMenuOpen === id ? null : id);
  };

  const filteredCollections = searchTerm
    ? collections.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : collections;

  // Open edit modal
  const handleEditCollection = (collection) => {
    setEditingCollection(collection);
    setEditModalOpen(true);
  };

  // Handle edit success callback
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingCollection(null);
    // Refetch collections data to ensure UI is up to date
    refetch();
  };

  // Handle edit cancel callback
  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingCollection(null);
  };

  // Empty collection
  const handleEmptyCollection = async (collection) => {
    if (!window.confirm('Are you sure you want to empty this collection? This cannot be undone.')) return;
    try {
      const response = await axios.delete(`${baseUrl}/collection_name/clear-collection/${collection.collection_id}`, { withCredentials: true });
      if (response.data.success) {
        // Update collection in store
        useStore.setState(state => ({
          collections: state.collections.map(c =>
            c.collection_id === collection.collection_id
              ? { ...c, recordCount: 0, records: [], cover_image: '' }
              : c
          )
        }));
        // If the emptied collection is selected, clear its records and cover image in UI
        if (selectedCollection?.collection_id === collection.collection_id) {
          setCollectionRecords([]);
          setSelectedCollection({
            ...selectedCollection,
            recordCount: 0,
            records: [],
            cover_image: ''
          });
        }
        toast.success('Collection emptied');
      } else {
        toast.error('Failed to empty collection');
      }
    } catch (error) {
      toast.error('Error emptying collection');
    }
  };

  // Set cover image for collection
  const handleSetCoverImage = async (collection_id, image) => {
    try {
      const response = await axios.put(
        `${baseUrl}/collection_name/update/${collection_id}`,
        { cover_image: image },
        { withCredentials: true }
      );
      if (response.data.success || response.data.updatedCollection) {
        useStore.setState(state => ({
          collections: state.collections.map(c =>
            c.collection_id === collection_id
              ? { ...c, cover_image: image }
              : c
          )
        }));
        toast.success('Cover image updated');
      } else {
        toast.error('Failed to update cover image');
      }
    } catch (error) {
      toast.error('Error updating cover image');
    }
  };

  // Sidebar resize handlers
  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newWidth = (e.clientX / containerWidth) * 100;
    
    // Constrain between 15% and 45%
    if (newWidth >= 15 && newWidth <= 45) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Attach mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Keyboard navigation for collections and records
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if we're not in an input/textarea
      const targetTag = e.target.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') return;
      
      // Handle record reordering with Shift + arrow keys when records are selected
      if (selectedRecords.length > 0 && e.shiftKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          onMoveSelectedUp();
          return;
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          onMoveSelectedDown();
          return;
        }
      }
      
      // Handle collection navigation (without Shift key)
      if (!e.shiftKey && filteredCollections.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const currentIndex = focusedCollectionIndex < 0 ? -1 : focusedCollectionIndex;
          const newIndex = Math.min(currentIndex + 1, filteredCollections.length - 1);
          setFocusedCollectionIndex(newIndex);
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const currentIndex = focusedCollectionIndex < 0 ? 0 : focusedCollectionIndex;
          const newIndex = Math.max(currentIndex - 1, 0);
          setFocusedCollectionIndex(newIndex);
          return;
        } else if (e.key === 'Enter' && focusedCollectionIndex >= 0) {
          e.preventDefault();
          handleSelectCollection(filteredCollections[focusedCollectionIndex]);
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedCollectionIndex, filteredCollections, handleSelectCollection, selectedRecords, onMoveSelectedUp, onMoveSelectedDown]);

  // Focus the collection when index changes
  useEffect(() => {
    if (focusedCollectionIndex >= 0 && sidebarRef.current) {
      const buttons = sidebarRef.current.querySelectorAll('button[data-collection-index]');
      const button = buttons[focusedCollectionIndex];
      if (button) {
        button.focus();
      }
    }
  }, [focusedCollectionIndex]);

  // Infinite scroll - auto-load more when near bottom
  useEffect(() => {
    const currentRef = tableBottomRef.current;
    if (!currentRef || !hasMore || loading || hasLocalChanges) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, hasLocalChanges, loadMore]);

  if (!authChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (loggedIn === false || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.collectionsHeader}>
        <h1>My Collections</h1>
        <div className="d-flex align-items-center gap-2">
          <Button 
            color="primary" 
            onClick={() => setShowNewCollectionForm(!showNewCollectionForm)}
          >
            <FontAwesomeIcon icon={faPlus} /> New Collection
          </Button>
          <Button
            color="info"
            outline
            onClick={() => setHelpOpen(true)}
            title="Help"
          >
            <FontAwesomeIcon icon={faQuestionCircle} /> Help
          </Button>
        </div>
      </div>
      <CollectionsHelpModal isOpen={helpOpen} toggle={() => setHelpOpen(false)} />
      
      {/* New Collection Modal */}
      <Modal isOpen={showNewCollectionForm} toggle={() => setShowNewCollectionForm(false)} size="lg">
        <ModalHeader toggle={() => setShowNewCollectionForm(false)}>Create New Collection</ModalHeader>
        <ModalBody>
          <NewCollectionForm 
            onSuccess={() => {
              setShowNewCollectionForm(false);
              toast.success('Collection created successfully');
              refetch();
            }}
            onCancel={() => setShowNewCollectionForm(false)}
          />
        </ModalBody>
      </Modal>
      
      {error && (
        <Alert color="danger" className="mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      )}
      
      {/* Edit Collection Modal */}
      <Modal isOpen={editModalOpen} toggle={() => setEditModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setEditModalOpen(false)}>Edit Collection</ModalHeader>
        <ModalBody>
          {editingCollection && (
            <EditCollectionForm 
              collection={editingCollection}
              onCancel={handleEditCancel}
              onSuccess={handleEditSuccess}
            />
          )}
        </ModalBody>
      </Modal>
      
      <div className={`${styles.collectionsContainer} ${isResizing ? styles.resizing : ''}`}>
        <Row className="g-0">
          {!sidebarCollapsed && (
            <Col 
              style={{ 
                flex: `0 0 ${sidebarWidth}%`,
                maxWidth: `${sidebarWidth}%`,
                position: 'relative'
              }} 
              className={styles.sidebarCol}
            >
              <Card className={styles.collectionsListCard} ref={sidebarRef}>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">My Collections ({collections.length})</h5>
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted" title="Use arrow keys to navigate">
                        <FontAwesomeIcon icon={faChevronUp} /> <FontAwesomeIcon icon={faChevronDown} />
                      </small>
                      <Button
                        color="link"
                        size="sm"
                        className="p-0 text-muted"
                        onClick={() => setSidebarCollapsed(true)}
                        title="Collapse sidebar"
                      >
                        <FontAwesomeIcon icon={faChevronDown} rotation={270} />
                      </Button>
                    </div>
                  </div>
                  
                  <InputGroup className="mb-3" size="sm">
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button color="secondary" size="sm">
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>
                  </InputGroup>
                  
                  <div className={styles.collectionsList}>
                    {filteredCollections.length > 0 ? (
                      filteredCollections.map((collection, index) => (
                        <button 
                          key={collection.collection_id}
                          data-collection-index={index}
                          className={`${styles.collectionItem} ${selectedCollection?.collection_id === collection.collection_id ? styles.activeItem : ''}`}
                          onClick={() => {
                            handleSelectCollection(collection);
                            setFocusedCollectionIndex(index);
                          }}
                          onFocus={() => setFocusedCollectionIndex(index)}
                          type="button"
                          aria-label={`Select ${collection.name} collection`}
                        >
                          <div className={styles.collectionItemContent}>
                            {/* Add cover image thumbnail */}
                            {collection.cover_image ? (
                              <Image
                                src={collection.cover_image}
                                alt={collection.name}
                                width={32}
                                height={32}
                                style={{ objectFit: 'cover', borderRadius: 4, marginRight: 8, border: '1px solid #ccc', flexShrink: 0 }}
                                unoptimized
                              />
                            ) : (
                              <div style={{
                                width: 32,
                                height: 32,
                                background: '#eee',
                                borderRadius: 4,
                                marginRight: 8,
                                flexShrink: 0,
                                border: '1px solid #ccc'
                              }} />
                            )}
                            <span className={styles.collectionName} title={collection.name}>{collection.name}</span>
                          </div>
                          <div className={styles.collectionMenuWrapper}>
                            <Dropdown 
                              isOpen={collectionMenuOpen === collection.collection_id} 
                              toggle={() => toggleCollectionMenu(collection.collection_id)}
                              direction="down"
                            >
                              <DropdownToggle tag="div" className={styles.collectionMenu}>
                                <FontAwesomeIcon icon={faEllipsisV} />
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem onClick={e => {
                                  e.stopPropagation();
                                  handleEditCollection(collection);
                                }}>
                                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                                  Edit
                                </DropdownItem>
                                <DropdownItem onClick={e => {
                                  e.stopPropagation();
                                  deleteCollection(collection.collection_id);
                                }}>
                                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                                  Delete
                                </DropdownItem>
                                <DropdownItem onClick={e => {
                                  e.stopPropagation();
                                  handleEmptyCollection(collection);
                                }}>
                                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                                  Empty
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </button>
                      ))
                     ) : searchTerm ? (
                      <div className={styles.noSearchResults}>
                        <p>No collections match your search</p>
                      </div>
                    ) : (
                      <div className={styles.noCollections}>
                        <p>No collections yet</p>
                        <p>Create your first collection with the button above</p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
              {/* Resize handle */}
              <button
                type="button"
                className={styles.resizeHandle}
                onMouseDown={handleMouseDown}
                aria-label="Resize sidebar"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setSidebarWidth(prev => Math.max(prev - 2, 15));
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setSidebarWidth(prev => Math.min(prev + 2, 45));
                  }
                }}
                title="Drag to resize sidebar, or use arrow keys"
              >
                <div className={styles.resizeHandleInner} />
              </button>
            </Col>
          )}
          
          <Col 
            style={{ 
              flex: sidebarCollapsed ? '1 1 100%' : `1 1 ${100 - sidebarWidth}%`,
              maxWidth: sidebarCollapsed ? '100%' : `${100 - sidebarWidth}%`
            }}
          >
            <Card className={styles.collectionContentCard}>
              <CardBody>
                {selectedCollection ? (
                  <>
                    <div className={styles.tableHeader}>
                      <div className={styles.collectionTitleGroup}>
                        {sidebarCollapsed && (
                          <Button
                            color="link"
                            size="sm"
                            className="p-0 me-2 text-muted"
                            onClick={() => setSidebarCollapsed(false)}
                            title="Show sidebar"
                          >
                            <FontAwesomeIcon icon={faChevronDown} rotation={90} />
                          </Button>
                        )}
                        <h3 className={styles.collectionTitle} title={selectedCollection.name}>{selectedCollection.name}</h3>
                        <Button 
                          color="outline-secondary" 
                          size="sm" 
                          onClick={() => {
                            // Get the current collection data from the collections array to ensure we have the latest data
                            const currentCollection = collections.find(c => c.collection_id === selectedCollection.collection_id);
                            handleEditCollection(currentCollection || selectedCollection);
                          }}
                          className="ms-2"
                          title="Edit Collection"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </Button>
                      </div>
                      
                      <div className={styles.collectionStats}>
                        <Badge color="primary" pill>
                          {collectionRecords.length} {collectionRecords.length === 1 ? 'item' : 'items'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className={styles.mobileCollectionSelector}>
                      <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="mb-3">
                        <DropdownToggle caret>
                          {selectedCollection.name} <FontAwesomeIcon icon={faChevronDown} />
                        </DropdownToggle>
                        <DropdownMenu>
                          {collections.map(collection => (
                            <DropdownItem 
                              key={collection.collection_id}
                              active={selectedCollection?.collection_id === collection.collection_id}
                              onClick={() => handleSelectCollection(collection)}
                            >
                              {collection.name}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    
                    {/* Selection Action Bar - appears when items are selected */}
                    {selectedRecords.length > 0 && (
                      <div className={styles.selectionBar}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <Badge color="primary" pill className={styles.selectionBadge}>
                              {selectedRecords.length} selected
                            </Badge>
                            <Button 
                              color="outline-secondary" 
                              size="sm"
                              onClick={() => setSelectedRecords([])}
                            >
                              Clear Selection
                            </Button>
                          </div>
                          
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="text-muted small">Move to:</span>
                            <Button 
                              color="primary" 
                              size="sm"
                              onClick={() => onMoveSelectedToPosition(0)}
                              title="Move selected to top"
                            >
                              <FontAwesomeIcon icon={faArrowUp} /> Top
                            </Button>
                            <Button 
                              color="primary" 
                              size="sm"
                              onClick={() => onMoveSelectedToPosition(displayRecords.length)}
                              title="Move selected to bottom"
                            >
                              <FontAwesomeIcon icon={faArrowDown} /> Bottom
                            </Button>
                            
                            <div className="vr mx-2"></div>
                            
                            <span className="text-muted small">Adjust:</span>
                            <Button 
                              color="secondary" 
                              size="sm"
                              onClick={() => onMoveSelectedUp()}
                              title="Move selected up one position (Shift+↑)"
                              disabled={selectedRecords.length === 0}
                            >
                              <FontAwesomeIcon icon={faChevronUp} /> Up
                            </Button>
                            <Button 
                              color="secondary" 
                              size="sm"
                              onClick={() => onMoveSelectedDown()}
                              title="Move selected down one position (Shift+↓)"
                              disabled={selectedRecords.length === 0}
                            >
                              <FontAwesomeIcon icon={faChevronDown} /> Down
                            </Button>
                            <span className="text-muted small ms-2" style={{ fontSize: '0.75rem' }}>
                              (Shift + ↑↓)
                            </span>
                            
                            <div className="vr mx-2"></div>
                            
                            <Input
                              type="select"
                              size="sm"
                              style={{ minWidth: '180px', maxWidth: '250px' }}
                              value=""
                              onChange={(e) => {
                                const position = parseInt(e.target.value);
                                if (!isNaN(position)) {
                                  onMoveSelectedToPosition(position);
                                }
                              }}
                            >
                              <option value="">After specific item...</option>
                              <option value="0">→ Beginning</option>
                              {displayRecords.map((record, index) => {
                                if (!selectedRecords.includes(record.collection_records_id)) {
                                  const title = record.titleFull || record.eds_id || `Item ${index + 1}`;
                                  const truncatedTitle = title.length > 30 ? title.substring(0, 30) + '...' : title;
                                  return (
                                    <option key={record.collection_records_id} value={index + 1}>
                                      → After: {truncatedTitle}
                                    </option>
                                  );
                                }
                                return null;
                              })}
                              <option value={displayRecords.length}>→ End</option>
                            </Input>
                          </div>
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">
                            <FontAwesomeIcon icon={faGripVertical} className="me-1" />
                            Drag items or use checkboxes to select multiple, then use controls above to reorder.
                          </small>
                        </div>
                      </div>
                    )}

                    {/* Sorting Controls */}
                    {displayRecords.length > 0 && (
                      <div className={styles.sortingControls}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted fw-bold">Sort:</span>
                              <Dropdown isOpen={sortDropdownOpen} toggle={() => setSortDropdownOpen(!sortDropdownOpen)}>
                                <DropdownToggle 
                                  color="outline-secondary" 
                                  size="sm"
                                  style={{ minWidth: '200px', textAlign: 'left' }}
                                >
                                  {sortOptions.find(option => option.key === sortConfig.field)?.label || 'Default Order'}
                                  <FontAwesomeIcon icon={faChevronDown} className="ms-2" />
                                </DropdownToggle>
                                <DropdownMenu>
                                  {sortOptions.map(option => (
                                    <DropdownItem 
                                      key={option.key}
                                      active={sortConfig.field === option.key}
                                      onClick={() => onSort(option.key)}
                                    >
                                      <div>
                                        <div className="fw-bold">{option.label}</div>
                                        <small className="text-muted">{option.description}</small>
                                      </div>
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-center gap-2">
                            {hasLocalChanges && (
                              <Badge color="warning" className={styles.changesBadge}>
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                                Unsaved changes
                              </Badge>
                            )}
                            {hasLocalChanges && (
                              <>
                                <Button 
                                  color="secondary" 
                                  size="sm" 
                                  onClick={onResetOrder}
                                  title="Reset to original order"
                                >
                                  <FontAwesomeIcon icon={faUndo} /> Reset
                                </Button>
                                <Button 
                                  color="success" 
                                  size="sm" 
                                  onClick={handleApplyChanges}
                                  title="Save changes to server"
                                  className={styles.applyButton}
                                >
                                  <FontAwesomeIcon icon={faCheck} /> Save Order
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <DndProvider backend={HTML5Backend}>
                      <div className={styles.tableContainer}>
                        <Table hover responsive className={styles.recordsTable} size="sm">
                          <thead className={styles.stickyHeader}>
                            <tr>
                              <th width="40" className="text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedRecords.length > 0 && selectedRecords.length === displayRecords.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecords(displayRecords.map(r => r.collection_records_id));
                                    } else {
                                      setSelectedRecords([]);
                                    }
                                  }}
                                  title="Select all"
                                />
                              </th>
                              <th width="40" className="text-center">
                                <FontAwesomeIcon icon={faGripVertical} title="Drag to reorder" className="text-muted" />
                              </th>
                              <th width="70">Move</th>
                              <th width="60">Cover</th>
                              <th>Title</th>
                              <th width="180">Author</th>
                              <th width="100">Type</th>
                              <th width="70">Year</th>
                              <th width="120">Actions</th>
                              <th width="100">Set Cover</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading && displayRecords.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="text-center py-5">
                                  <Spinner color="primary" />
                                  <p className="mt-3 text-muted">Loading collection items...</p>
                                </td>
                              </tr>
                            ) : displayRecords.length > 0 ? (
                              displayRecords.map((record, index) => {
                                const currentCover = selectedCollection?.cover_image;
                                return (
                                  <DraggableRecordRow
                                    key={record.collection_records_id}
                                    index={index}
                                    record={record}
                                    moveRecord={(from, to) => moveRow(from, to)}
                                    onDelete={handleDeleteRecord}
                                    onViewRecord={(rec) => {
                                      const [setAn, setDbid, setRecordModal] = useStore.getState
                                        ? [useStore.getState().setAn, useStore.getState().setDbid, useStore.getState().setRecordModal]
                                        : [null, null, null];
                                      if (setAn && setDbid && setRecordModal) {
                                        setAn(rec.eds_id || rec.folio_id);
                                        setDbid(rec.dbid);
                                        setRecordModal(true);
                                      }
                                    }}
                                    onSetCoverImage={(img) => handleSetCoverImage(selectedCollection.collection_id, img)}
                                    isSelected={selectedRecords.includes(record.collection_records_id)}
                                    onToggleSelect={handleToggleSelect}
                                    selectedRecords={selectedRecords}
                                    onMoveToPosition={(pos) => onMoveToPosition(pos)}
                                    totalRecords={displayRecords.length}
                                    currentCover={currentCover}
                                  />
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={10} className="text-center py-5">
                                  <div className="text-muted">
                                    <p className="mb-0">This collection is empty.</p>
                                    <small>Add items from the catalog to get started.</small>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    </DndProvider>
                    
                    {/* Infinite scroll sentinel */}
                    <div ref={tableBottomRef} style={{ height: '20px', margin: '20px 0' }} />
                    
                    {loading && displayRecords.length > 0 && (
                      <div className={styles.loadingIndicator}>
                        <Spinner size="sm" color="primary" />
                        <span>Loading more records...</span>
                      </div>
                    )}
                    
                    {!loading && !hasLocalChanges && collectionRecords.length > 0 && hasMore && (
                      <div className="text-center mt-3 mb-3">
                        <small className="text-muted">
                          Scroll down to load more items automatically, or{' '}
                          <Button color="link" size="sm" onClick={loadMore} className="p-0">
                            click here to load now
                          </Button>
                        </small>
                      </div>
                    )}
                    
                    {!loading && !hasMore && displayRecords.length > 0 && (
                      <div className="text-center mt-3 mb-3">
                        <small className="text-muted">
                          ✓ All items loaded ({displayRecords.length} total)
                        </small>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noCollectionSelected}>
                    <p>Select a collection or create a new one to get started.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default CollectionsPage;
