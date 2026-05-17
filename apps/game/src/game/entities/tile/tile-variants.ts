import { Biome } from '@absenat/specs';
import type { TileVariant } from '../types';

export const TILE_VARIANTS = [
  ...createVariants(Biome.Grass, 0, 16),
  ...createVariants(Biome.Water, 16, 8),
  ...createVariants(Biome.Dirt, 24, 8),
  ...createVariants(Biome.Sand, 32, 8),
  ...createVariants(Biome.Ice, 40, 8),
  ...createVariants(Biome.Snow, 48, 8),
  ...createVariants(Biome.Wood, 56, 8)
] satisfies readonly TileVariant[];

export function getTileFrame(biome: Biome, variant: number): number {
  return findTileVariant(biome, variant)?.frame ?? getDefaultFrame(biome);
}

export function getTileVariantCount(biome: Biome): number {
  return TILE_VARIANTS.filter(tileVariant => tileVariant.biome === biome).length;
}

function getDefaultFrame(biome: Biome): number {
  const tileVariant = findTileVariant(biome, 0);
  if (tileVariant) return tileVariant.frame;
  return getFallbackFrame();
}

function getFallbackFrame(): number {
  const [fallback] = TILE_VARIANTS;
  return fallback.frame;
}

function findTileVariant(biome: Biome, variant: number): TileVariant | undefined {
  return TILE_VARIANTS.find(tileVariant => isTileVariant(tileVariant, biome, variant));
}

function isTileVariant(tileVariant: TileVariant, biome: Biome, variant: number): boolean {
  return tileVariant.biome === biome && tileVariant.variant === variant;
}

function createVariants(biome: Biome, firstFrame: number, count: number): TileVariant[] {
  return Array.from({ length: count }, (_, variant) => ({
    biome,
    variant,
    frame: firstFrame + variant
  }));
}
