import { useState } from 'react';
import { useStore } from '../../store/store';
import {  Form, FormGroup, Label, Input, Button, Container, Col, Row } from 'reactstrap';
import {toast} from 'react-toastify';
import { useAdminApi } from '../../lib/adminApi';

function NewCollectionForm() {
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    public: 'Private',
    cover_image: '',
  });

  const addCollection = useStore((state) => state.addCollection);

  const handleChange = (e) => {
    setNewCollection({ ...newCollection, [e.target.name]: e.target.value });
  };

  const { createCollection } = useAdminApi();

  const handleSubmit = (e) => {
    e.preventDefault();
    createCollection(newCollection)
      .then((response) => {
        if (response && typeof response === 'object') {
          // Update Zustand store with new collection
          addCollection(response);
          toast.success('Collection created successfully', {
            autoClose: 2000,
            position: "top-right"
          });
        } else {
          toast.error(`An error occurred while creating the collection.`, {
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
            <FormGroup>
              <Label for="cover_image">Cover Image</Label>
              <Input type="text" name="cover_image" id="cover_image" />
            </FormGroup>
            <Button type="submit">Create</Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default NewCollectionForm;
