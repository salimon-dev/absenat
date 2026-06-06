import type { Biome } from '@absenat/specs';
import type { TilePlacement } from '../entities/types';

export interface RenderedTileSnapshot {
  biome: Biome;
  variant: number;
}

export function getRenderedTilePlacements(
  tiles: readonly RenderedTileSnapshot[],
  worldSize: number
): TilePlacement[][] {
  return Array.from({ length: worldSize }, (_, y) => getTilePlacementRow(tiles, y, worldSize));
}

function getTilePlacementRow(
  tiles: readonly RenderedTileSnapshot[],
  y: number,
  worldSize: number
): TilePlacement[] {
  return tiles.slice(y * worldSize, (y + 1) * worldSize).map(tile => ({
    biome: tile.biome,
    variant: tile.variant
  }));
}
