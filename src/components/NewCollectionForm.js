import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import {  Form, FormGroup, Label, Input, Button, Container, Col, Row } from 'reactstrap';

function NewCollectionForm() {
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    public: 'no',
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
        } else {
          console.error('Unexpected response data:', response.data);
        }
        // Reset form
        setNewCollection({
          name: '',
          description: '',
          public: 'no',
        });
      })
      .catch((error) => {
        console.error('Error creating new collection:', error);
        if (error.response && error.response.data) {
          // Handle error response
          console.error('Error details:', error.response.data);
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
                <option value="Private">No</option>
                <option value="Public">Yes</option>
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
