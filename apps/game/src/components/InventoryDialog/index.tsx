import styles from './InventoryDialog.module.css';
import QuickSlots from './QuickSlots';
import Inventory from './Inventory';
import type {
  InventoryItem,
  QuickSlotsSnapshot,
  RemoveInventoryItemPayload
} from '../../game/player/types';

interface InventoryDialogProps {
  inventory: InventoryItem[];
  quickSlots?: QuickSlotsSnapshot;
  onClose: () => void;
  onInventoryRequest: () => void;
  onInventoryRemove: (payload: RemoveInventoryItemPayload) => void;
  onQuickSlotSetSelect: (setId: number) => void;
}

export default function InventoryDialog({
  inventory,
  quickSlots,
  onClose,
  onInventoryRequest,
  onInventoryRemove,
  onQuickSlotSetSelect
}: InventoryDialogProps) {
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
          <QuickSlots quickSlots={quickSlots} onQuickSlotSetSelect={onQuickSlotSetSelect} />
          <Inventory
            inventory={inventory}
            onInventoryRequest={onInventoryRequest}
            onInventoryRemove={onInventoryRemove}
          />
        </div>
      </div>
    </div>
  );
}
