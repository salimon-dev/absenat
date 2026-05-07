import { Biome } from '@absenat/specs';
import type { TilemapSchema } from '@absenat/specs';
import { createTileLookup, selectTile } from './map-generator';

const AREA_SIZE = 20;
const WATER_BORDER = 1;

export function generateWoodArea(schema: TilemapSchema): number[][] {
  const cornerSize = AREA_SIZE + 1;
  const corners = buildCornerGrid(cornerSize);
  const lookup = createTileLookup(schema);
  return resolveTiles(corners, lookup);
}

function buildCornerGrid(size: number): Biome[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const onBorder =
        row <= WATER_BORDER ||
        row >= size - 1 - WATER_BORDER ||
        col <= WATER_BORDER ||
        col >= size - 1 - WATER_BORDER;
      return onBorder ? Biome.Water : Biome.Wood;
    })
  );
}

function resolveTiles(corners: Biome[][], lookup: Map<string, number[]>): number[][] {
  return Array.from({ length: AREA_SIZE }, (_, y) =>
    Array.from({ length: AREA_SIZE }, (_, x) => selectTile(corners, x, y, lookup))
  );
}
