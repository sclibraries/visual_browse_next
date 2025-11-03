const PlaceholderCover = ({
  height = 180,
  icon = '📚',
  message = 'No Image Available',
  ariaLabel = 'No image available',
}) => {
  return (
    <div
      className="bd-placeholder-img card-img-top"
      role="img"
      aria-label={ariaLabel}
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ fontSize: '2.5rem', opacity: 0.6 }}>{icon}</div>
      <div
        style={{
          color: '#6c757d',
          fontSize: '0.875rem',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default PlaceholderCover;
