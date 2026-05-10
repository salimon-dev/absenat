import { useEffect, useState } from 'react';
import s from './AssetUploadDialog.module.css';

const TILE_SIZE = 16;

interface Props {
  file: File;
  onClose: () => void;
  onAddTiles: (tiles: string[]) => void;
}

async function sliceIntoTiles(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cols = Math.max(1, Math.floor(img.width / TILE_SIZE));
      const rows = Math.max(1, Math.floor(img.height / TILE_SIZE));
      const tiles: string[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = TILE_SIZE;
          canvas.height = TILE_SIZE;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
          tiles.push(canvas.toDataURL());
        }
      }
      URL.revokeObjectURL(url);
      resolve(tiles);
    };
    img.src = url;
  });
}

export function AssetUploadDialog({ file, onClose, onAddTiles }: Props) {
  const [tiles, setTiles] = useState<string[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    sliceIntoTiles(file).then(setTiles);
  }, [file]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleTileClick(index: number) {
    if (!deleteMode) return;
    setTiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddTiles() {
    onAddTiles(tiles);
    onClose();
  }

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.filename}>{file.name}</span>
          <span className={s.count}>{tiles.length} tiles</span>
          <div className={s.actions}>
            <button
              className={`${s.btn} ${deleteMode ? s.btnActive : ''}`}
              onClick={() => setDeleteMode((v) => !v)}
            >
              Delete
            </button>
            <button className={s.btn} onClick={handleAddTiles} disabled={tiles.length === 0}>
              Add Tiles
            </button>
          </div>
          <button className={s.close} onClick={onClose}>✕</button>
        </div>
        <div className={s.body}>
          {tiles.length === 0 ? (
            <span className={s.loading}>Slicing…</span>
          ) : (
            <div className={`${s.grid} ${deleteMode ? s.deleteCursor : ''}`}>
              {tiles.map((dataUrl, i) => (
                <img
                  key={i}
                  src={dataUrl}
                  alt={`tile ${i}`}
                  className={`${s.tile} ${deleteMode ? s.tileDeleteHover : ''}`}
                  onClick={() => handleTileClick(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
