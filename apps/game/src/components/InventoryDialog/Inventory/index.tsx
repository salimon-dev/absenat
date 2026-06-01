import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { IconRepo } from '../../../utils/IconRepo';
import type {
  InventoryItem,
  InventorySlotMovePayload,
  InventorySlot as InventorySlotType,
  InventorySlotPosition
} from '../../../game/player/types';
import { DragPayloadKind, parseSlotDragPayload, serializeSlotDragPayload } from '../drag-payload';
import styles from './Inventory.module.css';

type InventoryIcons = Partial<Record<string, string>>;
type DragTarget = InventorySlotPosition;

interface InventoryProps {
  slots: InventorySlotType[];
  onItemSelect: (item: InventoryItem) => void;
  onInventoryRequest: () => void;
  onInventorySlotMove: (payload: InventorySlotMovePayload) => void;
}

export default function Inventory({
  slots,
  onItemSelect,
  onInventoryRequest,
  onInventorySlotMove
}: InventoryProps) {
  const [icons, setIcons] = useState<InventoryIcons>({});
  const [dropTarget, setDropTarget] = useState<DragTarget | undefined>(undefined);
  const items = useMemo(() => getInventoryItems(slots), [slots]);

  useEffect(() => {
    onInventoryRequest();
  }, [onInventoryRequest]);

  useEffect(() => {
    loadInventoryIcons(items).then(setIcons);
  }, [items]);

  return (
    <div className={styles.inventory}>
      <span className={styles.sectionLabel}>Inventory</span>
      <div className={styles.itemList}>
        {slots.map((slot, slotIndex) => (
          <InventorySlot
            key={slotIndex}
            dropTarget={dropTarget}
            icon={slot.item ? icons[slot.item.name] : undefined}
            item={slot.item}
            slotIndex={slotIndex}
            onClick={handleItemClick}
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
  );

  function handleDragStart(
    item: InventoryItem,
    position: DragTarget,
    e: DragEvent<HTMLButtonElement>
  ): void {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'text/plain',
      serializeSlotDragPayload({
        kind: DragPayloadKind.InventorySlot,
        itemName: item.name,
        source: position
      })
    );
  }

  function handleDragOver(position: DragTarget, e: DragEvent<HTMLElement>): void {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(position);
  }

  function handleDragEnter(position: DragTarget): void {
    setDropTarget(position);
  }

  function handleDragLeave(position: DragTarget): void {
    setDropTarget(current => (isSameDragTarget(position, current) ? undefined : current));
  }

  function handleDrop(position: DragTarget, e: DragEvent<HTMLElement>): void {
    e.preventDefault();
    const source = getInventoryDropSource(e);
    if (source && !isSameDragTarget(position, source)) {
      onInventorySlotMove({ source, target: position });
    }
    clearDragState();
  }

  function handleDragEnd(): void {
    clearDragState();
  }

  function handleItemClick(item: InventoryItem): void {
    onItemSelect(item);
  }

  function clearDragState(): void {
    setDropTarget(undefined);
  }
}

interface InventorySlotProps {
  dropTarget?: DragTarget;
  icon?: string;
  item?: InventoryItem;
  slotIndex: number;
  onClick: (item: InventoryItem) => void;
  onDragEnd: () => void;
  onDragEnter: (position: DragTarget) => void;
  onDragLeave: (position: DragTarget) => void;
  onDragOver: (position: DragTarget, e: DragEvent<HTMLElement>) => void;
  onDragStart: (item: InventoryItem, position: DragTarget, e: DragEvent<HTMLButtonElement>) => void;
  onDrop: (position: DragTarget, e: DragEvent<HTMLElement>) => void;
}

function InventorySlot({
  dropTarget,
  icon,
  item,
  slotIndex,
  onClick,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDragStart,
  onDrop
}: InventorySlotProps) {
  const position = { slotIndex };
  if (!item) {
    return (
      <div
        className={getSlotClass(position, dropTarget)}
        onDragEnter={() => onDragEnter(position)}
        onDragLeave={() => onDragLeave(position)}
        onDragOver={e => onDragOver(position, e)}
        onDrop={e => onDrop(position, e)}
      />
    );
  }
  return (
    <button
      aria-label={`View ${formatName(item.name)}`}
      className={getSlotClass(position, dropTarget)}
      draggable
      title={formatTooltip(item)}
      type="button"
      onClick={() => onClick(item)}
      onDragEnd={onDragEnd}
      onDragStart={e => onDragStart(item, position, e)}
      onDragEnter={() => onDragEnter(position)}
      onDragLeave={() => onDragLeave(position)}
      onDragOver={e => onDragOver(position, e)}
      onDrop={e => onDrop(position, e)}
    >
      {icon && <img src={icon} alt="" draggable={false} />}
      <span className={styles.count}>{formatCount(item.count)}</span>
    </button>
  );
}

function getInventoryItems(slots: InventorySlotType[]): InventoryItem[] {
  return slots.flatMap(slot => (slot.item ? [slot.item] : []));
}

function getInventoryDropSource(e: DragEvent<HTMLElement>): InventorySlotPosition | undefined {
  const payload = e.dataTransfer.getData('text/plain');
  if (!payload) return undefined;
  const parsed = parseSlotDragPayload(payload);
  if (parsed?.kind !== DragPayloadKind.InventorySlot) return undefined;
  return parsed.source;
}

function getSlotClass(position: DragTarget, dropTarget?: DragTarget): string {
  if (!isSameDragTarget(position, dropTarget)) return styles.itemSlot;
  return `${styles.itemSlot} ${styles.itemSlotDropTarget}`;
}

function isSameDragTarget(left?: DragTarget, right?: DragTarget): boolean {
  return left?.slotIndex === right?.slotIndex;
}

async function loadInventoryIcons(inventory: InventoryItem[]): Promise<InventoryIcons> {
  const icons = await Promise.all(inventory.map(loadInventoryIcon));
  return Object.fromEntries(icons);
}

async function loadInventoryIcon(item: InventoryItem): Promise<[string, string]> {
  return [item.name, await IconRepo.getIcon(item.name)];
}

function formatName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function formatCount(count?: number): string {
  return `x${count ?? 1}`;
}

function formatDurability(durability?: number): string {
  if (durability === undefined) return 'Durability -';
  return `Durability ${Math.round(durability * 100)}%`;
}

function formatTooltip(item: InventoryItem): string {
  const name = formatName(item.name);
  if (item.durability === undefined) return name;
  return `${name}\n${formatDurability(item.durability)}`;
}
