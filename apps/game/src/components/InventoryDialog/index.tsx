import { useState } from 'react';
import styles from './InventoryDialog.module.css';
import QuickSlots from './QuickSlots';
import Inventory from './Inventory';
import ItemDetailsDialog from './ItemDetailsDialog';
import type {
  InventoryItem,
  RemoveInventoryItemPayload,
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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);

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
            onItemSelect={setSelectedItem}
            onInventoryRequest={onInventoryRequest}
            onInventorySlotMove={onInventorySlotMove}
          />
        </div>
        {selectedItem && (
          <ItemDetailsDialog
            item={selectedItem}
            onClose={() => setSelectedItem(undefined)}
            onDropStack={handleDropStack}
          />
        )}
      </div>
    </div>
  );

  function handleDropStack(item: InventoryItem): void {
    onInventoryRemove({ name: item.name, count: item.count ?? 1 });
    setSelectedItem(undefined);
  }
}
