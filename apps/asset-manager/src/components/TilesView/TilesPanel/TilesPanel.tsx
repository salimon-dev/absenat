import { useMemo, useState } from 'react';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import type { TileRecord } from '../types';
import s from './TilesPanel.module.css';

const BIOME_KEYS = ['g', 'a', 'i', 'w', 'd', 'm', 'n'] as const;
const BIOME_LABEL: Record<string, string> = {
  g: 'Grass',
  a: 'Sand',
  i: 'Ice',
  w: 'Water',
  d: 'Dirt',
  m: 'Marsh',
  n: 'Snow',
};

const ALL_MODES: string[] = (() => {
  const result: string[] = [];
  for (const a of BIOME_KEYS)
    for (const b of BIOME_KEYS)
      for (const c of BIOME_KEYS)
        for (const d of BIOME_KEYS) result.push(a + b + c + d);
  return result;
})();

function modeToFullName(mode: string): string {
  return mode
    .split('')
    .map((c) => (BIOME_LABEL[c] ?? c).toLowerCase())
    .join('-');
}

const PER_PAGE = 18;

interface TilesPanelProps {
  tiles: TileRecord[];
  tileCrops: Map<number, string>;
  saving: boolean;
  onSave: () => void;
  onDelete: (frame: number) => void;
}

export function TilesPanel({ tiles, tileCrops, saving, onSave, onDelete }: TilesPanelProps) {
  const [showMissing, setShowMissing] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const assignedModes = useMemo(() => new Set(tiles.map((t) => t.mode)), [tiles]);
  const missingModes = useMemo(
    () => ALL_MODES.filter((m) => !assignedModes.has(m)),
    [assignedModes],
  );
  const sortedTiles = useMemo(
    () => [...tiles].sort((a, b) => a.mode.localeCompare(b.mode)),
    [tiles],
  );
  const filteredTiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedTiles;
    return sortedTiles.filter(
      (t) => String(t.frame).includes(q) || t.mode.toLowerCase().includes(q),
    );
  }, [sortedTiles, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTiles.length / PER_PAGE));
  const effPage = Math.min(page, totalPages - 1);
  const pagedTiles = filteredTiles.slice(effPage * PER_PAGE, (effPage + 1) * PER_PAGE);

  return (
    <div className={s.root}>
      <div className={s.panelHeader}>
        <span>Tiles</span>
        <span className={s.count}>{tiles.length}</span>
        <button
          className={s.statusBadge}
          onClick={() => setShowMissing(true)}
          title="Click to see missing rotations"
        >
          {assignedModes.size} / {ALL_MODES.length}
        </button>
        <div className={s.headerSpacer} />
        <button
          className={s.saveBtn}
          onClick={onSave}
          disabled={saving || tiles.length === 0}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className={s.searchRow}>
        <input
          className={s.searchInput}
          type="search"
          placeholder="Search by frame # or mode…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {tiles.length === 0 ? (
        <EmptyState
          icon="⬛"
          label="No tiles"
          sub="Configure tiles on the right to add them"
        />
      ) : filteredTiles.length === 0 ? (
        <EmptyState icon="🔍" label="No results" sub="No tiles match your search" />
      ) : (
        <>
          <div className={s.tileList}>
            {pagedTiles.map((tile) => (
              <div key={tile.frame} className={s.tileItem}>
                <div className={s.tilePreview}>
                  {tileCrops.get(tile.frame) ? (
                    <img
                      src={tileCrops.get(tile.frame)}
                      className={s.tileImg}
                      alt={`frame ${tile.frame}`}
                    />
                  ) : (
                    <div className={s.tilePlaceholder} />
                  )}
                </div>
                <div className={s.tileMeta}>
                  <span className={s.frameNum}>#{tile.frame}</span>
                  <span className={s.modeLabel}>{tile.mode}</span>
                </div>
                <button
                  className={s.deleteBtn}
                  onClick={() => onDelete(tile.frame)}
                  title="Delete tile"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className={s.pagination}>
              <button
                className={s.pageBtn}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={effPage === 0}
              >
                ‹
              </button>
              <span className={s.pageInfo}>
                {effPage + 1} / {totalPages}
              </span>
              <button
                className={s.pageBtn}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={effPage === totalPages - 1}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}

      {showMissing && (
        <div className={s.missingOverlay} onClick={() => setShowMissing(false)}>
          <div className={s.missingModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.missingHeader}>
              <span>Missing Rotations</span>
              <span className={s.missingCount}>{missingModes.length} missing</span>
              <div className={s.missingHeaderSpacer} />
              <button className={s.missingClose} onClick={() => setShowMissing(false)}>
                ×
              </button>
            </div>
            <div className={s.missingList}>
              {missingModes.length === 0 ? (
                <p className={s.missingEmpty}>
                  All {ALL_MODES.length} rotations have at least one tile assigned.
                </p>
              ) : (
                missingModes.map((m) => (
                  <div key={m} className={s.missingItem}>
                    <code className={s.missingCode}>{m}</code>
                    <span className={s.missingName}>{modeToFullName(m)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
