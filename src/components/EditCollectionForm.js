import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/store';
import { Form, FormGroup, Label, Input, Button, Container, Col, Row } from 'reactstrap';
import { toast } from 'react-toastify';

function EditCollectionForm({ collection, onCancel, onSuccess }) {
  const [editedCollection, setEditedCollection] = useState({
    name: '',
    description: '',
    public: 'Private',
    cover_image: '',
  });

  const [subjects, setSubjects] = useState(['']);
  const [loading, setLoading] = useState(true);

  const updateCollection = useStore((state) => state.updateCollection);
  const baseUrl = useStore((state) => state.baseUrl);

  // Load collection data and subjects on component mount
  useEffect(() => {
    if (collection) {
      setEditedCollection({
        name: collection.name || '',
        description: collection.description || '',
        public: collection.public || 'Private',
        cover_image: collection.cover_image || '',
      });
      
      // Handle subjects - they come nested in the collection object
      if (collection.subjects && collection.subjects.length > 0) {
        const subjectsList = collection.subjects.map(s => s.subject);
        setSubjects(subjectsList);
        setLoading(false);
      } else {
        // If no subjects, still need to fetch from API as fallback
        const fetchCollectionSubjects = async () => {
          try {
            const response = await axios.get(
              `${baseUrl}/collection_subjects/collection/${collection.collection_id}`,
              { withCredentials: true }
            );
            const subjectsList = response.data.map(s => s.subject);
            setSubjects(subjectsList.length > 0 ? subjectsList : ['']);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching collection subjects:', error);
            setSubjects(['']);
            setLoading(false);
          }
        };
        
        fetchCollectionSubjects();
      }
    }
  }, [collection, baseUrl]);

  const handleChange = (e) => {
    setEditedCollection({ ...editedCollection, [e.target.name]: e.target.value });
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
        name: editedCollection.name,
        description: editedCollection.description,
        public: editedCollection.public,
        cover_image: editedCollection.cover_image,
        subjects: validSubjects.map(subject => subject.trim())
      };

      const response = await axios.put(
        `${baseUrl}/collection_name/update/${collection.collection_id}`,
        collectionWithSubjects,
        { withCredentials: true }
      );

      if (response.data && response.data.success) {
        // Update Zustand store with the updated collection data
        updateCollection(collection.collection_id, response.data.updatedCollection);
        
        toast.success('Collection updated successfully', {
          autoClose: 2000,
          position: "top-right"
        });

        if (onSuccess) {
          onSuccess(response.data.updatedCollection);
        }
      } else {
        toast.error('Failed to update collection', {
          autoClose: false,
          position: "top-right"
        });
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      if (error.response && error.response.data) {
        toast.error(`An error occurred while updating the collection. Error: ${error.response.data.error || error.response.data}`, {
          autoClose: false,
          position: "top-right"
        });
      } else {
        toast.error('An error occurred while updating the collection', {
          autoClose: false,
          position: "top-right"
        });
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col sm="12" md={{ size: 10, offset: 0 }}>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input 
                type="text" 
                name="name" 
                id="name" 
                value={editedCollection.name} 
                onChange={handleChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input 
                type="textarea" 
                name="description" 
                id="description" 
                value={editedCollection.description} 
                onChange={handleChange} 
              />
            </FormGroup>
            <FormGroup>
              <Label for="public">Public</Label>
              <Input 
                type="select" 
                name="public" 
                id="public" 
                value={editedCollection.public} 
                onChange={handleChange}
              >
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
              <Button type="submit" color="primary">
                Update Collection
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default EditCollectionForm;
