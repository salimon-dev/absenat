import styles from './InventoryDialog.module.css';

function Slot({ className }: { className?: string }) {
  return <div className={`${styles.slot} ${className ?? ''}`} />;
}

export default function InventoryDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <span className={styles.title}>Inventory</span>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.body}>
          <div className={styles.topRow}>
            <div className={styles.stats}>
              <span className={styles.sectionLabel}>Stats</span>
            </div>
            <div className={styles.quickSlots}>
              <span className={styles.sectionLabel}>Quick Slots</span>
              <div className={styles.slotGrid4x4}>
                {Array.from({ length: 16 }).map((_, i) => <Slot key={i} />)}
              </div>
            </div>
          </div>
          <div className={styles.inventoryRow}>
            <span className={styles.sectionLabel}>Inventory</span>
            <div className={styles.slotGrid12x3}>
              {Array.from({ length: 36 }).map((_, i) => <Slot key={i} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
