// hooks/useRecordImage.js

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/store'; // Adjust the path as necessary

export function useRecordImage(record) {
  const [imageUrl, setImageUrl] = useState('');
  const baseUrl = useStore((state) => state.baseUrl);

  useEffect(() => {
    let isMounted = true;

    async function updateImage() {
      if (!record || Object.keys(record).length === 0) {
        setImageUrl('');
        return;
      }

      // Set initial image
      const initialImage = getInitialImage(record);
      if (isMounted) {
        setImageUrl(initialImage);
      }

      // Check for server image
      if (record.an) {
        const serverImageUrl = await checkServerForImage(record.an, baseUrl);
        if (serverImageUrl && isMounted) {
          setImageUrl(serverImageUrl);
        }
      }
    }

    updateImage();

    return () => {
      isMounted = false;
    };
  }, [record, baseUrl]);
  return imageUrl;
}

function getInitialImage(record) {
  if (!record || Object.keys(record).length === 0) {
    return '';
  }
  if (record.imageItem) {
    return record.imageItem;
  } else if (record.coverImage && record.coverImage.url) {
    return record.coverImage.url;
  } else if (
    record.tmdbSearch &&
    record.tmdbSearch.results &&
    record.tmdbSearch.results.length > 0 &&
    record.tmdbSearch.results[0].poster_path
  ) {
    return `https://image.tmdb.org/t/p/w500${record.tmdbSearch.results[0].poster_path}`;
  } else if (record.googleImages && record.googleImages.thumbnail_url) {
    return record.googleImages.thumbnail_url;
  }
  return ''; // Return an empty string or a placeholder image URL if no image is found
}

async function checkServerForImage(eds_id, baseUrl) {
  if (!eds_id) {
    return null;
  }
  try {
    const imageUrl = `${baseUrl}/user_images/image/${eds_id}`;

    // Use HEAD request to check if the image exists without downloading it
    const response = await axios.head(imageUrl);

    if (response.status === 200) {
      return imageUrl;
    } else {
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    } else {
      return null;
    }
  }
}
