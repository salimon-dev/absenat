import styles from './InventoryDialog.module.css';
import QuickSlots from './QuickSlots';
import Inventory from './Inventory';
import type {
  InventorySlotMovePayload,
  InventorySlot,
  QuickSlotAssignmentPayload,
  QuickSlotMovePayload,
  QuickSlotsSnapshot
} from '../../game/player/types';

interface InventoryDialogProps {
  inventorySlots: InventorySlot[];
  quickSlots?: QuickSlotsSnapshot;
  onClose: () => void;
  onInventoryRequest: () => void;
  onInventorySlotMove: (payload: InventorySlotMovePayload) => void;
  onQuickSlotAssign: (payload: QuickSlotAssignmentPayload) => void;
  onQuickSlotMove: (payload: QuickSlotMovePayload) => void;
  onQuickSlotSetSelect: (setId: number) => void;
}

export default function InventoryDialog({
  inventorySlots,
  quickSlots,
  onClose,
  onInventoryRequest,
  onInventorySlotMove,
  onQuickSlotAssign,
  onQuickSlotMove,
  onQuickSlotSetSelect
}: InventoryDialogProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Inventory</span>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.body}>
          <QuickSlots
            quickSlots={quickSlots}
            onQuickSlotAssign={onQuickSlotAssign}
            onQuickSlotMove={onQuickSlotMove}
            onQuickSlotSetSelect={onQuickSlotSetSelect}
          />
          <Inventory
            slots={inventorySlots}
            onInventoryRequest={onInventoryRequest}
            onInventorySlotMove={onInventorySlotMove}
          />
        </div>
      </div>
    </div>
  );
}
