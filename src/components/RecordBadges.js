const { isEbook } = require('../utils/ebook.cjs');
const { isOpenAccess } = require('../utils/recordAccess.cjs');

const badgeStyle = {
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 700,
  lineHeight: 1.4,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

export default function RecordBadges({ record }) {
  const ebook = isEbook(record);
  const openAccess = isOpenAccess(record);
  if (!ebook && !openAccess) return null;

  return (
    <div role="group" aria-label="Format and access" style={{
      position: 'absolute', top: '8px', left: '8px', right: '8px',
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '6px',
      pointerEvents: 'none',
    }}>
      {ebook && <span style={{ ...badgeStyle, backgroundColor: '#164e63' }}>E-BOOK</span>}
      {openAccess && (
        <span style={{ ...badgeStyle, backgroundColor: '#166534' }}>
          <span aria-hidden="true">🔓 </span>OPEN ACCESS
        </span>
      )}
    </div>
  );
}
