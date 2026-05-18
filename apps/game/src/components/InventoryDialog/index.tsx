import styles from './InventoryDialog.module.css';
import QuickSlots from './QuickSlots';
import Inventory from './Inventory';
import type { InventoryItem } from '../../game/player/types';

interface InventoryDialogProps {
  inventory: InventoryItem[];
  onClose: () => void;
}

export default function InventoryDialog({ inventory, onClose }: InventoryDialogProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <span className={styles.title}>Inventory</span>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.body}>
          <QuickSlots />
          <Inventory inventory={inventory} />
        </div>
      </div>
    </div>
  );
}
