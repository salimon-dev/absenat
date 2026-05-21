import type { AssetSchema } from '@absenat/specs';

const ASSETS_DIR = 'assets';
const DATA_JSON = 'data.json';
const TILE_SIZE = 16;
const SHEET_COLS = 16;
const SHEET_ROWS = 16;
const FRAMES_PER_SHEET = SHEET_COLS * SHEET_ROWS;

async function getAssetsDir(root: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> {
  return root.getDirectoryHandle(ASSETS_DIR, { create: true });
}

function isPngFile(handle: FileSystemHandle): handle is FileSystemFileHandle {
  return handle.kind === 'file' && handle.name.toLowerCase().endsWith('.png');
}

export async function readAssetFiles(root: FileSystemDirectoryHandle): Promise<File[]> {
  const dir = await getAssetsDir(root);
  const files: File[] = [];
  for await (const handle of dir.values()) {
    if (isPngFile(handle)) files.push(await handle.getFile());
  }
  return files.sort((left, right) => left.name.localeCompare(right.name));
}

export async function writeAssetFile(
  root: FileSystemDirectoryHandle,
  file: File,
): Promise<void> {
  const dir = await getAssetsDir(root);
  const fileHandle = await dir.getFileHandle(file.name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();
}

export async function readPublicAssetImageFiles(
  root: FileSystemDirectoryHandle,
): Promise<File[]> {
  const files: File[] = [];
  for await (const handle of root.values()) {
    if (isPngFile(handle)) files.push(await handle.getFile());
  }
  return files.sort((left, right) => left.name.localeCompare(right.name));
}

export async function readPublicAssetImageFile(
  root: FileSystemDirectoryHandle,
  filename: string,
): Promise<File | null> {
  try {
    const handle = await root.getFileHandle(filename);
    return handle.getFile();
  } catch {
    return null;
  }
}

export async function writePublicAssetImageBlob(
  root: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob,
): Promise<void> {
  const handle = await root.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function readAssets(root: FileSystemDirectoryHandle): Promise<AssetSchema[]> {
  try {
    const dir = await getAssetsDir(root);
    const fileHandle = await dir.getFileHandle(DATA_JSON);
    const file = await fileHandle.getFile();
    return JSON.parse(await file.text()) as AssetSchema[];
  } catch {
    return [];
  }
}

export async function writeAssets(
  root: FileSystemDirectoryHandle,
  assets: AssetSchema[],
): Promise<void> {
  const dir = await getAssetsDir(root);
  const fileHandle = await dir.getFileHandle(DATA_JSON, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(assets, null, 2));
  await writable.close();
}

export async function loadTilePng(
  root: FileSystemDirectoryHandle,
  filename: string,
): Promise<string | null> {
  try {
    const dir = await getAssetsDir(root);
    const fileHandle = await dir.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}

// column-major: frame 0 = col 0 row 0, frame 1 = col 0 row 1, ..., frame 16 = col 1 row 0
function frameToColRow(frame: number): [number, number] {
  return [Math.floor(frame / SHEET_ROWS), frame % SHEET_ROWS];
}

async function loadSheetCanvas(
  root: FileSystemDirectoryHandle,
  sheetIndex: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = SHEET_COLS * TILE_SIZE;
  canvas.height = SHEET_ROWS * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  const url = await loadTilePng(root, `frames-${sheetIndex}.png`);
  if (url) {
    const img = new Image();
    img.src = url;
    await new Promise<void>(res => { img.onload = () => res(); });
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
  }
  return canvas;
}

async function saveSheetCanvas(
  root: FileSystemDirectoryHandle,
  sheetIndex: number,
  canvas: HTMLCanvasElement,
): Promise<void> {
  const dir = await getAssetsDir(root);
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'),
  );
  const fileHandle = await dir.getFileHandle(`frames-${sheetIndex}.png`, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function packTilesIntoSheets(
  root: FileSystemDirectoryHandle,
  existingAssets: AssetSchema[],
  tileDataUrls: string[],
): Promise<AssetSchema[]> {
  // Count how many tiles each sheet already holds to find the next free slot
  const tilesPerSheet = new Map<number, number>();
  for (const asset of existingAssets) {
    const match = asset.source.match(/^frames-(\d+)\.png$/);
    if (match) {
      const n = parseInt(match[1]);
      tilesPerSheet.set(n, (tilesPerSheet.get(n) ?? 0) + 1);
    }
  }

  let currentSheet = tilesPerSheet.size > 0 ? Math.max(...tilesPerSheet.keys()) : 0;
  let nextFrame = tilesPerSheet.get(currentSheet) ?? 0;

  const canvases = new Map<number, HTMLCanvasElement>();
  const newAssets: AssetSchema[] = [];

  for (const dataUrl of tileDataUrls) {
    if (nextFrame >= FRAMES_PER_SHEET) {
      currentSheet++;
      nextFrame = 0;
    }

    if (!canvases.has(currentSheet)) {
      canvases.set(currentSheet, await loadSheetCanvas(root, currentSheet));
    }

    const canvas = canvases.get(currentSheet)!;
    const ctx = canvas.getContext('2d')!;
    const [col, row] = frameToColRow(nextFrame);

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>(res => { img.onload = () => res(); });
    ctx.drawImage(img, 0, 0, TILE_SIZE, TILE_SIZE, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    newAssets.push({
      id: crypto.randomUUID(),
      frame: nextFrame,
      tags: [],
      source: `frames-${currentSheet}.png`,
    });

    nextFrame++;
  }

  for (const [sheetIndex, canvas] of canvases) {
    await saveSheetCanvas(root, sheetIndex, canvas);
  }

  return newAssets;
}
