import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge
} from 'reactstrap';
import axios from 'axios';
import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';
import NotificationToast from '@/components/NotificationToast';

function CollectionList() {

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); 
  
  const [collections, setCollections, baseUrl, setCollectionRecordId, setCollectionRecordName] = useStore((state) => [
    state.collections, state.setCollections, state.baseUrl, state.setCollectionRecordId, state.setCollectionRecordName
  ], shallow);


  const toggleToast = () => {
    setToastOpen(!toastOpen);
  };

  const handleSuccess = () => {
    setToastMessage('Operation was successful.');
    setToastType('success');
    setToastOpen(true);
  };

  const handleError = (message) => {
    setToastMessage(message);
    setToastType('error');
    setToastOpen(true);
  };
  
  
  const handleUpdate = (collection) => {
    // Implement your update logic here
    console.log('Updating collection:', collection);
  };

  const handleDelete = async (collection) => {
    try {
      const response = await axios.delete(`${baseUrl}/collection_name/delete/${collection.collection_id}`, { withCredentials: true });

      if (response.data.success && response.data.success === true) {
        // Remove the deleted collection from the state
        const updatedCollections = collections.filter(c => c.collection_id !== collection.collection_id);
        setCollections(updatedCollections); // Assume you have a function to update the state
        handleSuccess();
      } else {
        // Show an error message from the server
        handleError(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      handleError("An error occurred while deleting the collection");

    }
  };

  const handleCollectionRecordId = (id, name) => {
    setCollectionRecordId(id);
    setCollectionRecordName(name);
  }
  



  return (
    <Container>
      <Row>
        <Col>
          <h2>Your Collections</h2>
          <ListGroup>
            {collections.map((collection) => (
              <ListGroupItem key={collection.collection_id}>
                <Card>
                  <CardHeader>{collection.name}</CardHeader>
                  <CardBody>
                    <p><strong>Description:</strong> {collection.description}</p>
                    <p><strong>Public:</strong> {collection.public === 'yes' ? 'Yes' : 'No'}</p>
                    <p><strong>Views:</strong> {collection.views}</p>
                    <p><Badge color="success">{collection.recordCount} Records</Badge></p>
                    {/* Add more fields here */}
                    <Button color="primary" onClick={() => handleCollectionRecordId(collection.collection_id, collection.name)}>View Records</Button>{' '}
                    <Button color="primary" onClick={() => handleUpdate(collection)}>Update</Button>{' '}
                    <Button
                      color="danger"
                      disabled={collection.records && collection.records.length > 0}
                      onClick={() => handleDelete(collection)}
                    >
                      Delete
                    </Button>
                  </CardBody>
                </Card>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default CollectionList;
