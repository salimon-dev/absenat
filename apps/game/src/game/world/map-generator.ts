import { Biome } from '@absenat/specs';
import { getRandomTileVariant } from '../entities/tile/tile-variants';
import type { TilePlacement } from '../entities/types';
import { MAP_GEN_CONFIG } from './map-generator.config';
import {
  getRaftLandingBounds,
  isRaftFloorTile,
  isRaftLandingTile,
  isRaftWaterTile
} from './raft';
import { TILE_SIZE, WORLD_SIZE } from './tiles';
import { WorldEntityKind } from './types';
import type { EntityPlacement, MapResult } from './types';

const TREE_VARIANT_COUNT = 4;
const BACKGROUND_DIRT_CHANCE = 0.03;
const SHORE_WIDTH = 1;
const TILE_BIOME_ALIASES: Record<Biome, Biome> = {
  [Biome.Grass]: Biome.Grass,
  [Biome.Water]: Biome.Water,
  [Biome.Dirt]: Biome.Dirt,
  [Biome.Sand]: Biome.Sand,
  [Biome.Desert]: Biome.Sand,
  [Biome.Ice]: Biome.Ice,
  [Biome.Snow]: Biome.Snow,
  [Biome.Wood]: Biome.Wood,
  [Biome.Marsh]: Biome.Dirt,
  [Biome.Lava]: Biome.Water
};

interface BiomePatch {
  x: number;
  y: number;
  radius: number;
  biome: Biome;
}

interface BodyConfig {
  countMin: number;
  countMax: number;
  sizeMin: number;
  sizeMax: number;
}

export function generateMap(): MapResult {
  const waterBorder = randomWaterBorder();
  const corners = buildCornerGrid(waterBorder);
  carveRaftLanding(corners);
  const tiles = resolveTiles(corners, waterBorder);
  const entities = placeEntities(corners, waterBorder);
  return { tiles, entities };
}

function randomWaterBorder(): number {
  const { borderMin, borderMax } = MAP_GEN_CONFIG.water;
  return randomInt(borderMin, borderMax);
}

function buildCornerGrid(waterBorder: number): Biome[][] {
  const patches = createPatches();
  return Array.from({ length: WORLD_SIZE + 1 }, (_, y) =>
    Array.from({ length: WORLD_SIZE + 1 }, (_, x) => resolveBiome(x, y, patches, waterBorder))
  );
}

function createPatches(): BiomePatch[] {
  const { waterBodies, dirtBodies } = MAP_GEN_CONFIG.island;
  return shufflePatches([
    ...createBiomePatches(Biome.Water, waterBodies),
    ...createBiomePatches(Biome.Dirt, dirtBodies)
  ]);
}

function createBiomePatches(biome: Biome, config: BodyConfig): BiomePatch[] {
  return Array.from({ length: randomBodyCount(config) }, () => createPatch(biome, config));
}

function randomBodyCount(config: BodyConfig): number {
  return randomInt(config.countMin, config.countMax);
}

function createPatch(biome: Biome, config: BodyConfig): BiomePatch {
  return {
    x: randomInt(12, WORLD_SIZE - 12),
    y: randomInt(12, WORLD_SIZE - 12),
    radius: randomInt(config.sizeMin, config.sizeMax),
    biome
  };
}

function shufflePatches(patches: BiomePatch[]): BiomePatch[] {
  return patches
    .map(patch => ({ patch, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ patch }) => patch);
}

function resolveBiome(x: number, y: number, patches: BiomePatch[], waterBorder: number): Biome {
  if (isWaterBorderCorner(x, y, waterBorder)) return Biome.Water;
  if (isShoreCorner(x, y, waterBorder)) return Biome.Sand;
  const patch = patches.find(candidate => isInsidePatch(x, y, candidate));
  if (patch) return patch.biome;
  return Math.random() > BACKGROUND_DIRT_CHANCE ? Biome.Grass : Biome.Dirt;
}

function isWaterBorderCorner(x: number, y: number, waterBorder: number): boolean {
  return isWaterBorderIndex(x, waterBorder) || isWaterBorderIndex(y, waterBorder);
}

function isWaterBorderIndex(index: number, waterBorder: number): boolean {
  return index < waterBorder || index > WORLD_SIZE - waterBorder;
}

function isShoreCorner(x: number, y: number, waterBorder: number): boolean {
  return getClosestEdgeDistance(x, y) <= waterBorder + SHORE_WIDTH;
}

function getClosestEdgeDistance(x: number, y: number): number {
  return Math.min(x, y, WORLD_SIZE - x, WORLD_SIZE - y);
}

function isInsidePatch(x: number, y: number, patch: BiomePatch): boolean {
  const distance = Math.hypot(x - patch.x, y - patch.y);
  return distance <= patch.radius;
}

function resolveTiles(corners: Biome[][], waterBorder: number): TilePlacement[][] {
  return Array.from({ length: WORLD_SIZE }, (_, y) =>
    Array.from({ length: WORLD_SIZE }, (_, x) => selectWorldTile(corners, x, y, waterBorder))
  );
}

function selectWorldTile(corners: Biome[][], x: number, y: number, waterBorder: number): TilePlacement {
  if (isRaftFloorTile(x, y)) return selectBiomeTile(Biome.Wood);
  if (isRaftWaterTile(x, y)) return selectBiomeTile(Biome.Water);
  if (isWaterBorderTile(x, y, waterBorder)) return selectBiomeTile(Biome.Water);
  return selectTile(corners, x, y);
}

function carveRaftLanding(corners: Biome[][]): void {
  const landing = getRaftLandingBounds();
  for (let y = landing.top; y <= landing.bottom + 1; y++) {
    for (let x = landing.left; x <= landing.right + 1; x++) {
      corners[y][x] = Biome.Sand;
    }
  }
}

function isWaterBorderTile(x: number, y: number, waterBorder: number): boolean {
  return x < waterBorder || y < waterBorder || x >= WORLD_SIZE - waterBorder || y >= WORLD_SIZE - waterBorder;
}

function placeEntities(corners: Biome[][], waterBorder: number): EntityPlacement[] {
  const placements: EntityPlacement[] = [];
  for (let y = 0; y < WORLD_SIZE; y++) addRowEntities(placements, corners, y, waterBorder);
  return placements;
}

function addRowEntities(
  placements: EntityPlacement[],
  corners: Biome[][],
  y: number,
  waterBorder: number
): void {
  for (let x = 0; x < WORLD_SIZE; x++) {
    if (canPlaceTree(corners, x, y, waterBorder)) placements.push(createTreePlacement(x, y));
  }
}

function canPlaceTree(corners: Biome[][], x: number, y: number, waterBorder: number): boolean {
  if (isRaftFloorTile(x, y) || isRaftWaterTile(x, y)) return false;
  if (isRaftLandingTile(x, y)) return false;
  if (isWaterBorderTile(x, y, waterBorder)) return false;
  if (hasWaterInTreeFootprint(corners, x, y)) return false;
  const biome = corners[y][x];
  return biome === Biome.Grass && Math.random() < MAP_GEN_CONFIG.tree.spawnChance;
}

function hasWaterInTreeFootprint(corners: Biome[][], x: number, y: number): boolean {
  if (y === 0) return true;
  return hasWaterInTileCorners(corners, x, y - 1) || hasWaterInTileCorners(corners, x, y);
}

function hasWaterInTileCorners(corners: Biome[][], x: number, y: number): boolean {
  return getTileCorners(corners, x, y).some(biome => biome === Biome.Water);
}

function getTileCorners(corners: Biome[][], x: number, y: number): Biome[] {
  return [corners[y][x], corners[y][x + 1], corners[y + 1][x], corners[y + 1][x + 1]];
}

function createTreePlacement(tileX: number, tileY: number): EntityPlacement {
  return {
    x: tileX * TILE_SIZE,
    y: (tileY + 1) * TILE_SIZE,
    kind: WorldEntityKind.Tree,
    variant: randomInt(0, TREE_VARIANT_COUNT - 1)
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectTile(grid: Biome[][], x: number, y: number): TilePlacement {
  return selectBiomeTile(getDominantBiome(grid, x, y));
}

function getDominantBiome(grid: Biome[][], x: number, y: number): Biome {
  const biomes = [grid[y][x], grid[y][x + 1], grid[y + 1][x], grid[y + 1][x + 1]];
  return biomes.sort((a, b) => getBiomeCount(biomes, b) - getBiomeCount(biomes, a))[0];
}

function getBiomeCount(biomes: Biome[], biome: Biome): number {
  return biomes.filter(candidate => candidate === biome).length;
}

function selectBiomeTile(biome: Biome): TilePlacement {
  const tileBiome = TILE_BIOME_ALIASES[biome];
  const tileVariant = getRandomTileVariant(tileBiome);
  return { biome: tileBiome, variant: tileVariant.variant };
}
