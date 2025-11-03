import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useStore } from '../../store/store';
import { Button, Card, CardBody, CardHeader, Row, Col, Badge, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { useAdminApi } from '../../lib/adminApi';

export default function AdminCustomizationPage() {
  const { collections = [] } = useStore(s => ({
    collections: s.collections || []
  }));
  const { ready, authorized } = useAuthRedirect();
  const { fetchColleges, fetchCollegeHomeSelections, saveCollegeHomeSelections } = useAdminApi();
  const [selectedCollege, setSelectedCollege] = useState('');
  const [localList, setLocalList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!ready || !authorized) return;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchColleges();
        if (!cancelled) setColleges(Array.isArray(list) ? list : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ready, authorized, fetchColleges]);

  useEffect(() => {
    let cancelled = false;
    if (!selectedCollege) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCollegeHomeSelections(selectedCollege);
        const ids = Array.isArray(data?.collectionIds)
          ? data.collectionIds
          : Array.isArray(data)
            ? data
            : [];
        if (!cancelled) setLocalList(ids);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCollege, fetchCollegeHomeSelections]);

  const toggleCollection = (collectionId) => {
    setLocalList(prev => prev.includes(collectionId) ? prev.filter(id => id !== collectionId) : [...prev, collectionId]);
  };

  const move = (idx, dir) => {
    setLocalList(prev => {
      const copy = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= copy.length) return prev;
      const [item] = copy.splice(idx, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const handleSave = async () => {
    if (!selectedCollege) return;
    try {
      setSaving(true);
      await saveCollegeHomeSelections(selectedCollege, localList);
      toast.success('Homepage collections saved');
    } catch (e) {
      toast.error('Failed to save selections');
    } finally {
      setSaving(false);
    }
  };

  if (!ready || !authorized || loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner color="primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="h3 mb-4">Admin: Home Page Customization</h1>

      <Row className="mb-4">
        <Col md="4">
          <Card>
            <CardHeader>Colleges</CardHeader>
            <CardBody style={{ maxHeight: 400, overflowY: 'auto' }}>
              {colleges.map(c => (
                <Button
                  key={c.id}
                  color={selectedCollege === c.id ? 'primary' : 'outline-primary'}
                  className="w-100 text-start mb-2"
                  onClick={() => setSelectedCollege(c.id)}
                >
                  {c.name}
                </Button>
              ))}
              {colleges.length === 0 && <p className="text-muted small mb-0">No colleges loaded.</p>}
            </CardBody>
          </Card>
        </Col>
        <Col md="8">
          {selectedCollege ? (
            <>
              <Card className="mb-4">
                <CardHeader>Selected Collections Order (Homepage)</CardHeader>
                <CardBody>
                  {localList.length === 0 && (
                    <p className="text-muted small">No collections selected yet. Choose from All Collections below.</p>
                  )}
                  {localList.map((id, idx) => {
                    const col = collections.find(c => c.collection_id === id) || {};
                    return (
                      <div key={id} className="d-flex align-items-center border rounded p-2 mb-2 bg-light">
                        <strong className="flex-grow-1">{col.collection_name || id}</strong>
                        <Badge color="secondary" className="me-2">{idx + 1}</Badge>
                        <div className="btn-group btn-group-sm me-2">
                          <Button color="outline-secondary" onClick={() => move(idx, -1)} disabled={idx === 0}>
                            <FontAwesomeIcon icon={faArrowUp} />
                          </Button>
                          <Button color="outline-secondary" onClick={() => move(idx, 1)} disabled={idx === localList.length - 1}>
                            <FontAwesomeIcon icon={faArrowDown} />
                          </Button>
                        </div>
                        <Button color="outline-danger" size="sm" onClick={() => toggleCollection(id)}>
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </div>
                    );
                  })}
                  {localList.length > 0 && (
                    <div className="text-end mt-3">
                      <Button color="success" onClick={handleSave} disabled={saving}>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        {saving ? 'Saving...' : 'Save Order'}
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>All Collections</CardHeader>
                <CardBody style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {collections.map(col => {
                    const selected = localList.includes(col.collection_id);
                    return (
                      <div key={col.collection_id} className="d-flex align-items-center justify-content-between border rounded p-2 mb-2">
                        <div className="d-flex flex-column">
                          <strong>{col.collection_name}</strong>
                          {col.description && (
                            <span className="text-muted small" style={{ maxWidth: 400 }}>{col.description}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          color={selected ? 'danger' : 'primary'}
                          onClick={() => toggleCollection(col.collection_id)}
                        >
                          {selected ? 'Remove' : 'Add'}
                        </Button>
                      </div>
                    );
                  })}
                  {collections.length === 0 && <p className="text-muted small mb-0">No collections available.</p>}
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody>
                <p className="text-muted mb-0">Select a college on the left to configure its homepage collections.</p>
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </AdminLayout>
  );
}
