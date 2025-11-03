// pages/account/following.js
/* global Promise */
import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../store/store';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../layouts/AdminLayout';
import { Card, CardBody, CardTitle, Nav, NavItem, NavLink, TabContent, TabPane, Button, Alert, Spinner, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faHeart, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useFollowCollection } from '../../hooks/useFollowCollection';
import { shallow } from 'zustand/shallow';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

const AccountFollowing = () => {
  const router = useRouter();
  const [baseUrl, user] = useStore(
    (state) => [state.baseUrl, state.user],
    shallow
  );
  const { ready, authorized } = useAuthRedirect();

  const [activeTab, setActiveTab] = useState('following');
  const [followedCollections, setFollowedCollections] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    getFollowedCollections,
    unfollowCollection
  } = useFollowCollection();

  // Set last login when authorized
  useEffect(() => {
    if (authorized) {
      localStorage.setItem('lastLoginDate', new Date().toISOString());
    }
  }, [authorized]);

  // Define getNewRecordsCount before useEffect that uses it
  const getNewRecordsCount = useCallback(async (collectionId, lastLoginDate) => {
    try {
      if (!lastLoginDate) {
        return 0; // If no last login date, consider no new records
      }

      // Call backend endpoint to get count of records added since last login
      const response = await fetch(
        `${baseUrl}/following_collection/new-records-count/${collectionId}?since=${encodeURIComponent(lastLoginDate)}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        console.error('Failed to fetch new records count:', response.status);
        return 0;
      }

      const data = await response.json();
      return data.count || 0;
    } catch (err) {
      console.error('Error getting new records count:', err);
      return 0;
    }
  }, [baseUrl]);

  // Fetch data when tab changes
  useEffect(() => {
    const loadData = async () => {
  if (!authorized) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'following') {
          const data = await getFollowedCollections();
          if (data && data.following) {
            // Filter out any entries where collection is null and transform the data
            const validCollections = await Promise.all(
              data.following
                .filter(item => item.collection !== null)
                .map(async (item) => {
                  // Get user's last login time (placeholder - you might want to track this)
                  const lastLoginDate = localStorage.getItem('lastLoginDate') || 
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago as fallback
                  
                  const newRecordsCount = await getNewRecordsCount(item.collection.collection_id, lastLoginDate);
                  
                  return {
                    collection_id: item.collection.collection_id,
                    name: item.collection.name,
                    description: item.collection.description,
                    user_id: item.collection.user_id || null,
                    author_name: item.collection.author_name || 'Anonymous',
                    record_count: item.collection.views || 0,
                    followed_at: item.timestamp,
                    new_records_count: newRecordsCount
                  };
                })
            );
            setFollowedCollections(validCollections);
          }
        } else if (activeTab === 'followers') {
          // First get user's collections
          const collectionsResponse = await fetch(`${baseUrl}/collection_name/read-all`, {
            credentials: 'include'
          });
          
          if (!collectionsResponse.ok) {
            throw new Error('Failed to fetch collections');
          }
          
          const collections = await collectionsResponse.json();
          
          // For each collection, get its followers
          const collectionsWithFollowers = await Promise.all(
            collections.map(async (collection) => {
              try {
                const followersResponse = await fetch(
                  `${baseUrl}/following_collection/collection/${collection.collection_id}/followers`,
                  { credentials: 'include' }
                );
                
                let followers = [];
                let totalFollowers = 0;
                
                if (followersResponse.ok) {
                  const followersData = await followersResponse.json();
                  followers = followersData.followers || [];
                  totalFollowers = followersData.total || 0;
                  
                  // Use the collection data from the followers response if available
                  // This includes the correct views count
                  if (followersData.collection) {
                    return {
                      ...followersData.collection, // This has the correct views count
                      followers,
                      follower_count: totalFollowers
                    };
                  }
                }
                
                return {
                  ...collection,
                  followers,
                  follower_count: totalFollowers
                };
              } catch (err) {
                console.error(`Error fetching followers for collection ${collection.collection_id}:`, err);
                return {
                  ...collection,
                  followers: [],
                  follower_count: 0
                };
              }
            })
          );
          
          setUserCollections(collectionsWithFollowers);
        }
      } catch (err) {
        setError(activeTab === 'following' ? 'Failed to load followed collections' : 'Failed to load your collections');
        console.error(`Error loading ${activeTab} data:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, authorized, getFollowedCollections, baseUrl, getNewRecordsCount]);

  const handleUnfollow = async (collectionId, collectionName) => {
    if (!confirm(`Are you sure you want to unfollow "${collectionName}"?`)) {
      return;
    }

    try {
      await unfollowCollection(collectionId);
      // Remove from local state
      setFollowedCollections(prev => 
        prev.filter(collection => collection.collection_id !== collectionId)
      );
    } catch (err) {
      setError('Failed to unfollow collection');
      console.error('Error unfollowing collection:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

    // Fetch data when tab changes
  useEffect(() => {
    const fetchUserCollections = async () => {
      try {
        // First get user's collections
        const collectionsResponse = await fetch(`${baseUrl}/collection_name/read-all`, {
          credentials: 'include'
        });
        
        if (!collectionsResponse.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const collections = await collectionsResponse.json();
        
        // For each collection, get its followers
        const collectionsWithFollowers = await Promise.all(
          collections.map(async (collection) => {
            try {
              const followersResponse = await fetch(
                `${baseUrl}/following_collection/collection/${collection.collection_id}/followers`,
                { credentials: 'include' }
              );
              
              let followers = [];
              let totalFollowers = 0;
              
              if (followersResponse.ok) {
                const followersData = await followersResponse.json();
                followers = followersData.followers || [];
                totalFollowers = followersData.total || 0;
              }
              
              return {
                ...collection,
                followers,
                follower_count: totalFollowers
              };
            } catch (err) {
              console.error(`Error fetching followers for collection ${collection.collection_id}:`, err);
              return {
                ...collection,
                followers: [],
                follower_count: 0
              };
            }
          })
        );
        
        setUserCollections(collectionsWithFollowers);
      } catch (err) {
        console.error('Error fetching user collections:', err);
        throw err;
      }
    };

    const loadData = async () => {
  if (!authorized) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'following') {
          const data = await getFollowedCollections();
          if (data && data.following) {
            // Filter out any entries where collection is null and transform the data
            const validCollections = await Promise.all(
              data.following
                .filter(item => item.collection !== null)
                .map(async (item) => {
                  // Get user's last login time (placeholder - you might want to track this)
                  const lastLoginDate = localStorage.getItem('lastLoginDate') || 
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago as fallback
                  
                  const newRecordsCount = await getNewRecordsCount(item.collection.collection_id, lastLoginDate);
                  
                  return {
                    collection_id: item.collection.collection_id,
                    name: item.collection.name,
                    description: item.collection.description,
                    user_id: item.collection.user_id || null,
                    author_name: item.collection.author_name || 'Anonymous',
                    record_count: item.collection.views || 0,
                    followed_at: item.timestamp,
                    new_records_count: newRecordsCount
                  };
                })
            );
            setFollowedCollections(validCollections);
          }
        } else if (activeTab === 'followers') {
          await fetchUserCollections();
        }
      } catch (err) {
        setError(activeTab === 'following' ? 'Failed to load followed collections' : 'Failed to load your collections');
        console.error(`Error loading ${activeTab} data:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, authorized, getFollowedCollections, baseUrl, getNewRecordsCount]);

  if (!ready) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authorized || !user) {
    return null; // Will redirect via useEffect
  }


  return (
    <AdminLayout>
      <div className="mb-4">
        <h1 className="display-5">Following & Followers</h1>
        <p className="text-dark">Manage your collection follows and see who follows your collections.</p>
      </div>

      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Nav tabs className="mb-4">
        <NavItem>
          <NavLink
            className={activeTab === 'following' ? 'active' : ''}
            onClick={() => setActiveTab('following')}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faHeart} className="me-2" />
            Following ({followedCollections.length})
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'followers' ? 'active' : ''}
            onClick={() => setActiveTab('followers')}
            style={{ cursor: 'pointer' }}
          >
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Followers
          </NavLink>
        </NavItem>
      </Nav>

      {/* Tab Content */}
      <TabContent activeTab={activeTab}>
        {/* Following Tab */}
        <TabPane tabId="following">
          <Card>
            <CardBody>
              <CardTitle tag="h5" className="mb-3">
                Collections You Follow
              </CardTitle>
              
              {loading ? (
                <div className="text-center py-4">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading collections...</p>
                </div>
              ) : followedCollections.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-dark">You&rsquo;re not following any collections yet.</p>
                  <Button color="primary" onClick={() => router.push('/collections')}>
                    Browse Collections
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Collection Name</th>
                        <th>New Since Login</th>
                        <th>Followed On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followedCollections.map((collection) => (
                        <tr key={collection.collection_id}>
                          <td>
                            <Link 
                              href={`/collections/records/${collection.collection_id}`}
                              className="text-decoration-none"
                            >
                              <strong>{collection.name}</strong>
                            </Link>
                            {collection.description && (
                              <div className="text-dark small mt-1">
                                {collection.description.length > 100 
                                  ? `${collection.description.substring(0, 100)}...`
                                  : collection.description
                                }
                              </div>
                            )}
                          </td>
                          <td>
                            {collection.new_records_count > 0 ? (
                              <span className="badge bg-success me-1">
                                {collection.new_records_count} new
                              </span>
                            ) : (
                              <span className="text-dark">No new records</span>
                            )}
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            {formatDate(collection.followed_at)}
                          </td>
                          <td>
                            <Button
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleUnfollow(collection.collection_id, collection.name)}
                            >
                              Unfollow
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </TabPane>

        {/* Followers Tab */}
        <TabPane tabId="followers">
          <Card>
            <CardBody>
              <CardTitle tag="h5" className="mb-3">
                Your Collection Followers
              </CardTitle>
              
              {loading ? (
                <div className="text-center py-4">
                  <Spinner color="primary" />
                  <p className="mt-2">Loading your collections...</p>
                </div>
              ) : userCollections.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-dark">You don&rsquo;t have any collections yet.</p>
                  <Button color="primary" onClick={() => router.push('/account/collections')}>
                    Create Your First Collection
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th><FontAwesomeIcon icon={faHeart} className="me-1" />Collection</th>
                        <th><FontAwesomeIcon icon={faUsers} className="me-1" />Followers</th>
                        <th><FontAwesomeIcon icon={faCalendarAlt} className="me-1" />Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCollections.map((collection, index) => (
                        <tr key={`${collection.collection_id}-${index}`}>
                          <td>
                            <Link 
                              href={`/collections/records/${collection.collection_id}?name=${encodeURIComponent(collection.name)}&author_id=${collection.user_id}`}
                              className="text-decoration-none"
                            >
                              <strong className="text-primary">{collection.name}</strong>
                            </Link>
                            {collection.description && (
                              <div className="text-dark small">{collection.description}</div>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-primary me-1">
                              {collection.follower_count}
                            </span>
                            {collection.follower_count > 0 && (
                              <div className="small text-dark mt-1">
                                Recent followers: {collection.followers.slice(0, 3).map(follower => 
                                  follower.follower?.campus_id || 'Unknown'
                                ).join(', ')}
                                {collection.followers.length > 3 && ` and ${collection.followers.length - 3} more`}
                              </div>
                            )}
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            {formatDate(collection.timestamp)}
                          </td>
                          <td>
                            <Button
                              color="outline-primary"
                              size="sm"
                              onClick={() => router.push(`/collections/records/${collection.collection_id}?name=${encodeURIComponent(collection.name)}&author_id=${collection.user_id}`)}
                            >
                              View Collection
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>
    </AdminLayout>
  );
};

export default AccountFollowing;
