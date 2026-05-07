import { useEffect, useRef, useState } from 'react';
import { EmptyState } from '../../common/EmptyState/EmptyState';
import type { StagingTile } from '../types';
import s from './StagingPanel.module.css';

const PER_PAGE = 250;

interface StagingPanelProps {
  stagingTiles: StagingTile[];
  deduplicating: boolean;
  onUpload: (files: File[]) => void;
  onRemoveBlank: () => void;
  onDeduplicate: () => void;
  onTileClick: (tile: StagingTile) => void;
  onRemoveTile: (id: number) => void;
}

export function StagingPanel({
  stagingTiles,
  deduplicating,
  onUpload,
  onRemoveBlank,
  onDeduplicate,
  onTileClick,
  onRemoveTile,
}: StagingPanelProps) {
  const [page, setPage] = useState(0);
  const uploadRef = useRef<HTMLInputElement>(null);
  const isRightDragging = useRef(false);

  const totalPages = Math.max(1, Math.ceil(stagingTiles.length / PER_PAGE));
  const effPage = Math.min(page, totalPages - 1);
  const pagedTiles = stagingTiles.slice(effPage * PER_PAGE, (effPage + 1) * PER_PAGE);

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      if (e.button === 2) isRightDragging.current = false;
    }
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    e.target.value = '';
    onUpload(files);
  }

  function handleMouseDown(e: React.MouseEvent, tileId: number) {
    if (e.button !== 2) return;
    e.preventDefault();
    isRightDragging.current = true;
    onRemoveTile(tileId);
  }

  function handleMouseEnter(tileId: number) {
    if (!isRightDragging.current) return;
    onRemoveTile(tileId);
  }

  return (
    <div className={s.root}>
      <div className={s.panelHeader}>
        <span>Upload</span>
        <div className={s.headerSpacer} />
        <button
          className={s.dedupeBtn}
          onClick={onRemoveBlank}
          disabled={stagingTiles.length === 0}
          title="Remove fully transparent tiles"
        >
          Remove Blank
        </button>
        <button
          className={s.dedupeBtn}
          onClick={onDeduplicate}
          disabled={stagingTiles.length === 0 || deduplicating}
          title="Remove staging tiles that already exist in the saved tiles"
        >
          {deduplicating ? 'Deduplicating…' : 'Deduplicate'}
        </button>
        <button className={s.uploadBtn} onClick={() => uploadRef.current?.click()}>
          Upload PNG
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/png"
          multiple
          className={s.hiddenInput}
          onChange={handleChange}
        />
      </div>

      {stagingTiles.length === 0 ? (
        <EmptyState icon="🖼" label="No image" sub="Upload a PNG to extract 16×16 tiles" />
      ) : (
        <>
          <div
            className={s.stagingGrid}
            onContextMenu={(e) => e.preventDefault()}
          >
            {pagedTiles.map((tile) => (
              <button
                key={tile.id}
                className={s.stagingTile}
                onClick={() => onTileClick(tile)}
                onMouseDown={(e) => handleMouseDown(e, tile.id)}
                onMouseEnter={() => handleMouseEnter(tile.id)}
                title="Left-click to configure · Right-click drag to remove"
              >
                <img src={tile.dataUrl} className={s.stagingImg} alt="tile" />
              </button>
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
    </div>
  );
}
