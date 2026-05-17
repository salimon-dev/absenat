const TILE_SIZE = 16;
const MAX_ROWS = 16;

async function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Unable to load tile image.'));
  });
  return image;
}

function getSheetSize(tileCount: number): [number, number] {
  const rows = Math.min(MAX_ROWS, tileCount);
  const cols = Math.ceil(tileCount / MAX_ROWS);
  return [cols * TILE_SIZE, rows * TILE_SIZE];
}

function getTilePosition(index: number): [number, number] {
  const col = Math.floor(index / MAX_ROWS);
  const row = index % MAX_ROWS;
  return [col * TILE_SIZE, row * TILE_SIZE];
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to create PNG file.'));
    }, 'image/png');
  });
}

export async function createTileSheetFile(
  filename: string,
  tileDataUrls: string[],
): Promise<File> {
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = getSheetSize(tileDataUrls.length);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available.');

  for (const [index, dataUrl] of tileDataUrls.entries()) {
    const [x, y] = getTilePosition(index);
    ctx.drawImage(await dataUrlToImage(dataUrl), x, y, TILE_SIZE, TILE_SIZE);
  }

  return new File([await canvasToPngBlob(canvas)], filename, { type: 'image/png' });
}
