// ImageUploadModal.js
import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../store/store';

function ImageUploadModal({ isOpen, toggle, record, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const baseUrl = useStore((state) => state.baseUrl);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('eds_id', record.an);
    formData.append('db_id', record.dbid);
    formData.append('user_id', record.user_id);

    try {
      await axios.post(`${baseUrl}/user_images/create`, formData, {
        withCredentials: true,
      });
      toast.success('Image uploaded successfully!');
      toggle();
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image.');
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        Upload Cover Image<br />
      </ModalHeader>
      <ModalBody>
        <p>If the cover image shown is incorrect or missing, please upload a new cover image.
          <br />Accepted file types: .jpg, .jpeg, .png, .gif
          <br />Maximum file size: 10MB
        </p>
        <input type="file" onChange={handleFileChange} accept="image/*" />
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-primary" onClick={handleUpload}>
          Upload
        </button>
        <button className="btn btn-secondary" onClick={toggle}>
          Cancel
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default ImageUploadModal;
