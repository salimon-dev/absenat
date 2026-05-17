export const tileSize = 16;
export const tileColumns = 8;
export const tileRows = 8;
export const tileCapacity = tileColumns * tileRows;

export function getSheetWidth(): number {
  return tileSize * tileColumns;
}

export function getSheetHeight(): number {
  return tileSize * tileRows;
}

export function getTileX(index: number): number {
  return (index % tileColumns) * tileSize;
}

export function getTileY(index: number): number {
  return Math.floor(index / tileColumns) * tileSize;
}
