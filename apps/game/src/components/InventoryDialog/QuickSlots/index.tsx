import { Fragment, useEffect, useMemo, useState } from 'react';
import { IconRepo } from '../../../utils/IconRepo';
import type { QuickSlot, QuickSlotsSnapshot } from '../../../game/player/types';
import type { ToolName } from '../../../utils/tools';
import styles from './QuickSlots.module.css';

type QuickSlotIcons = Partial<Record<string, string>>;

interface QuickSlotsProps {
  quickSlots?: QuickSlotsSnapshot;
  onQuickSlotSetSelect: (setId: number) => void;
}

export default function QuickSlots({ quickSlots, onQuickSlotSetSelect }: QuickSlotsProps) {
  const [icons, setIcons] = useState<QuickSlotIcons>({});
  const sets = useMemo(() => quickSlots?.sets ?? [], [quickSlots?.sets]);

  useEffect(() => {
    loadQuickSlotIcons(sets).then(setIcons);
  }, [sets]);

  return (
    <div className={styles.quickSlots}>
      <span className={styles.sectionLabel}>Quick Slots</span>
      {sets.map((set, idx) => (
        <Fragment key={set.id}>
          {idx > 0 && <div className={styles.groupDivider} />}
          <div className={styles.group}>
            <button
              className={getGroupLabelClass(set.id, quickSlots?.selectedSetId)}
              type="button"
              onClick={() => onQuickSlotSetSelect(set.id)}
            >
              {set.id}
            </button>
            <div className={styles.slotRow}>
              {set.slots.map(slot => (
                <Slot key={slot.key} icon={getSlotIcon(slot, icons)} slot={slot} />
              ))}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function Slot({ icon, slot }: { icon?: string; slot: QuickSlot }) {
  return (
    <div className={styles.slot}>
      {icon && <img src={icon} alt="" draggable={false} />}
      <span className={styles.slotKey}>{slot.key}</span>
    </div>
  );
}

function getGroupLabelClass(setId: number, selectedSetId?: number): string {
  if (setId !== selectedSetId) return styles.groupLabel;
  return `${styles.groupLabel} ${styles.groupLabelActive}`;
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
