import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfo from './userInfo';
import CollectionList from './collections';
import NewCollectionForm from './newCollectionForm';
import { Button, Col, Row, Container, Nav, NavItem, NavLink, TabContent, TabPane, Card, CardBody } from 'reactstrap';
import { useRouter } from 'next/router';
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';
import CollectionRecords from './collectionRecords';
import { useFetchAccountData } from '@/hooks/useFetchAccountData';
import Favorites from './favorites';

function Account() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(router.query.tab || 'favorites');
  const currentPath = router.asPath;

  const [
    collections, 
    loggedIn, 
    collectionRecordId, 
    setCollectionRecordId, 
    collectionRecordName, 
    setCollectionRecordName, 
    user
  ] = useStore(
    (state) => [state.collections, state.loggedIn, state.collectionRecordId, state.setCollectionRecordId, state.collectionRecordName, state.setCollectionRecordName, state.user],
    shallow
  );

  // Fetch user and collection data
   useFetchAccountData();

   useEffect(() => {
    const { tab, collection } = router.query;
  
    // Potentially, here you could fetch the collection name using the collection ID
    // For demonstration, I'm directly setting a default name based on ID being present
    if (collection) {
      setCollectionRecordId(collection);
      // Replace 'Default Collection Name' with a function to fetch the actual name using the collection ID if necessary
      setCollectionRecordName('Collection Records'); 
    }
  
    // Use the tab query parameter to update the active tab state
    if (tab) {
      setActiveTab(tab);
    }
  }, [router.query, setCollectionRecordId, setCollectionRecordName]);

   useEffect(() => {
    const handleRouteChange = (url) => {
      const fullUrl = `${window.location.origin}${url}`;
      const newTab = new URLSearchParams(new URL(fullUrl).search).get('tab');
      if (newTab) {
        setActiveTab(newTab);
      }
    };
  
    // Update the initial activeTab based on the current route
    const initialTab = new URLSearchParams(window.location.search).get('tab');
    if (initialTab) {
      setActiveTab(initialTab);
    }

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setCollectionRecordId('');
      setCollectionRecordName('');
      router.push(`${router.pathname}?tab=${tab}`, undefined, { shallow: true });
    }
  };



  return (
    <div className="dashboard">
      {loggedIn === false ? (
        <Button color="primary" href={`https://libtools2.smith.edu:4000/login?redirectTo=${currentPath}`}>
          Login
        </Button>
      ) : (
        <Container fluid>
          <Row>
            <Col md="12">
              <h1>Account Dashboard</h1>
              {/* Horizontal Tabs */}
              <Nav tabs>
                <NavItem>
                  <NavLink active={activeTab === 'favorites'} onClick={() => toggle('favorites')}>
                    Favorites
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink active={activeTab === 'collections'} onClick={() => toggle('collections')}>
                    Collections
                  </NavLink>
                </NavItem>
                {collectionRecordName !== '' && (
                  <NavItem>
                    <NavLink active={activeTab === 'collectionRecords'} onClick={() => toggle('collectionRecords')}>
                      {collectionRecordName}
                    </NavLink>
                  </NavItem>
                )}
              </Nav>

              {/* Content area */}
              <TabContent activeTab={activeTab}>
                <TabPane tabId="userInfo">
                      <UserInfo user={user} />
                </TabPane>
                <TabPane tabId="favorites">
                    {activeTab === 'favorites' ? (
                    <Favorites />
                    ) : (
                      ''
                    )}
                </TabPane>
                <TabPane tabId="collections">
                      {collectionRecordId === '' ?
                            <CollectionList collections={collections} />
                      : '' }
                </TabPane>
                {collectionRecordId !== '' && ( 
                <TabPane tabId="collectionRecords">
                        <Row>
                          <Col md="12">
                            <CollectionRecords />
                          </Col>
                        </Row>
                </TabPane>
                )}
              </TabContent>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}

export default Account;
