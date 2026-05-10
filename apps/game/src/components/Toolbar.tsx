import { useEffect, useState } from 'react';

const SLOTS = [
  { key: 'q', index: 0 },
  { key: 'w', index: 1 },
  { key: 'e', index: 2 },
  { key: 'r', index: 3 },
] as const;

const PRESETS = [1, 2, 3, 4] as const;

// slot size minus 2 gaps of 4px → (60 - 4) / 2 = 28
const CELL = 28;
const GAP = 4;

interface ToolbarProps {
  inventoryActive?: boolean;
  statsActive?: boolean;
}

const MENU_BUTTONS = [
  { key: 'I', label: 'I' },
  { key: 'U', label: 'U' },
  { key: '', label: '' },
  { key: '', label: '' },
] as const;

export default function Toolbar({ inventoryActive = false, statsActive = false }: ToolbarProps) {
  const [active, setActive] = useState<number | null>(null);
  const [preset, setPreset] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key === '1') { setPreset(1); return; }
      if (e.key === '2') { setPreset(2); return; }
      if (e.key === '3') { setPreset(3); return; }
      if (e.key === '4') { setPreset(4); return; }
      const slot = SLOTS.find(s => s.key === e.key.toLowerCase());
      if (slot) setActive(slot.index);
    }
    function onKeyUp(e: KeyboardEvent) {
      const slot = SLOTS.find(s => s.key === e.key.toLowerCase());
      if (slot) setActive(prev => (prev === slot.index ? null : prev));
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

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
          const isSelected = preset === p;
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
      {SLOTS.map(({ key, index }) => {
        const isActive = active === index;
        return (
          <div
            key={key}
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
              justifyContent: 'flex-end',
              paddingBottom: 5,
              transition: 'background 80ms, border-color 80ms',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {key}
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
