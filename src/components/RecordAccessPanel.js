import { useId } from 'react';
import RecordAvailability from './RecordAvailability';
import styles from '../styles/RecordAccessPanel.module.css';

function RecordAccessPanel({ access }) {
  const headingId = useId();
  const hasHoldings = access?.type === 'holdings';
  const hasLink = access?.type === 'online' || access?.type === 'discovery';
  if (!hasHoldings && !hasLink) return null;

  const linkLabel = access.type === 'discovery'
    ? 'Check access in EBSCO Discovery'
    : access.label;

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h4 className={styles.heading} id={headingId}>
        <span aria-hidden="true">📍</span> Availability
      </h4>
      {hasHoldings && <RecordAvailability folioId={access.folioId} />}
      {hasLink && (
        <div>
          {access.openAccess && <p className={styles.openAccess}>Open access: free to read</p>}
          <a
            className={styles.link}
            href={access.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkLabel}<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      )}
    </section>
  );
}

export default RecordAccessPanel;
