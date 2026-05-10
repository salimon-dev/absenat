import styles from './InventoryDialog.module.css';
import Stats from './Stats';
import QuickSlots from './QuickSlots';
import Inventory from './Inventory';

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
            <Stats />
            <QuickSlots />
          </div>
          <Inventory />
        </div>
      </div>
    </div>
  );
}
