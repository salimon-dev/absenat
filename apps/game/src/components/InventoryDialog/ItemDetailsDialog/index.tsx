import { useEffect, useState } from 'react';
import type { InventoryItem } from '../../../game/player/types';
import { IconRepo } from '../../../utils/IconRepo';
import {
  getResourceSpec,
  isResourceName,
  type ResourceEffects,
  type ResourceName
} from '../../../utils/resources';
import { isToolName, TOOL_DEFINITIONS, type ToolName } from '../../../utils/tools';
import styles from './ItemDetailsDialog.module.css';

interface ItemDetailsDialogProps {
  item: InventoryItem;
  onClose: () => void;
  onDropStack: (item: InventoryItem) => void;
}

interface ItemData {
  label: string;
  value: string;
}

export default function ItemDetailsDialog({ item, onClose, onDropStack }: ItemDetailsDialogProps) {
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const details = getItemDetails(item);

  useEffect(() => {
    let active = true;
    IconRepo.getIcon(item.name).then(src => {
      if (active) setIcon(src);
    });
    return () => {
      active = false;
    };
  }, [item.name]);

  return (
    <div className={styles.dialog} onClick={e => e.stopPropagation()}>
      <div className={styles.header}>
        <div className={styles.iconFrame}>{icon && <img className={styles.icon} src={icon} alt="" />}</div>
        <div className={styles.titleGroup}>
          <span className={styles.name}>{formatName(item.name)}</span>
          <span className={styles.type}>{details.type}</span>
        </div>
        <button
          aria-label="Close item details"
          className={styles.closeButton}
          type="button"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className={styles.body}>
        {details.description && <p className={styles.description}>{details.description}</p>}
        <div className={styles.dataGrid}>
          {getVisibleData(details.data).map(data => (
            <div className={styles.dataItem} key={data.label}>
              <span className={styles.dataLabel}>{data.label}</span>
              <span className={styles.dataValue}>{data.value}</span>
            </div>
          ))}
        </div>
        <button className={styles.dropButton} type="button" onClick={() => onDropStack(item)}>
          Drop stack
        </button>
      </div>
    </div>
  );
}

function getItemDetails(item: InventoryItem) {
  if (isResourceName(item.name)) return getResourceDetails(item.name, item);
  if (isToolName(item.name)) return getToolDetails(item.name, item);
  return {
    type: 'Item',
    description: undefined,
    data: getBaseItemData(item)
  };
}

function getResourceDetails(name: ResourceName, item: InventoryItem) {
  const spec = getResourceSpec(name);
  return {
    type: 'Resource',
    description: spec.description,
    data: [...getBaseItemData(item), ...getEffectData(spec.effects)]
  };
}

function getToolDetails(name: ToolName, item: InventoryItem) {
  const definition = TOOL_DEFINITIONS[name];
  return {
    type: 'Tool',
    description: undefined,
    data: [...getBaseItemData(item), { label: 'Range', value: String(definition.range) }]
  };
}

function getBaseItemData(item: InventoryItem): ItemData[] {
  const data = [{ label: 'Count', value: String(item.count ?? 1) }];
  if (item.durability !== undefined) data.push({ label: 'Durability', value: formatDurability(item) });
  return data;
}

function getEffectData(effects: ResourceEffects): ItemData[] {
  return [
    { label: 'Health', value: formatEffect(effects.health) },
    { label: 'Fatigue', value: formatEffect(effects.fatigue) },
    { label: 'Hunger', value: formatEffect(effects.hunger) },
    { label: 'Thirst', value: formatEffect(effects.thirst) }
  ];
}

function formatName(name: string): string {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDurability(item: InventoryItem): string {
  return `${Math.round((item.durability ?? 0) * 100)}%`;
}

function formatEffect(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function getVisibleData(data: ItemData[]): ItemData[] {
  return data.filter(item => item.value !== '0');
}
