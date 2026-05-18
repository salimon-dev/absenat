import { useEffect, useState } from 'react';
import { IconRepo } from '../../../utils/IconRepo';
import type { InventoryItem, RemoveInventoryItemPayload } from '../../../game/player/types';
import styles from './Inventory.module.css';

type InventoryIcons = Partial<Record<string, string>>;

interface InventoryProps {
  inventory: InventoryItem[];
  onInventoryRequest: () => void;
  onInventoryRemove: (payload: RemoveInventoryItemPayload) => void;
}

export default function Inventory({
  inventory,
  onInventoryRequest,
  onInventoryRemove
}: InventoryProps) {
  const [icons, setIcons] = useState<InventoryIcons>({});

  useEffect(() => {
    onInventoryRequest();
  }, [onInventoryRequest]);

  useEffect(() => {
    loadInventoryIcons(inventory).then(setIcons);
  }, [inventory]);

  return (
    <div className={styles.inventory}>
      <span className={styles.sectionLabel}>Inventory</span>
      <div className={styles.itemList}>
        {inventory.map(item => (
          <InventoryRow
            key={item.name}
            icon={icons[item.name]}
            item={item}
            onInventoryRemove={onInventoryRemove}
          />
        ))}
      </div>
    </div>
  );
}

interface InventoryRowProps {
  icon?: string;
  item: InventoryItem;
  onInventoryRemove: (payload: RemoveInventoryItemPayload) => void;
}

function InventoryRow({ icon, item, onInventoryRemove }: InventoryRowProps) {
  return (
    <div className={styles.itemRow}>
      <div className={styles.iconCell}>{icon && <img src={icon} alt="" />}</div>
      <span className={styles.name}>{formatName(item.name)}</span>
      <span className={styles.count}>{formatCount(item.count)}</span>
      <span className={styles.durability}>{formatDurability(item.durability)}</span>
      <button
        className={styles.removeButton}
        type="button"
        onClick={() => onInventoryRemove({ name: item.name, count: 1 })}
      >
        Drop
      </button>
    </div>
  );
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
