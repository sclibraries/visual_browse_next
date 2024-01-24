import React, { useState } from 'react';
import { useStore } from '../store/store';
import { useCollections } from '@/hooks/useCollections';
import { useAddToCollection } from '@/hooks/useAddToCollection';
import { useCurrentCollections } from '@/hooks/useCurrentCollections';
import { useRemoveFromCollection } from '@/hooks/useRemoveFromCollection';
import NewCollectionForm from './NewCollectionForm';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function CollectionsModal(props) {
const [modal, setModal] = useState(false);
const [collections, collectionAn, currentCollections] = useStore((state) => [state.collections, state.collectionAn, state.currentCollections]);
useCollections()   
useCurrentCollections(collectionAn);
const refreshCollections = useCollections(collectionAn);
const refreshCurrentCollections = useCurrentCollections(collectionAn);
const addToCollection = useAddToCollection(refreshCurrentCollections, refreshCollections);
const removeFromCollection = useRemoveFromCollection(refreshCurrentCollections, refreshCollections);



// Update the removeFromCollection function call
const handleRemoveFromCollection = (collection_records_id) => {
    removeFromCollection(collection_records_id);
};
const toggle = () => setModal(!modal);

const getCollectionRecordsId = (collectionId) => {
    const found = currentCollections.find(c => c.collection_id === collectionId);
    return found ? found.collection_records_id : null;
  }



  return (
    <div>
                <h2>Collections</h2>
                <Button color="primary" onClick={toggle}>New Collection</Button>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Collection Name</th>
                            <th>Description</th>
                            <th>Public/Private</th>
                            <th>Record Count</th>
                            <th>Views</th>
                            <th>Add</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collections.map((collection, index) => {
                            const collectionRecordsId = getCollectionRecordsId(collection.collection_id);
                            console.log(collectionRecordsId)
                            return(
                            <tr key={index}>
                            <td>{collection.name}</td>
                            <td>{collection.description}</td>
                            <td>{collection.public}</td>
                            <td>{collection.recordCount}</td>
                            <td>{collection.views}</td>
                            <td>
                            {collectionRecordsId ? (
                                <button className="btn btn-danger" onClick={e => handleRemoveFromCollection(collectionRecordsId)}>Remove</button>
                            ) : (
                                <button className="btn btn-primary" onClick={e => addToCollection(collection.collection_id, collectionAn)}>Add</button>
                            )}
                            </td>
                            </tr>
                            )
                        }
                        )} 
                    </tbody>
                </table>
        <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>New Collection</ModalHeader>
        <ModalBody>
            <NewCollectionForm />
        </ModalBody>
        <ModalFooter>
            <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
        </Modal>
    </div>
  )
}

export default CollectionsModal