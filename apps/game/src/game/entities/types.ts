import type { Biome } from '@absenat/specs';

export interface TileVariant {
  biome: Biome;
  variant: number;
  frame: number;
}

export interface TilePlacement {
  biome: Biome;
  variant: number;
}
