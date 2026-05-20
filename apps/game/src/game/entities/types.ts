import type { Biome } from '@absenat/specs';
import type { ItemName } from '../../utils/items';

export enum TileVariantKind {
  Static = 'static',
  Animated = 'animated'
}

export type TileVariantKindType = TileVariantKind;

export interface StaticTileVariant {
  kind: TileVariantKind.Static;
  biome: Biome;
  variant: number;
  frame: number;
}

export interface AnimatedTileVariant {
  kind: TileVariantKind.Animated;
  biome: Biome;
  variant: number;
  frames: number[];
  frameRate: number;
}

export type TileVariant = StaticTileVariant | AnimatedTileVariant;

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

export type EntityContent = { name: ItemName; count: number }[];
