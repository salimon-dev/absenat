import { Fragment } from 'react';
import styles from './QuickSlots.module.css';

function Slot() {
  return <div className={styles.slot} />;
}

export default function QuickSlots() {
  return (
    <div className={styles.quickSlots}>
      <span className={styles.sectionLabel}>Quick Slots</span>
      {[1, 2, 3, 4].map((set, idx) => (
        <Fragment key={set}>
          {idx > 0 && <div className={styles.groupDivider} />}
          <div className={styles.group}>
            <span className={styles.groupLabel}>{set}</span>
            <div className={styles.slotRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Slot key={i} />
              ))}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
