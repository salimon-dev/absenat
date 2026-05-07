import { useState } from 'react';
import type { TileRecord } from '../TilesView/types';
import s from './TilePickerDialog.module.css';

interface TilePickerDialogProps {
  tiles: TileRecord[];
  tileCrops: Map<number, string>;
  onSelect: (tile: TileRecord) => void;
  onClose: () => void;
}

export function TilePickerDialog({ tiles, tileCrops, onSelect, onClose }: TilePickerDialogProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? tiles.filter((t) => t.mode.toLowerCase().includes(search.trim().toLowerCase()))
    : tiles;

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.title}>Set Tile</span>
          <button className={s.closeBtn} onClick={onClose}>×</button>
        </div>
        <input
          className={s.search}
          type="search"
          placeholder="Search by mode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        {filtered.length === 0 ? (
          <p className={s.empty}>No tiles match</p>
        ) : (
          <div className={s.grid}>
            {filtered.map((tile) => (
              <button
                key={tile.frame}
                className={s.tileBtn}
                onClick={() => onSelect(tile)}
                title={tile.mode}
              >
                {tileCrops.get(tile.frame) ? (
                  <img
                    src={tileCrops.get(tile.frame)}
                    className={s.tileImg}
                    alt={`#${tile.frame}`}
                  />
                ) : (
                  <div className={s.tilePlaceholder} />
                )}
                <span className={s.tileMode}>{tile.mode}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
