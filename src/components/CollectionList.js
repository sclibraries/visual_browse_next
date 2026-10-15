// components/CollectionList.js
import { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label
} from 'reactstrap';
import axios from 'axios';
import { useStore } from '../store/store';
import { useShallow } from 'zustand/react/shallow';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import NewCollectionForm from './NewCollectionForm';
import Image from 'next/image';

function CollectionList() {
    const router = useRouter();
  const [isEditing, setIsEditing] = useState(null); 
  const [editingValues, setEditingValues] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [collections, setCollections, baseUrl, setCollectionRecordId, setCollectionRecordName, updateCollection, setCollectionCoverImage] = useStore(useShallow((state) => [
    state.collections, state.setCollections, state.baseUrl, state.setCollectionRecordId, state.setCollectionRecordName, state.updateCollection, state.setCollectionCoverImage
  ]));

  const handleEdit = (collectionId) => {
    setIsEditing(collectionId);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
};

  const handleSave = async (collectionId) => {
    try {
      const response = await axios.put(
        `${baseUrl}/collection_name/update/${collectionId}`,
        editingValues,
        { withCredentials: true }
      );

      if (response.data.success) {
        updateCollection(collectionId, response.data.updatedCollection);
        setIsEditing(null);
        toast.success('Collection updated successfully', {
          autoClose: 2000,
          position: "top-right"
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      toast.error('An error occurred while updating the collection', {
        autoClose: 2000,
        position: "top-right"
      });
    }
  };
  

  const handleDelete = async (collection) => {
    try {
      const response = await axios.delete(`${baseUrl}/collection_name/delete/${collection.collection_id}`, { withCredentials: true });

      if (response.data.success && response.data.success === true) {
        // Remove the deleted collection from the state
        const updatedCollections = collections.filter(c => c.collection_id !== collection.collection_id);
        setCollections(updatedCollections); // Assume you have a function to update the state
        toast.success('Collection deleted successfully', {
          autoClose: 2000,
          position: "top-right"
        });
      } else {
        toast.error(`An error occurred while deleting the collection. Error message is ${response.data.message}`, {
          autoClose: false,
          position: "top-right"
        });
      }
    } catch (error) {
      console.error(error.response.data.message)
        toast.error(`${error.response.data.message}`, {
          autoClose: false,
          position: "top-right"
        });

    }
  };

  const handleCollectionRecordId = (id, name, cover_image) => {
    setCollectionRecordId(id);
    setCollectionRecordName(name);
    setCollectionCoverImage(cover_image || '');
    router.push(`/account?tab=collectionRecords&collection=${id}`);
  }
  
  const filteredCollections = useMemo(() => {
    return collections.filter(collection => 
      collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);

  const handleEmptyCollection = async (collection) => {
    if (window.confirm('Are you sure you want to empty this collection? It will not be recoverable.')) {
      try {
        const response = await axios.delete(`${baseUrl}/collection_name/clear-collection/${collection.collection_id}`, { withCredentials: true });
        if (response.data.success && response.data.success === true) {
          //update zustand store with new collection data from result
          updateCollection(collection.collection_id, response.data.data);
          toast.success(response.data.message, {
            autoClose: 2000,
            position: "top-right"
          });
        } else {
          toast.error(`An error occurred while emptying the collection. Error message is ${response.data.message}`, {
            autoClose: false,
            position: "top-right"
          });
        }
      } catch (error) {

        toast.error(`${error}`, {
          autoClose: false,
          position: "top-right"
        });

      }
    }
  }


  return (
    <div className="collection-list mt-4">
      <Row className="mb-3">
        <Col md="6">
          <Input
            type="text"
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
        <Col md="6" className="text-right">
          <Button color="primary" onClick={toggleModal}>
            Create New Collection
          </Button>
        </Col>
      </Row>
      <div style={{marginTop: "20px"}}>
            <Modal isOpen={isModalOpen} toggle={toggleModal}>
              <ModalHeader toggle={toggleModal}>Create New Collection</ModalHeader>
                <ModalBody>
                   <NewCollectionForm />
                 </ModalBody>
            </Modal>
        </div>
      <Row>
        {collections && collections.length > 0 ? (
          filteredCollections.map((collection) => (
            <Col md="3" key={collection.collection_id} className="mb-4">
              <Card>
                <CardHeader>{collection.name}</CardHeader>
                {!collection.cover_image ?
                    <svg 
                      className="bd-placeholder-img card-img-top" 
                      width="100%" 
                      height="248" 
                      xmlns="http://www.w3.org/2000/svg" 
                      role="img" 
                      preserveAspectRatio="xMidYMid slice" 
                      focusable="false"
                    >
                      <title>{collection.name}</title>
                      <rect width="100%" height="100%" fill="#d6d6d6"></rect>
                    </svg>
                    :
                  <Image 
                    src={collection.cover_image} 
                    alt={collection.name} 
                    layout="responsive"
                    width={500}
                    height={300}
                    className="card-img-top"
                    objectFit="contain"
                    priority={true}
                    unoptimized={true} 
                    />
                  }
                  <CardBody>
                  {isEditing === collection.collection_id ? (
                      <>
                      <FormGroup>
                        <Label for="collectionName">Collection Name</Label>
                        <Input type="text" defaultValue={collection.name} onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })} />
                     </FormGroup>
                    <FormGroup>
                        <Label for="collectionDescription">Collection Description</Label>
                        <Input type="textarea" defaultValue={collection.description} onChange={(e) => setEditingValues({ ...editingValues, description: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="publicPrivate">Public/Private</Label>
                        <Input type="select" defaultValue={collection.public} onChange={(e) => setEditingValues({ ...editingValues, public: e.target.value })}>
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label for="collectionCover">Collection Cover Image</Label>
                        <Input type="text" defaultValue={collection.cover_image} onChange={(e) => setEditingValues({ ...editingValues, cover_image: e.target.value })} />
                    </FormGroup>
                        <br />
                        <Button color="primary" onClick={() => {
                          handleSave(collection.collection_id, editingValues);
                        }}>Save</Button>{' '}
                        <Button color="danger" onClick={() => setIsEditing(null)}>Cancel</Button>{' '}

                      </>
                    ) : (
                      <>
                    <p><strong>Description:</strong> {collection.description}</p>
                    <p><strong>Public:</strong> {collection.public === 'Public' ? 'Public' : 'Private'}</p>
                    <p><strong>Views:</strong> {collection.views}</p>
                    <p><strong>Created:</strong>{collection.timestamp}</p>
                    <p><strong>Collection cover image:</strong>{collection.cover_image}</p>
                    <p><Badge color="success">{collection.recordCount} Records</Badge></p>
                    <Button size="sm" color="primary" onClick={() => handleEdit(collection.collection_id)}>Edit</Button>{' '}
                    <Button size="sm" color="primary" onClick={() => handleCollectionRecordId(collection.collection_id, 'Collection Records', collection.cover_image)}>View Records</Button>{' '}
                    <Button
                      size="sm"
                      color="danger"
                      disabled={collection.records && collection.records.length > 0}
                      onClick={() => handleDelete(collection)}
                    >
                      Delete
                    </Button>
                    <div style={{paddingTop: "10px"}}>
                    <Button 
                      size="sm"
                      color="danger"
                      onClick={() => handleEmptyCollection(collection)}
                      >
                        Empty Collection
                      </Button>
                    </div>
                    </>
                    )}
                  </CardBody>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p>No collections found :(</p>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default CollectionList;
