import styles from './InventoryDialog.module.css';
import QuickSlots from './QuickSlots';
import Inventory from './Inventory';
import type {
  InventorySlotMovePayload,
  InventorySlot,
  QuickSlotAssignmentPayload,
  QuickSlotMovePayload,
  QuickSlotsSnapshot,
  RemoveInventoryItemPayload
} from '../../game/player/types';

interface InventoryDialogProps {
  inventorySlots: InventorySlot[];
  quickSlots?: QuickSlotsSnapshot;
  onClose: () => void;
  onInventoryRequest: () => void;
  onInventoryRemove: (payload: RemoveInventoryItemPayload) => void;
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
  onInventoryRemove,
  onInventorySlotMove,
  onQuickSlotAssign,
  onQuickSlotMove,
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
          <QuickSlots
            quickSlots={quickSlots}
            onQuickSlotAssign={onQuickSlotAssign}
            onQuickSlotMove={onQuickSlotMove}
            onQuickSlotSetSelect={onQuickSlotSetSelect}
          />
          <Inventory
            slots={inventorySlots}
            onInventoryRequest={onInventoryRequest}
            onInventoryRemove={onInventoryRemove}
            onInventorySlotMove={onInventorySlotMove}
          />
        </div>
      </div>
    </div>
  );
}
