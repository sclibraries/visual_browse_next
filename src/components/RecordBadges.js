const { isEbook } = require('../utils/ebook.cjs');

const badgeStyle = {
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 700,
  lineHeight: 1.4,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

export default function RecordBadges({ record, isOpenAccess = false }) {
  const ebook = isEbook(record);
  if (!ebook && !isOpenAccess) return null;

  return (
    <div aria-label="Format and access" style={{
      position: 'absolute', top: '8px', left: '8px', right: '8px',
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '6px',
      zIndex: 10, pointerEvents: 'none',
    }}>
      {ebook && <span style={{ ...badgeStyle, backgroundColor: '#164e63' }}>E-BOOK</span>}
      {isOpenAccess && (
        <span style={{ ...badgeStyle, backgroundColor: '#166534' }}>
          <span aria-hidden="true">🔓 </span>OPEN ACCESS
        </span>
      )}
    </div>
  );
}
