import { useState } from 'react';
import s from './ModeModal.module.css';

const BIOMES = [
  { key: 'g', label: 'Grass',  color: '#a6e3a1' },
  { key: 'a', label: 'Sand',   color: '#f9e2af' },
  { key: 'i', label: 'Ice',    color: '#89dceb' },
  { key: 'w', label: 'Water',  color: '#89b4fa' },
  { key: 'd', label: 'Dirt',   color: '#b5896a' },
  { key: 'm', label: 'Marsh',  color: '#94b06a' },
  { key: 'n', label: 'Snow',   color: '#cdd6f4' },
  { key: 'o', label: 'Wood',   color: '#8b5e3c' },
];

const CORNERS = [
  { index: 0, label: 'Top-left' },
  { index: 1, label: 'Top-right' },
  { index: 2, label: 'Bottom-left' },
  { index: 3, label: 'Bottom-right' },
];

interface TileRecord {
  frame: number;
  mode: string;
}

interface Props {
  dataUrl: string;
  tiles: TileRecord[];
  tileCrops: Map<number, string>;
  onSave: (mode: string) => void;
  onClose: () => void;
  onDelete: (frame: number) => void;
  onDeleteSelf: () => void;
}

export function ModeModal({ dataUrl, tiles, tileCrops, onSave, onClose, onDelete, onDeleteSelf }: Props) {
  const [chars, setChars] = useState(['g', 'g', 'g', 'g']);

  const validKeys = new Set(BIOMES.map((b) => b.key));

  function setChar(index: number, value: string) {
    const ch = value.slice(-1).toLowerCase();
    if (ch && !validKeys.has(ch)) return;
    setChars((prev) => {
      const next = [...prev];
      next[index] = ch || prev[index];
      return next;
    });
  }

  const mode = chars.join('');
  const matching = tiles.filter((t) => t.mode === mode);

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <span>Set Tile Mode</span>
          <button className={s.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={s.body}>
          <div className={s.top}>
            <div className={s.preview}>
              <img src={dataUrl} className={s.previewImg} alt="tile preview" />
              <button
                className={s.previewDeleteBtn}
                onClick={onDeleteSelf}
                title="Delete this tile"
              >
                ×
              </button>
            </div>

            <div className={s.controls}>
              <div className={s.corners}>
                {CORNERS.map(({ index, label }) => (
                  <div key={index} className={s.cornerCell}>
                    <label className={s.cornerLabel}>{label}</label>
                    <input
                      className={s.input}
                      value={chars[index]}
                      maxLength={1}
                      spellCheck={false}
                      onChange={(e) => setChar(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={s.modePreview}>
                Mode: <code>{mode}</code>
              </div>

              <div className={s.legend}>
                {BIOMES.map((b) => (
                  <span key={b.key} className={s.legendItem}>
                    <span className={s.legendDot} style={{ background: b.color }} />
                    <span className={s.legendKey}>{b.key}</span>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={s.matchSection}>
            <div className={s.matchHeader}>
              <span>Tiles with this mode</span>
              <span className={s.matchCount}>{matching.length}</span>
            </div>
            {matching.length === 0 ? (
              <p className={s.matchEmpty}>No saved tiles use mode <code>{mode}</code></p>
            ) : (
              <div className={s.matchGrid}>
                {matching.map((t) => (
                  <div key={t.frame} className={s.matchTile} title={`#${t.frame}`}>
                    {tileCrops.get(t.frame) ? (
                      <img src={tileCrops.get(t.frame)} className={s.matchImg} alt={`frame ${t.frame}`} />
                    ) : (
                      <div className={s.matchPlaceholder} />
                    )}
                    <span className={s.matchFrame}>#{t.frame}</span>
                    <button
                      className={s.matchDeleteBtn}
                      onClick={() => onDelete(t.frame)}
                      title="Remove from collection"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={s.confirmBtn} onClick={() => onSave(mode)}>Add Tile</button>
        </div>
      </div>
    </div>
  );
}
