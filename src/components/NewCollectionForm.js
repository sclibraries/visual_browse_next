import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import {  Form, FormGroup, Label, Input, Button, Container, Col, Row } from 'reactstrap';
import {toast} from 'react-toastify';

function NewCollectionForm() {
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    public: 'Private',
    cover_image: '',
  });

  const addCollection = useStore((state) => state.addCollection);
  const baseUrl = useStore((state) => state.baseUrl);

  const handleChange = (e) => {
    setNewCollection({ ...newCollection, [e.target.name]: e.target.value });
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${baseUrl}/collection_name/create`, newCollection, { withCredentials: true })
      .then((response) => {
        console.log('New collection created:', response.data);
        if (response.data && typeof response.data === 'object') {
          // Update Zustand store with new collection
          addCollection(response.data);
          toast.success('Collection created successfully', {
            autoClose: 2000,
            position: "top-right"
          });
        } else {
          console.error('Unexpected response data:', response.data);
          toast.error(`An error occurred while creating the collection. Error message: ${response.data}`, {
            autoClose: 2000,
            position: "top-right"
          });
        }
        // Reset form
        setNewCollection({
          name: '',
          description: '',
          public: 'Private',
        });
      })
      .catch((error) => {
        console.error('Error creating new collection:', error);
        if (error.response && error.response.data) {
          // Handle error response
          console.error('Error details:', error.response.data);
          toast.error(`An error occurred while creating the collection. Error message: ${error.response.data}`, {
            autoClose: false,
            position: "top-right"
          });
        }
      });
  };
  
  return (
    <Container>
      <Row>
        <Col sm="12" md={{ size: 10, offset: 0 }}>
          <h2>Create New Collection</h2>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input type="text" name="name" id="name" value={newCollection.name} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input type="textarea" name="description" id="description" value={newCollection.description} onChange={handleChange} />
            </FormGroup>
            <FormGroup>
              <Label for="public">Public</Label>
              <Input type="select" name="public" id="public" value={newCollection.public} onChange={handleChange}>
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </Input>
            </FormGroup>
            <Button type="submit">Create</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default NewCollectionForm;
