export interface TileSlice {
  dataUrl: string;
  frame: number;
}

export async function sliceImage(file: File, tileSize = 16): Promise<TileSlice[]> {
  const bitmap = await createImageBitmap(file);
  const cols = Math.floor(bitmap.width / tileSize);
  const rows = Math.floor(bitmap.height / tileSize);

  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d')!;
  const slices: TileSlice[] = [];

  for (let frame = 0; frame < cols * rows; frame++) {
    const col = Math.floor(frame / rows);
    const row = frame % rows;
    ctx.clearRect(0, 0, tileSize, tileSize);
    ctx.drawImage(bitmap, col * tileSize, row * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize);
    slices.push({ dataUrl: canvas.toDataURL('image/png'), frame });
  }

  bitmap.close();
  return slices;
}
