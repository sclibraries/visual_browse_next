// pages/account/index.js
import { useEffect } from 'react';
import { useStore } from '../../store/store';
import { useRouter } from 'next/router';
import AdminLayout from '../../layouts/AdminLayout';
import { useFetchAccountData } from '../../hooks/useFetchAccountData';
import { Card, CardBody, CardTitle, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faHeart, faFilm, faList, faUsers } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/AccountDashboard.module.css';

const AccountDashboard = () => {
  const router = useRouter();
  const { loggedIn, authChecked, baseUrl, user, collections, favorites } = useStore((state) => ({
    loggedIn: state.loggedIn,
    authChecked: state.authChecked,
    baseUrl: state.baseUrl,
    user: state.user,
    collections: state.collections,
    favorites: state.favorites || [],
  }));


  // Fetch user and collection data
  useFetchAccountData();

  useEffect(() => {
    if (!authChecked) return; // wait until auth check completes
    if (loggedIn === false) {
      const currentPath = router.asPath;
      // Send user to backend login; after login backend will redirect back to this app
      window.location.assign(`${baseUrl}/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [authChecked, loggedIn, router, baseUrl]);

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
      <div className={styles.dashboardHeader}>
        <h1>Welcome, {user.name}</h1>
        <p>Manage your account, collections, and favorites.</p>
      </div>
      
      <Row className="mt-4">
        <Col md="6" lg="3" className="mb-4">
          <Card className={styles.dashboardCard}>
            <CardBody>
              <div className={styles.cardIcon}><FontAwesomeIcon icon={faList} /></div>
              <CardTitle tag="h5">Collections</CardTitle>
              <div className={styles.cardValue}>{collections?.length || 0}</div>
              <button 
                className={styles.cardAction} 
                onClick={() => router.push('/account/collections')}
                onKeyDown={(e) => e.key === 'Enter' && router.push('/account/collections')}
              >
                Manage Collections →
              </button>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="6" lg="3" className="mb-4">
          <Card className={styles.dashboardCard}>
            <CardBody>
              <div className={styles.cardIcon}><FontAwesomeIcon icon={faHeart} /></div>
              <CardTitle tag="h5">Favorites</CardTitle>
              <div className={styles.cardValue}>{favorites?.records?.length || 0}</div>
              <button 
                className={styles.cardAction} 
                onClick={() => router.push('/account/favorites')}
                onKeyDown={(e) => e.key === 'Enter' && router.push('/account/favorites')}
              >
                View Favorites →
              </button>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="6" lg="3" className="mb-4">
          <Card className={styles.dashboardCard}>
            <CardBody>
              <div className={styles.cardIcon}><FontAwesomeIcon icon={faUsers} /></div>
              <CardTitle tag="h5">Following</CardTitle>
              <div className={styles.cardValue}>Manage</div>
              <button 
                className={styles.cardAction} 
                onClick={() => router.push('/account/following')}
                onKeyDown={(e) => e.key === 'Enter' && router.push('/account/following')}
              >
                View Following →
              </button>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="6" lg="3" className="mb-4">
          <Card className={styles.dashboardCard}>
            <CardBody>
              <div className={styles.cardIcon}><FontAwesomeIcon icon={faBook} /></div>
              <CardTitle tag="h5">Books</CardTitle>
              <div className={styles.cardValue}>Browse</div>
              <button 
                className={styles.cardAction} 
                onClick={() => router.push('/books')}
                onKeyDown={(e) => e.key === 'Enter' && router.push('/books')}
              >
                Explore Books →
              </button>
            </CardBody>
          </Card>
        </Col>
        
        <Col md="6" lg="3" className="mb-4">
          <Card className={styles.dashboardCard}>
            <CardBody>
              <div className={styles.cardIcon}><FontAwesomeIcon icon={faFilm} /></div>
              <CardTitle tag="h5">Movies</CardTitle>
              <div className={styles.cardValue}>Browse</div>
              <button 
                className={styles.cardAction} 
                onClick={() => router.push('/movies')}
                onKeyDown={(e) => e.key === 'Enter' && router.push('/movies')}
              >
                Explore Movies →
              </button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

export default AccountDashboard;
