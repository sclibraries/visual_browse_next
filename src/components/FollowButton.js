import { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'reactstrap';
import { useFollowCollection } from '../hooks/useFollowCollection';
import { useStore } from '../store/store';
import { shallow } from 'zustand/shallow';

/**
 * Follow/Unfollow button component for collections
 * Only shows for logged-in users
 */
const FollowButton = ({ collectionId, className = "" }) => {
  const [loggedIn] = useStore(
    (state) => [state.loggedIn],
    shallow
  );
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    loading,
    error,
    checkFollowStatus,
    followCollection,
    unfollowCollection
  } = useFollowCollection();

  // Check follow status on mount and when login state changes
  useEffect(() => {
    const checkStatus = async () => {
      if (loggedIn && collectionId) {
        const status = await checkFollowStatus(collectionId);
        setIsFollowing(status);
      } else {
        setIsFollowing(false);
      }
    };

    checkStatus();
  }, [loggedIn, collectionId, checkFollowStatus]);

  // Don't show button if user is not logged in
  if (!loggedIn) {
    return null;
  }

  const handleFollowToggle = async () => {
    console.log('FollowButton - handleFollowToggle called');
    console.log('FollowButton - loggedIn:', loggedIn);
    
    try {
      if (isFollowing) {
        await unfollowCollection(collectionId);
        setIsFollowing(false);
      } else {
        await followCollection(collectionId);
        setIsFollowing(true);
      }
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error toggling follow status:', err);
    }
  };

  return (
    <div className={`follow-button-container ${className}`}>
      {showSuccess && (
        <Alert color="success" fade className="mb-2">
          {isFollowing ? 'Collection followed!' : 'Unfollowed collection'}
        </Alert>
      )}
      
      {error && (
        <Alert color="danger" fade className="mb-2">
          {error}
        </Alert>
      )}
      
      <Button
        color={isFollowing ? "outline-danger" : "outline-primary"}
        size="sm"
        onClick={handleFollowToggle}
        disabled={loading}
        className="d-flex align-items-center"
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-1" />
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </>
        ) : (
          <>
            <i className={`fa ${isFollowing ? 'fa-heart-o' : 'fa-heart'} me-1`} />
            {isFollowing ? 'Unfollow' : 'Follow'}
          </>
        )}
      </Button>
    </div>
  );
};

export default FollowButton;
