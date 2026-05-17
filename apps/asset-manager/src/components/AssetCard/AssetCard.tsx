import { useEffect, useRef, useState } from 'react';
import type { AssetSchema } from '@absenat/specs';
import { loadTilePng } from '../../lib/assetsDb';
import { EditTagsDialog } from '../EditTagsDialog/EditTagsDialog';
import s from './AssetCard.module.css';

interface Props {
  asset: AssetSchema;
  folderHandle: FileSystemDirectoryHandle;
  onDelete: () => void;
  onUpdate: (updated: AssetSchema) => void;
}

const TILE = 16;

export function AssetCard({ asset, folderHandle, onDelete, onUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;

    async function draw() {
      objectUrl = await loadTilePng(folderHandle, asset.source);
      if (!objectUrl || !active || !canvasRef.current) return;

      const img = new Image();
      img.src = objectUrl;
      await new Promise<void>(res => { img.onload = () => res(); });
      if (!active || !canvasRef.current) return;

      const rows = Math.floor(img.naturalHeight / TILE);
      const col = rows > 0 ? Math.floor(asset.frame / rows) : 0;
      const row = rows > 0 ? asset.frame % rows : 0;

      const ctx = canvasRef.current.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, col * TILE, row * TILE, TILE, TILE, 0, 0, TILE, TILE);
      setReady(true);
    }

    draw();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [asset, folderHandle]);

  function handleSave(tags: string[]) {
    onUpdate({ ...asset, tags });
    setEditOpen(false);
  }

  return (
    <div className={s.card}>
      <button className={s.deleteBtn} onClick={onDelete} title="Delete">×</button>
      <button className={s.editBtn} onClick={() => setEditOpen(true)} title="Edit tags">✎</button>
      <div className={s.preview}>
        <canvas
          ref={canvasRef}
          width={TILE}
          height={TILE}
          className={s.canvas}
          data-ready={ready}
        />
      </div>
      <div className={s.meta}>
        <span className={s.id} title={asset.id}>{asset.id.slice(0, 8)}</span>
        <span className={s.frame}>f{asset.frame}</span>
      </div>
      {asset.tags.length > 0 && (
        <div className={s.tags}>
          {asset.tags.map(t => <span key={t} className={s.tag}>{t}</span>)}
        </div>
      )}
      {editOpen && (
        <EditTagsDialog asset={asset} onClose={() => setEditOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
