import { getSheetHeight, getSheetWidth, getTileX, getTileY, tileCapacity, tileSize } from './tile-layout.ts';
import { offsetRect, renderRect } from './rects.ts';
import type { Tile } from './types.ts';

export function createTilesSvg(tiles: Tile[]): string {
  assertTileCapacity(tiles.length);
  return [
    renderSvgOpening(),
    tiles.map(renderTile).join(''),
    '</svg>',
  ].join('');
}

function assertTileCapacity(tileCount: number): void {
  if (tileCount > tileCapacity) {
    throw new Error(`Tile count ${tileCount} exceeds sheet capacity ${tileCapacity}.`);
  }
}

function renderSvgOpening(): string {
  const width = getSheetWidth();
  const height = getSheetHeight();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="crispEdges">`;
}

function renderTile(tile: Tile, index: number): string {
  const tileX = getTileX(index);
  const tileY = getTileY(index);
  return renderTileRects(tile, tileX, tileY);
}

function renderTileRects(tile: Tile, tileX: number, tileY: number): string {
  return [
    renderRect({ x: tileX, y: tileY, width: tileSize, height: tileSize, fill: tile.base }),
    tile.pixels.map((pixel) => renderRect(offsetRect(pixel, tileX, tileY))).join(''),
  ].join('');
}
