import type { AssetSchema } from '@absenat/specs';
import type { AssetEntry } from '../components/Assets/types';

const TILE_SIZE = 16;

function computeGrid(count: number): { cols: number; rows: number } {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return { cols, rows };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildAtlasBlob(assets: AssetEntry[], cols: number, rows: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = cols * TILE_SIZE;
  canvas.height = rows * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < assets.length; i++) {
    const img = await loadImage(assets[i].dataUrl);
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, 'image/png');
  });
}

async function writeFile(dir: FileSystemDirectoryHandle, name: string, blob: Blob): Promise<void> {
  const fileHandle = await dir.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function exportTiles(
  assets: AssetEntry[],
  folderHandle: FileSystemDirectoryHandle,
): Promise<void> {
  if (assets.length === 0) return;

  const { cols, rows } = computeGrid(assets.length);
  const atlasBlob = await buildAtlasBlob(assets, cols, rows);

  const json: AssetSchema[] = assets.map((a, i) => ({
    id: a.id,
    frame: i,
    tags: a.tags,
  }));
  const jsonBlob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });

  await Promise.all([
    writeFile(folderHandle, 'tiles.png', atlasBlob),
    writeFile(folderHandle, 'tiles.json', jsonBlob),
  ]);
}
