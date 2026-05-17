import styles from './Inventory.module.css';

function Slot() {
  return <div className={styles.slot} />;
}

export default function Inventory() {
  return (
    <div className={styles.inventoryRow}>
      <span className={styles.sectionLabel}>Inventory</span>
      <div className={styles.slotGrid12x3}>
        {Array.from({ length: 36 }).map((_, i) => <Slot key={i} />)}
      </div>
    </div>
  );
}
