import { useState } from 'react';

// Keep the existing card frame; enlarge small scans by no more than 2×.
export default function RecordCoverImage({ src, alt }) {
  const [dimensions, setDimensions] = useState(null);
  const loaded = dimensions && dimensions.src === src;

  return (
    <span style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      backgroundColor: '#f3f2ef',
      borderRadius: 'inherit',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Intrinsic dimensions control enlargement; these images were already unoptimized. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={({ currentTarget }) => setDimensions({
          src,
          width: currentTarget.naturalWidth,
          height: currentTarget.naturalHeight,
        })}
        style={{
          display: 'block',
          width: loaded ? dimensions.width * 2 : 'auto',
          height: loaded ? dimensions.height * 2 : 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          minWidth: 0,
          minHeight: 0,
          objectFit: 'contain',
          objectPosition: 'center',
          borderRadius: 2,
          transform: 'none',
        }}
      />
    </span>
  );
}
