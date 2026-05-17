import { Biome } from '@absenat/specs';
import { getTileVariantCount } from '../entities/tile/tile-variants';
import type { TilePlacement } from '../entities/types';
import { MAP_GEN_CONFIG } from './map-generator.config';
import { TILE_SIZE, WORLD_SIZE } from './tiles';
import { WorldEntityKind } from './types';
import type { EntityPlacement, MapResult } from './types';

const TREE_VARIANT_COUNT = 4;
const PATCH_COUNT = 14;
const PATCH_RADIUS_MIN = 5;
const PATCH_RADIUS_MAX = 16;
const ISLAND_RADIUS_X = 0.46;
const ISLAND_RADIUS_Y = 0.42;
const SHORE_WIDTH = 0.12;
const TILE_BIOME_ALIASES: Record<Biome, Biome> = {
  [Biome.Grass]: Biome.Grass,
  [Biome.Water]: Biome.Water,
  [Biome.Dirt]: Biome.Dirt,
  [Biome.Sand]: Biome.Sand,
  [Biome.Desert]: Biome.Sand,
  [Biome.Ice]: Biome.Ice,
  [Biome.Snow]: Biome.Snow,
  [Biome.Wood]: Biome.Grass,
  [Biome.Marsh]: Biome.Dirt,
  [Biome.Lava]: Biome.Water
};

interface BiomePatch {
  x: number;
  y: number;
  radius: number;
  biome: Biome;
}

export function generateMap(): MapResult {
  const corners = buildCornerGrid();
  const tiles = resolveTiles(corners);
  const entities = placeEntities(corners);
  return { tiles, entities };
}

function buildCornerGrid(): Biome[][] {
  const patches = createPatches();
  return Array.from({ length: WORLD_SIZE + 1 }, (_, y) =>
    Array.from({ length: WORLD_SIZE + 1 }, (_, x) => resolveBiome(x, y, patches))
  );
}

function createPatches(): BiomePatch[] {
  return Array.from({ length: PATCH_COUNT }, createPatch);
}

function createPatch(): BiomePatch {
  return {
    x: randomInt(12, WORLD_SIZE - 12),
    y: randomInt(12, WORLD_SIZE - 12),
    radius: randomInt(PATCH_RADIUS_MIN, PATCH_RADIUS_MAX),
    biome: randomPatchBiome()
  };
}

function randomPatchBiome(): Biome {
  const biomes = [Biome.Wood, Biome.Wood, Biome.Dirt, Biome.Marsh];
  return biomes[randomInt(0, biomes.length - 1)];
}

function resolveBiome(x: number, y: number, patches: BiomePatch[]): Biome {
  const island = getIslandScore(x, y);
  if (isOcean(island)) return Biome.Water;
  if (isShore(island)) return Biome.Sand;
  const patch = patches.find(candidate => isInsidePatch(x, y, candidate));
  if (patch) return patch.biome;
  return Math.random() > 0.08 ? Biome.Grass : Biome.Dirt;
}

function getIslandScore(x: number, y: number): number {
  const center = WORLD_SIZE / 2;
  const normalizedX = (x - center) / (WORLD_SIZE * ISLAND_RADIUS_X);
  const normalizedY = (y - center) / (WORLD_SIZE * ISLAND_RADIUS_Y);
  return Math.hypot(normalizedX, normalizedY) + getCoastNoise(x, y);
}

function getCoastNoise(x: number, y: number): number {
  return Math.sin(x * 0.19) * 0.035 + Math.cos(y * 0.23) * 0.035;
}

function isOcean(islandScore: number): boolean {
  return islandScore >= 1;
}

function isShore(islandScore: number): boolean {
  return islandScore >= 1 - SHORE_WIDTH;
}

function isInsidePatch(x: number, y: number, patch: BiomePatch): boolean {
  const distance = Math.hypot(x - patch.x, y - patch.y);
  return distance <= patch.radius;
}

function resolveTiles(corners: Biome[][]): TilePlacement[][] {
  return Array.from({ length: WORLD_SIZE }, (_, y) =>
    Array.from({ length: WORLD_SIZE }, (_, x) => selectTile(corners, x, y))
  );
}

function placeEntities(corners: Biome[][]): EntityPlacement[] {
  const placements: EntityPlacement[] = [];
  for (let y = 0; y < WORLD_SIZE; y++) addRowEntities(placements, corners, y);
  return placements;
}

function addRowEntities(placements: EntityPlacement[], corners: Biome[][], y: number): void {
  for (let x = 0; x < WORLD_SIZE; x++) {
    if (canPlaceTree(corners, x, y)) placements.push(createTreePlacement(x, y));
  }
}

function canPlaceTree(corners: Biome[][], x: number, y: number): boolean {
  const biome = corners[y][x];
  const treeBiome = biome === Biome.Wood || biome === Biome.Grass;
  return treeBiome && Math.random() < MAP_GEN_CONFIG.tree.spawnChance;
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

export function selectTile(grid: Biome[][], x: number, y: number): TilePlacement {
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
  const variantCount = getTileVariantCount(tileBiome);
  return { biome: tileBiome, variant: randomInt(0, variantCount - 1) };
}
