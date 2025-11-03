// Favorites Component
import { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import {useFetchFavoriteData} from '../../hooks/useFetchFavoriteData';
import { GET_RECORD } from '../../lib/api';
import { useQuery } from '@apollo/client';
import { shallow } from 'zustand/shallow';
import { toast } from 'react-toastify';
// import axios from 'axios';
import { Table } from 'reactstrap'
import Image from 'next/image'
import {useRecordImage} from '../../hooks/useRecordImage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faEye, faUpload, faTrash } from '@fortawesome/free-solid-svg-icons'
import ImageUploadModal from '../../components/ImageUploadModal'
import AdminLayout from '../../layouts/AdminLayout'
import { useAdminApi } from '../../lib/adminApi'

const LIMIT = 20; // The number of records to fetch per page

// Add this just above function Favorites()
function FavoriteRow({ an, dbid, folio_id, handleDeleteRecord }) {
  const [setAn, setDbid, setRecordModal] = useStore(
    state => [state.setAn, state.setDbid, state.setRecordModal],
    shallow
  )
  const [imageError, setImageError] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const { loading, error, data } = useQuery(GET_RECORD, { variables: { an, dbid } })
  const record = data?.record?.records || {}
  const image = useRecordImage(record)
  const titleFull = record.titles?.[0]?.TitleFull || 'No Title'
  const author = record.items?.find(item => item.label === 'Authors')?.data || ''

  const viewRecord = () => {
    setAn(an); setDbid(dbid); setRecordModal(true)
  }
  const toggleUpload = () => setShowUpload(prev => !prev)

  if (loading) return (
    <tr>
      <td colSpan={4}>Loading…</td>
    </tr>
  )

  if (error) return (
    <>
      {showUpload && (
        <ImageUploadModal
          isOpen={showUpload}
          toggle={toggleUpload}
          record={{ an, dbid }}
        />
      )}
      <tr>
        <td colSpan={3} className="text-danger">Error loading record</td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-danger btn-sm" title="Remove from Favorites" onClick={() => handleDeleteRecord(an, folio_id)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </td>
      </tr>
    </>
  )

  return (
    <>
      {showUpload && (
        <ImageUploadModal
          isOpen={showUpload}
          toggle={toggleUpload}
          record={{ an, dbid }}
        />
      )}
      <tr>
        <td style={{ cursor: 'pointer', width: 60 }} onClick={viewRecord}>
          {image && !imageError
            ? <Image src={image} alt={titleFull} width={40} height={60} onError={() => setImageError(true)} unoptimized />
            : <FontAwesomeIcon icon={faBook} size="2x" />}
        </td>
        <td style={{ cursor: 'pointer' }} onClick={viewRecord}>
          {titleFull}
        </td>
        <td style={{ cursor: 'pointer' }} onClick={viewRecord}>
          {author}
        </td>
        <td>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-primary btn-sm" title="View" onClick={viewRecord}>
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button className="btn btn-secondary btn-sm" title="Upload Image" onClick={toggleUpload}>
              <FontAwesomeIcon icon={faUpload} />
            </button>
            <button className="btn btn-danger btn-sm" title="Remove from Favorites" onClick={() => handleDeleteRecord(an, folio_id)}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

function Favorites() {
  // const baseUrl = useStore((state) => state.baseUrl);
  const { removeFavorite: removeFavoriteApi } = useAdminApi();
  const { loading, error, hasMore, favorites, loadMore, removeFavorite } = useFetchFavoriteData(LIMIT);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const handleClickLoadMore = () => {
    setIsFetchingMore(true); // Indicate that the next batch of records is loading
    loadMore();
  }

  const handleDeleteRecord = (eds_id, folio_id) => {
    removeFavoriteApi(eds_id, folio_id)
      .then(() => {
        removeFavorite(folio_id);
        toast.success(`Item removed from favorites.`);
      })
      .catch((error) => {
        toast.error(`Error removing item from favorites: ${error.message}`);
      });
  };


  useEffect(() => {
    if (!loading) {
      setIsFetchingMore(false); // Set this after new data is fetched
    }
  }, [loading]);

  if (loading && !isFetchingMore) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const recordsToDisplay = favorites ?? [];


return (
  <AdminLayout>
    <div className="container">
      <div className="hide-scrollbar flex-1 h-100 container">
        <div className="row row-cols-* g-4" style={{marginTop: "30px"}}>
          {recordsToDisplay.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th width="60">Cover</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th width="120">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recordsToDisplay.map(r => (
                  <FavoriteRow
                    key={r.folio_id}
                    an={r.eds_id}
                    dbid={r.dbid}
                    folio_id={r.folio_id}
                    handleDeleteRecord={handleDeleteRecord}
                  />
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No favorites found :(</p>
          )}
        </div>
        <div>
          {!isFetchingMore && hasMore && (
            <div className="d-grid gap-2 list" style={{paddingTop: "20px", paddingBottom: "50px"}}>
              <button
                className={"btn btn-primary"}
                onClick={handleClickLoadMore} disabled={loading}>
                Load More
              </button>
            </div>
          )}
          {isFetchingMore && <p>Loading more...</p>}
        </div>
      </div>
    </div>
  </AdminLayout>
);
}

export default Favorites;
