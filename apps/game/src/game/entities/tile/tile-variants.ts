import { Biome } from '@absenat/specs';
import { TileVariantKind } from '../types';
import type { AnimatedTileVariant, StaticTileVariant, TileVariant } from '../types';

// frame ref:
// 16 - 23
const waterTiles = [
  createAnimatedVariant(Biome.Water, 0, [16, 17, 18], 0.6),
  createAnimatedVariant(Biome.Water, 1, [18, 19, 21], 0.6),
  createAnimatedVariant(Biome.Water, 2, [20, 21, 16], 0.6),
  createAnimatedVariant(Biome.Water, 3, [22, 23, 20], 0.6),
  createAnimatedVariant(Biome.Water, 4, [16, 18, 19], 0.6)
];

// frame ref:
// 0 - 15
const grassTiles = [
  createStaticVariant(Biome.Grass, 0, 0),
  createStaticVariant(Biome.Grass, 1, 1),
  createStaticVariant(Biome.Grass, 2, 2),
  createStaticVariant(Biome.Grass, 3, 3),
  createStaticVariant(Biome.Grass, 4, 4)
];

export const TILE_VARIANTS = [
  ...grassTiles,
  ...waterTiles,
  ...createVariants(Biome.Dirt, 24, 8),
  ...createVariants(Biome.Sand, 32, 8),
  ...createVariants(Biome.Ice, 40, 8),
  ...createVariants(Biome.Snow, 48, 8),
  ...createVariants(Biome.Wood, 56, 8)
] satisfies readonly TileVariant[];

export function getTileFrame(biome: Biome, variant: number): number {
  return getInitialFrame(findTileVariant(biome, variant)) ?? getDefaultFrame(biome);
}

export function getTileVariant(biome: Biome, variant: number): TileVariant {
  return findTileVariant(biome, variant) ?? getDefaultVariant(biome);
}

export function getTileVariantCount(biome: Biome): number {
  return getTileVariants(biome).length;
}

export function getRandomTileVariant(biome: Biome): TileVariant {
  const variants = getTileVariants(biome);
  const variant = variants[randomInt(0, variants.length - 1)];
  return variant ?? getDefaultVariant(biome);
}

function getDefaultFrame(biome: Biome): number {
  return getVariantInitialFrame(getDefaultVariant(biome));
}

function getDefaultVariant(biome: Biome): TileVariant {
  return findTileVariant(biome, 0) ?? getFallbackVariant();
}

function getFallbackVariant(): TileVariant {
  const [fallback] = TILE_VARIANTS;
  if (!fallback) throw new Error('Tile variants must include at least one fallback variant.');
  return fallback;
}

function findTileVariant(biome: Biome, variant: number): TileVariant | undefined {
  return TILE_VARIANTS.find(tileVariant => isTileVariant(tileVariant, biome, variant));
}

function isTileVariant(tileVariant: TileVariant, biome: Biome, variant: number): boolean {
  return tileVariant.biome === biome && tileVariant.variant === variant;
}

function getTileVariants(biome: Biome): TileVariant[] {
  return TILE_VARIANTS.filter(tileVariant => tileVariant.biome === biome);
}

function getInitialFrame(tileVariant: TileVariant | undefined): number | undefined {
  if (!tileVariant) return undefined;
  return getVariantInitialFrame(tileVariant);
}

function getVariantInitialFrame(tileVariant: TileVariant): number {
  if (tileVariant.kind === TileVariantKind.Static) return tileVariant.frame;
  return tileVariant.frames[0];
}

function createVariants(biome: Biome, firstFrame: number, count: number): StaticTileVariant[] {
  return Array.from({ length: count }, (_, variant) => createStaticVariant(biome, variant, firstFrame + variant));
}

function createStaticVariant(biome: Biome, variant: number, frame: number): StaticTileVariant {
  return {
    kind: TileVariantKind.Static,
    biome,
    variant,
    frame
  };
}

function createAnimatedVariant(
  biome: Biome,
  variant: number,
  frames: number[],
  frameRate: number
): AnimatedTileVariant {
  return {
    kind: TileVariantKind.Animated,
    biome,
    variant,
    frames,
    frameRate
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
