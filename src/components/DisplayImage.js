import { useQuery } from '@apollo/client';
import { GET_RECORD } from '../lib/api';
import RecordCoverImage from './RecordCoverImage';
import { useRecordImage } from '../hooks/useRecordImage';
import PlaceholderCover from './PlaceholderCover';
import { getMaterialType } from '../utils/materialTypeUtils';
import { useEffect } from 'react';

const { getPlaceholderCoverConfig } = require('../utils/placeholderCover.cjs');

export const DisplayImage = ({ an, refresh, materialType: materialTypeHint, collectionSlug }) => {
  const anVariable = an ? an.replace(/-/g, '.') : '';
  const { data, error, loading, refetch } = useQuery(GET_RECORD, {
    variables: {
      an: `scf.oai.edge.fivecolleges.folio.ebsco.com.fs00001006.${anVariable}`,
      dbid: 'cat09206a',
    },
  });

  useEffect(() => {
    if (refresh) {
      console.log('Refreshing image');
      refetch();
    }
  }, [refresh, refetch]);

  // Extract record data
  const record = data?.record?.records || null;

  // Use the custom hook to get the image URL
  const imageUrl = useRecordImage(record);

  // Get the title for alt text
  const title =
    record?.titles?.[0]?.TitleFull ||
    data?.titleItem?.toString() ||
    'No Title';

  // Handle loading state
  if (loading) {
    return (
      <svg
        className="bd-placeholder-img card-img-top"
        width="100%"
        height="300"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Placeholder: Loading image"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <rect width="100%" height="100%" fill="#868e96"></rect>
      </svg>
    );
  }

  // Handle error state
  if (error) {
    return (
      <svg
        className="bd-placeholder-img card-img-top"
        width="100%"
        height="300"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Placeholder: Error loading image"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <rect width="100%" height="100%" fill="#868e96"></rect>
      </svg>
    );
  }

  // Render image or placeholder
  const materialType = materialTypeHint || (record ? getMaterialType(record)?.label : '');
  const placeholderCover = getPlaceholderCoverConfig({
    materialType,
    pubType: record?.pubType,
    collectionSlug,
  });

  return imageUrl && imageUrl !== '' ? (
    <RecordCoverImage src={imageUrl} alt={title} />
  ) : (
    <PlaceholderCover {...placeholderCover} ariaLabel={`No cover for ${title}`} />
  );
};
