import { useEffect, useRef, useState } from 'react';
import type { AssetSchema } from '@absenat/specs';
import { loadTilePng } from '../../lib/assetsDb';
import s from './AssetPreview.module.css';

interface Props {
  asset: AssetSchema;
  folderHandle: FileSystemDirectoryHandle;
  size?: 'small' | 'large';
}

const TILE = 16;

export function AssetPreview({ asset, folderHandle, size = 'large' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;

    async function draw() {
      setReady(false);
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
      ctx.clearRect(0, 0, TILE, TILE);
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

  return (
    <canvas
      ref={canvasRef}
      width={TILE}
      height={TILE}
      className={s.canvas}
      data-ready={ready}
      data-size={size}
    />
  );
}

