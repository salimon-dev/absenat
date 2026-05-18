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

export enum ToolSwingDirection {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right'
}

export type ToolSwingDirectionType = ToolSwingDirection;
