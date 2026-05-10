import styles from './QuickSlots.module.css';

function Slot() {
  return <div className={styles.slot} />;
}

export default function QuickSlots() {
  return (
    <div className={styles.quickSlots}>
      <span className={styles.sectionLabel}>Quick Slots</span>
      {[1, 2, 3, 4].map(set => (
        <div key={set} className={styles.row}>
          <span className={styles.rowLabel}>{set}</span>
          <div className={styles.slotRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Slot key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
