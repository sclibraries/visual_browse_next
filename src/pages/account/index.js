import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfo from './userInfo';
import CollectionList from './collections';
import NewCollectionForm from './newCollectionForm';
import { Button, Col, Row, Container, Nav, NavItem } from 'reactstrap';
import { useRouter } from 'next/router';
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';
import CollectionRecords from './collectionRecords';

function Account() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('userInfo');
  const currentPath = router.asPath;

  const [collections, setCollections, loggedIn, setLoggedIn, collectionRecordId, setCollectionRecordId, collectionRecordName, setCollectionRecordName] = useStore(
    (state) => [state.collections, state.setCollections, state.loggedIn, state.setLoggedIn, state.collectionRecordId, state.setCollectionRecordId, state.collectionRecordName, state.setCollectionRecordName],
    shallow
  );

  useEffect(() => {
    // Fetch user and collection data from the server
    axios
      .get('https://libtools2.smith.edu:4000/account/get-user-data', { withCredentials: true })
      .then((response) => {
        setUser(response.data);
        return axios.get(`https://libtools2.smith.edu:4000/collection_name/read-all`, { withCredentials: true });
      })
      .then((response) => {
        setCollections(response.data);
        setLoggedIn(true);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const toggle = (tab) => {
    setActiveTab(tab);
    setCollectionRecordId('');
    setCollectionRecordName('');
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
            {/* Fixed sidebar */}
            <Col md="3" className="fixed-left">
             <h1>Account Dashboard</h1>
             <Nav tabs vertical>
              <NavItem>
              <Button block color="primary" onClick={() => toggle('userInfo')}>
                User Info
              </Button>
              </NavItem>
              <br />
              <NavItem>
              <Button block color="primary" onClick={() => toggle('collections')}>
                Collections
              </Button>
              </NavItem>
              {collectionRecordName !== '' && (
                <>
                <br />
                <NavItem>
                <Button block color="primary" onClick={() => toggle('collectionRecords')}>
                  {collectionRecordName}
                </Button>
                </NavItem>
                </>
              )}
              </Nav>
            </Col>

            {/* Content area */}
            <Col sm="12" md="9" className="scrollable-middle">
              {activeTab === 'userInfo' && <UserInfo user={user} />}
              {activeTab === 'collections' && (
                <>
                {collectionRecordId === '' ? (
                <Row>
                  <Col md="5">
                    <NewCollectionForm />
                  </Col>
                  <Col md="7">
                    <CollectionList collections={collections} />
                  </Col>
                </Row>
                ) : (
                  <Row>
                    <Col md="12">
                      <CollectionRecords />
                    </Col>
                  </Row>
                )}
                </>
              )}
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}

export default Account;
