import { useEffect, useMemo, useState } from 'react';
import { IconRepo } from '../utils/IconRepo';
import { ToolType } from '../utils/tools';
import type { QuickSlot, QuickSlotSet, QuickSlotsSnapshot } from '../game/player/types';

const PRESETS = [1, 2, 3, 4] as const;

// slot size minus 2 gaps of 4px → (60 - 4) / 2 = 28
const CELL = 28;
const GAP = 4;
const TOOL_ICON_SIZE = 32;

type ToolbarIcons = Partial<Record<ToolType, string>>;

interface ToolbarProps {
  inventoryActive?: boolean;
  quickSlots?: QuickSlotsSnapshot;
  statsActive?: boolean;
  onQuickSlotSetSelect: (setId: number) => void;
}

const MENU_BUTTONS = [
  { key: 'I', label: 'I' },
  { key: 'U', label: 'U' },
  { key: '', label: '' },
  { key: '', label: '' },
] as const;

export default function Toolbar({
  inventoryActive = false,
  quickSlots,
  statsActive = false,
  onQuickSlotSetSelect
}: ToolbarProps) {
  const [active, setActive] = useState<number | null>(null);
  const [toolImages, setToolImages] = useState<Partial<Record<ToolType, string>>>({});
  const selectedSet = useMemo(() => getSelectedQuickSlotSet(quickSlots), [quickSlots]);
  const slots = useMemo(() => selectedSet?.slots ?? [], [selectedSet?.slots]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const preset = PRESETS.find(current => `${current}` === e.key);
      if (preset) { onQuickSlotSetSelect(preset); return; }
      const slotIndex = findQuickSlotIndex(slots, e.key);
      if (slotIndex >= 0) setActive(slotIndex);
    }
    function onKeyUp(e: KeyboardEvent) {
      const slotIndex = findQuickSlotIndex(slots, e.key);
      if (slotIndex >= 0) setActive(prev => (prev === slotIndex ? null : prev));
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onQuickSlotSetSelect, slots]);

  useEffect(() => {
    let cancelled = false;
    loadToolbarIcons(quickSlots?.sets ?? []).then(images => {
      if (cancelled) return;
      setToolImages(images);
    });
    return () => {
      cancelled = true;
    };
  }, [quickSlots?.sets]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* 2×2 preset grid, same outer size as a tool slot (60×60) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${CELL}px ${CELL}px`,
          gridTemplateRows: `${CELL}px ${CELL}px`,
          gap: GAP,
          width: CELL * 2 + GAP,
          height: CELL * 2 + GAP,
        }}
      >
        {PRESETS.map(p => {
          const isSelected = quickSlots?.selectedSetId === p;
          return (
            <div
              key={p}
              style={{
                background: isSelected ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.55)',
                border: isSelected ? '2px solid rgba(255,255,255,0.75)' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: 5,
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 80ms, border-color 80ms',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.45)',
                  userSelect: 'none',
                }}
              >
                {p}
              </span>
            </div>
          );
        })}
      </div>

      {/* tool slots */}
      {slots.map((slot, index) => {
        const isActive = active === index;
        const image = getSlotImage(slot, toolImages);
        return (
          <div
            key={slot.key}
            title={slot.itemName ?? ''}
            style={{
              width: 60,
              height: 60,
              background: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.55)',
              border: isActive ? '2px solid rgba(255,255,255,0.75)' : '2px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 7,
              paddingBottom: 5,
              transition: 'background 80ms, border-color 80ms',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                width: TOOL_ICON_SIZE,
                height: TOOL_ICON_SIZE,
                overflow: 'hidden',
              }}
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  draggable={false}
                  style={{
                    display: 'block',
                    width: TOOL_ICON_SIZE,
                    height: TOOL_ICON_SIZE,
                    imageRendering: 'pixelated',
                  }}
                />
              )}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {slot.key}
            </span>
          </div>
        );
      })}

      {/* 2×2 menu grid, same outer size as a tool slot (60×60) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${CELL}px ${CELL}px`,
          gridTemplateRows: `${CELL}px ${CELL}px`,
          gap: GAP,
          width: CELL * 2 + GAP,
          height: CELL * 2 + GAP,
        }}
      >
        {MENU_BUTTONS.map(({ key, label }, i) => {
          const isActive = (i === 0 && inventoryActive) || (i === 1 && statsActive);
          return (
            <div
              key={i}
              style={{
                background: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.55)',
                border: isActive ? '2px solid rgba(255,255,255,0.75)' : '2px solid rgba(255,255,255,0.2)',
                borderRadius: 5,
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 80ms, border-color 80ms',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  userSelect: 'none',
                }}
              >
                {label || key}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function loadToolbarIcons(sets: QuickSlotSet[]): Promise<ToolbarIcons> {
  const itemNames = getQuickSlotToolNames(sets);
  const icons = await Promise.all(itemNames.map(loadToolbarIcon));
  return Object.fromEntries(icons) as ToolbarIcons;
}

function getSelectedQuickSlotSet(quickSlots?: QuickSlotsSnapshot): QuickSlotSet | undefined {
  return quickSlots?.sets.find(({ id }) => id === quickSlots.selectedSetId);
}

function findQuickSlotIndex(slots: QuickSlot[], key: string): number {
  return slots.findIndex(slot => slot.key === key.toLowerCase());
}

function getSlotImage(slot: QuickSlot, toolImages: ToolbarIcons): string | undefined {
  if (!slot.itemName) return undefined;
  return toolImages[slot.itemName];
}

function getQuickSlotToolNames(sets: QuickSlotSet[]): ToolType[] {
  return [...new Set(sets.flatMap(getQuickSlotSetToolNames))];
}

async function loadToolbarIcon(tool: ToolType): Promise<[ToolType, string]> {
  return [tool, await IconRepo.getIcon(tool)];
}

function getQuickSlotSetToolNames(set: QuickSlotSet): ToolType[] {
  return set.slots.flatMap(slot => (slot.itemName ? [slot.itemName] : []));
}
