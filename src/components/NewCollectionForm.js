import { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import {  Form, FormGroup, Label, Input, Button, Container, Col, Row } from 'reactstrap';
import {toast} from 'react-toastify';

function NewCollectionForm({ onCancel }) {
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    public: 'Private',
    cover_image: '',
  });

  const [subjects, setSubjects] = useState(['']);

  const addCollection = useStore((state) => state.addCollection);
  const baseUrl = useStore((state) => state.baseUrl);

  const handleChange = (e) => {
    setNewCollection({ ...newCollection, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = value;
    setSubjects(updatedSubjects);
  };

  const addSubjectField = () => {
    setSubjects([...subjects, '']);
  };

  const removeSubjectField = (index) => {
    if (subjects.length > 1) {
      const updatedSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(updatedSubjects);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare collection data with subjects
      const validSubjects = subjects.filter(subject => subject.trim() !== '');
      const collectionWithSubjects = {
        ...newCollection,
        subjects: validSubjects.map(subject => subject.trim())
      };

      const response = await axios.post(`${baseUrl}/collection_name/create`, collectionWithSubjects, { withCredentials: true });
      
      console.log('New collection created:', response.data);
      if (response.data && typeof response.data === 'object') {
        // Update Zustand store with new collection
        addCollection(response.data);
        toast.success('Collection created successfully', {
          autoClose: 2000,
          position: "top-right"
        });
        
        // Reset form
        setNewCollection({
          name: '',
          description: '',
          public: 'Private',
          cover_image: '',
        });
        setSubjects(['']);
        
        // Close modal if onCancel function is provided
        if (onCancel) {
          onCancel();
        }
      } else {
        console.error('Unexpected response data:', response.data);
        toast.error(`An error occurred while creating the collection. Error message: ${response.data}`, {
          autoClose: 2000,
          position: "top-right"
        });
      }
    } catch (error) {
      console.error('Error creating new collection:', error);
      if (error.response && error.response.data) {
        // Handle error response
        console.error('Error details:', error.response.data);
        toast.error(`An error occurred while creating the collection. Error message: ${error.response.data}`, {
          autoClose: false,
          position: "top-right"
        });
      }
    }
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
              <Label>Subjects</Label>
              <small className="form-text text-muted mb-2">
                Add subjects one at a time. Click &quot;Add Subject&quot; to add multiple subjects.
              </small>
              {subjects.map((subject, index) => (
                <div key={index} style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
                  <Input
                    type="text"
                    value={subject}
                    onChange={(e) => handleSubjectChange(index, e.target.value)}
                    placeholder={`Subject ${index + 1}`}
                    style={{ marginRight: '8px' }}
                  />
                  {subjects.length > 1 && (
                    <Button
                      type="button"
                      color="danger"
                      size="sm"
                      onClick={() => removeSubjectField(index)}
                      style={{ marginRight: '8px' }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                color="secondary"
                size="sm"
                onClick={addSubjectField}
                style={{ marginTop: '8px' }}
              >
                + Add Subject
              </Button>
            </FormGroup>
            <div className="d-flex justify-content-end gap-2 mt-4">
              {onCancel && (
                <Button type="button" color="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" color="primary">Create</Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default NewCollectionForm;
