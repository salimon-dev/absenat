import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { IconRepo } from '../../../utils/IconRepo';
import type {
  QuickSlot,
  QuickSlotAssignmentPayload,
  QuickSlotMovePayload,
  QuickSlotPosition,
  QuickSlotsSnapshot
} from '../../../game/player/types';
import type { ToolName } from '../../../utils/tools';
import { DragPayloadKind, parseSlotDragPayload, serializeSlotDragPayload } from '../drag-payload';
import styles from './QuickSlots.module.css';

type QuickSlotIcons = Partial<Record<string, string>>;
type DragTarget = QuickSlotPosition;

interface QuickSlotsProps {
  quickSlots?: QuickSlotsSnapshot;
  onQuickSlotAssign: (payload: QuickSlotAssignmentPayload) => void;
  onQuickSlotMove: (payload: QuickSlotMovePayload) => void;
  onQuickSlotSetSelect: (setId: number) => void;
}

export default function QuickSlots({
  quickSlots,
  onQuickSlotAssign,
  onQuickSlotMove,
  onQuickSlotSetSelect
}: QuickSlotsProps) {
  const [icons, setIcons] = useState<QuickSlotIcons>({});
  const [dragSource, setDragSource] = useState<DragTarget | undefined>(undefined);
  const [dropTarget, setDropTarget] = useState<DragTarget | undefined>(undefined);
  const sets = useMemo(() => quickSlots?.sets ?? [], [quickSlots?.sets]);

  useEffect(() => {
    loadQuickSlotIcons(sets).then(setIcons);
  }, [sets]);

  function handleDragStart(position: DragTarget, e: DragEvent<HTMLDivElement>): void {
    setDragSource(position);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      serializeSlotDragPayload({ kind: DragPayloadKind.QuickSlot, source: position })
    );
  }

  function handleDragOver(position: DragTarget, e: DragEvent<HTMLDivElement>): void {
    if (dragSource && isSameDragTarget(position, dragSource)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(position);
  }

  function handleDragEnter(position: DragTarget): void {
    if (!dragSource || isSameDragTarget(position, dragSource)) return;
    setDropTarget(position);
  }

  function handleDragLeave(position: DragTarget): void {
    setDropTarget(current => (isSameDragTarget(position, current) ? undefined : current));
  }

  function handleDrop(position: DragTarget, e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    handleSlotDrop(position, e);
    clearDragState();
  }

  function handleDragEnd(): void {
    clearDragState();
  }

  function clearDragState(): void {
    setDragSource(undefined);
    setDropTarget(undefined);
  }

  function handleSlotDrop(position: DragTarget, e: DragEvent<HTMLDivElement>): void {
    const payload = parseSlotDragPayload(e.dataTransfer.getData('text/plain'));
    if (payload?.kind === DragPayloadKind.InventorySlot) {
      onQuickSlotAssign({
        itemName: payload.itemName,
        setId: position.setId,
        slotIndex: position.slotIndex
      });
      return;
    }
    if (payload?.kind === DragPayloadKind.QuickSlot && !isSameDragTarget(position, payload.source)) {
      onQuickSlotMove({ source: payload.source, target: position });
    }
  }

  return (
    <div className={styles.quickSlots}>
      <span className={styles.sectionLabel}>Quick Slots</span>
      <div className={styles.groupGrid}>
        {sets.map(set => (
          <div className={styles.group} key={set.id}>
            <button
              className={getGroupLabelClass(set.id, quickSlots?.selectedSetId)}
              type="button"
              onClick={() => onQuickSlotSetSelect(set.id)}
            >
              {set.id}
            </button>
            <div className={styles.slotRow}>
              {set.slots.map((slot, slotIndex) => (
                <Slot
                  key={slot.key}
                  dropTarget={dropTarget}
                  icon={getSlotIcon(slot, icons)}
                  setId={set.id}
                  slot={slot}
                  slotIndex={slotIndex}
                  onDragEnd={handleDragEnd}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SlotProps {
  dropTarget?: DragTarget;
  icon?: string;
  setId: number;
  slot: QuickSlot;
  slotIndex: number;
  onDragEnd: () => void;
  onDragEnter: (position: DragTarget) => void;
  onDragLeave: (position: DragTarget) => void;
  onDragOver: (position: DragTarget, e: DragEvent<HTMLDivElement>) => void;
  onDragStart: (position: DragTarget, e: DragEvent<HTMLDivElement>) => void;
  onDrop: (position: DragTarget, e: DragEvent<HTMLDivElement>) => void;
}

function Slot({
  dropTarget,
  icon,
  setId,
  slot,
  slotIndex,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDragStart,
  onDrop
}: SlotProps) {
  const position = { setId, slotIndex };

  return (
    <div
      className={getSlotClass(position, dropTarget)}
      draggable={Boolean(slot.itemName)}
      onDragEnd={onDragEnd}
      onDragEnter={() => onDragEnter(position)}
      onDragLeave={() => onDragLeave(position)}
      onDragOver={e => onDragOver(position, e)}
      onDragStart={e => onDragStart(position, e)}
      onDrop={e => onDrop(position, e)}
    >
      {icon && <img src={icon} alt="" draggable={false} />}
      <span className={styles.slotKey}>{slot.key}</span>
    </div>
  );
}

function getGroupLabelClass(setId: number, selectedSetId?: number): string {
  if (setId !== selectedSetId) return styles.groupLabel;
  return `${styles.groupLabel} ${styles.groupLabelActive}`;
}

function getSlotClass(position: DragTarget, dropTarget?: DragTarget): string {
  if (!isSameDragTarget(position, dropTarget)) return styles.slot;
  return `${styles.slot} ${styles.slotDropTarget}`;
}

function isSameDragTarget(left?: DragTarget, right?: DragTarget): boolean {
  return left?.setId === right?.setId && left?.slotIndex === right?.slotIndex;
}

function getSlotIcon(slot: QuickSlot, icons: QuickSlotIcons): string | undefined {
  if (!slot.itemName) return undefined;
  return icons[slot.itemName];
}

async function loadQuickSlotIcons(sets: QuickSlotsSnapshot['sets']): Promise<QuickSlotIcons> {
  const itemNames = getQuickSlotItemNames(sets);
  const icons = await Promise.all(itemNames.map(loadQuickSlotIcon));
  return Object.fromEntries(icons);
}

function getQuickSlotItemNames(sets: QuickSlotsSnapshot['sets']): ToolName[] {
  return [...new Set(sets.flatMap(getQuickSlotSetItemNames))];
}

function getQuickSlotSetItemNames(set: QuickSlotsSnapshot['sets'][number]): ToolName[] {
  return set.slots.flatMap(slot => (slot.itemName ? [slot.itemName] : []));
}

async function loadQuickSlotIcon(itemName: ToolName): Promise<[string, string]> {
  return [itemName, await IconRepo.getIcon(itemName)];
}
