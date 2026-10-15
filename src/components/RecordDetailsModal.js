import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col } from 'reactstrap';
import { decode } from 'html-entities';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

const RecordDetailsModal = ({ isOpen, toggle, recordData, image }) => {
  const [imageAspectRatio, setImageAspectRatio] = useState(2 / 3);

  useEffect(() => {
    const type = String(recordData?.pubType || '').toLowerCase();
    const fallbackAspectRatio =
      type.includes('sound recording') ||
      type.includes('audio') ||
      type.includes('music') ||
      type.includes('compact disc') ||
      type.includes('cd')
        ? 1
        : 2 / 3;

    if (!image) {
      setImageAspectRatio(fallbackAspectRatio);
      return;
    }

    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (cancelled) {
        return;
      }

      const width = probe.naturalWidth || 0;
      const height = probe.naturalHeight || 0;
      if (!width || !height) {
        setImageAspectRatio(fallbackAspectRatio);
        return;
      }

      const detectedRatio = width / height;
      setImageAspectRatio(Math.min(Math.max(detectedRatio, 0.55), 1.4));
    };

    probe.onerror = () => {
      if (!cancelled) {
        setImageAspectRatio(fallbackAspectRatio);
      }
    };

    probe.src = image;

    return () => {
      cancelled = true;
    };
  }, [image, recordData?.pubType]);

  if (!recordData || !recordData.itemsRaw) {
    return (
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Record Details</ModalHeader>
        <ModalBody>
          <p>No record data available.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }

  const titleFull = recordData.titles?.[0]?.TitleFull || 'No Title';

  // Filter out some fields we don't want to display or want to display specially
  const filteredFields = recordData.itemsRaw.filter(item => 
    !['Title', 'AN', 'NumberOther'].includes(item.name) // Skip these fields
  );

  // Group fields by importance/relevance
  const primaryFields = filteredFields.filter(item => 
    ['Author', 'PubInfo', 'DatePub', 'PhysDesc', 'TypePub', 'TypeDocument'].includes(item.name)
  );

  const detailFields = filteredFields.filter(item => 
    !primaryFields.some(pf => pf.name === item.name)
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>Record Details</ModalHeader>
      <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Row>
          {/* Left column - Image and basic info */}
          <Col md="4">
            <div className="text-center mb-3">
              <div
                style={{
                  width: '220px',
                  maxWidth: '100%',
                  aspectRatio: `${imageAspectRatio} / 1`,
                  margin: '0 auto',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={titleFull}
                    fill
                    sizes="220px"
                    style={{ objectFit: 'contain' }}
                    unoptimized={true}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center bg-light"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <FontAwesomeIcon icon={faBook} size="3x" style={{ color: '#adb5bd' }} />
                  </div>
                )}
              </div>
            </div>
            
            <h5 className="mb-3">{titleFull}</h5>
            
            {/* Primary fields */}
            {primaryFields.map((item, index) => (
              <div key={index} className="mb-2">
                <strong>{item.label}:</strong>
                <div 
                  style={{ fontSize: '0.9rem', marginTop: '2px' }}
                  dangerouslySetInnerHTML={{
                    __html: decode(item.data, { level: 'html5' })
                  }}
                />
              </div>
            ))}
          </Col>
          
          {/* Right column - Detailed metadata */}
          <Col md="8">
            <h6 className="mb-3 text-muted">Additional Metadata</h6>
            
            {detailFields.map((item, index) => (
              <div key={index} className="mb-3 border-bottom pb-2">
                <dt className="h6 mb-1">{item.label}</dt>
                <dd 
                  className="mb-0"
                  style={{ fontSize: '0.9rem' }}
                  dangerouslySetInnerHTML={{
                    __html: decode(item.data, { level: 'html5' })
                  }}
                />
              </div>
            ))}

            {/* Display some additional raw data if available */}
            {recordData.isbn && recordData.isbn.length > 0 && (
              <div className="mb-3 border-bottom pb-2">
                <dt className="h6 mb-1">ISBN</dt>
                <dd className="mb-0" style={{ fontSize: '0.9rem' }}>
                  {recordData.isbn.join(', ')}
                </dd>
              </div>
            )}

            {recordData.an && (
              <div className="mb-3">
                <dt className="h6 mb-1">Accession Number</dt>
                <dd className="mb-0" style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {recordData.an}
                </dd>
              </div>
            )}
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default RecordDetailsModal;
