import { Biome, MODE_CHAR_TO_BIOME, MapModuleTypeEnum } from '@absenat/specs';
import type { TilemapSchema, Tilemap, MapModule } from '@absenat/specs';
import { WORLD_SIZE, TILE_SIZE } from './tiles';

const MODULE_SIZE = 20;

export interface EntityPlacement {
  x: number;
  y: number;
  entityId: string;
}

export interface MapResult {
  tiles: number[][];
  entities: EntityPlacement[];
}

export function generateMap(schema: Tilemap, modules: MapModule[]): MapResult {
  const tileIdToFrame = buildTileIdLookup(schema);
  const tiles: number[][] = Array.from({ length: WORLD_SIZE }, () => new Array<number>(WORLD_SIZE).fill(0));
  const entities: EntityPlacement[] = [];

  const moduleCols = WORLD_SIZE / MODULE_SIZE;
  const moduleRows = WORLD_SIZE / MODULE_SIZE;

  for (let moduleRow = 0; moduleRow < moduleRows; moduleRow++) {
    for (let moduleCol = 0; moduleCol < moduleCols; moduleCol++) {
      const type = getModuleTypeAt(moduleCol, moduleRow, moduleCols, moduleRows);
      const mod = pickModule(type, modules);
      if (!mod) continue;
      placeModuleTiles(tiles, mod, moduleCol, moduleRow, tileIdToFrame);
      placeModuleEntities(entities, mod, moduleCol, moduleRow);
    }
  }

  return { tiles, entities };
}

function buildTileIdLookup(schema: Tilemap): Map<string, number> {
  const map = new Map<string, number>();
  for (const tile of schema) map.set(tile.id, tile.frame);
  return map;
}

function getModuleTypeAt(col: number, row: number, moduleCols: number, moduleRows: number): MapModuleTypeEnum {
  const isTop = row === 0;
  const isBottom = row === moduleRows - 1;
  const isLeft = col === 0;
  const isRight = col === moduleCols - 1;
  if (isTop && isLeft) return MapModuleTypeEnum.TopLeft;
  if (isTop && isRight) return MapModuleTypeEnum.TopRight;
  if (isBottom && isLeft) return MapModuleTypeEnum.Raft;
  if (isBottom && isRight) return MapModuleTypeEnum.BottomRight;
  if (isTop) return MapModuleTypeEnum.Top;
  if (isBottom) return MapModuleTypeEnum.Bottom;
  if (isLeft) return MapModuleTypeEnum.Left;
  if (isRight) return MapModuleTypeEnum.Right;
  return MapModuleTypeEnum.Center;
}

function pickModule(type: MapModuleTypeEnum, modules: MapModule[]): MapModule | null {
  const pool = modules.filter(m => m.type === type);
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  const fallback = modules.filter(m => m.type === MapModuleTypeEnum.Center);
  return fallback[0] ?? null;
}

function placeModuleTiles(
  tiles: number[][],
  mod: MapModule,
  moduleCol: number,
  moduleRow: number,
  tileIdToFrame: Map<string, number>
): void {
  for (let tileRow = 0; tileRow < MODULE_SIZE; tileRow++) {
    for (let tileCol = 0; tileCol < MODULE_SIZE; tileCol++) {
      const tileId = mod.tiles[tileRow * MODULE_SIZE + tileCol];
      tiles[moduleRow * MODULE_SIZE + tileRow][moduleCol * MODULE_SIZE + tileCol] = tileIdToFrame.get(tileId) ?? 0;
    }
  }
}

function placeModuleEntities(
  entities: EntityPlacement[],
  mod: MapModule,
  moduleCol: number,
  moduleRow: number
): void {
  for (const entity of mod.entities) {
    const worldTileX = moduleCol * MODULE_SIZE + entity.col;
    const worldTileY = moduleRow * MODULE_SIZE + entity.row;
    entities.push({
      x: worldTileX * TILE_SIZE + TILE_SIZE / 2,
      y: worldTileY * TILE_SIZE + TILE_SIZE / 2,
      entityId: entity.id,
    });
  }
}

// Kept for wood-area-generator compatibility
export function createTileLookup(schema: TilemapSchema): Map<string, number[]> {
  const lookup = new Map<string, number[]>();
  schema.forEach(tile => {
    const [tl, tr, bl, br] = tile.mode.split('').map(c => MODE_CHAR_TO_BIOME[c]);
    if (!tl || !tr || !bl || !br) return;
    const key = getCornerKey(tl, tr, bl, br);
    if (!lookup.has(key)) lookup.set(key, []);
    lookup.get(key)!.push(tile.frame);
  });
  return lookup;
}

export function selectTile(grid: Biome[][], x: number, y: number, lookup: Map<string, number[]>): number {
  const tl = grid[y][x];
  const tr = grid[y][x + 1];
  const bl = grid[y + 1][x];
  const br = grid[y + 1][x + 1];
  const key = getCornerKey(tl, tr, bl, br);
  const possible = lookup.get(key);
  if (possible && possible.length > 0) return possible[Math.floor(Math.random() * possible.length)];
  const fallbackKey = getCornerKey(tl, tl, tl, tl);
  const fallback = lookup.get(fallbackKey);
  return fallback && fallback.length > 0 ? fallback[0] : 0;
}

function getCornerKey(tl: string, tr: string, bl: string, br: string): string {
  return `${tl},${tr},${bl},${br}`;
}
