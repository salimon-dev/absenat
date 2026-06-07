import type { TilePlacement } from '../entities/types';

export enum WorldEntityKind {
  BlueBerries = 'blue-berries',
  Mushroom = 'mushroom',
  OreRock = 'ore-rock',
  Pumpkin = 'pumpkin',
  Tree = 'tree',
  Watermelon = 'watermelon',
  Wheat = 'wheat'
}

export type WorldEntityKindType = WorldEntityKind;

export interface EntityPlacement {
  x: number;
  y: number;
  kind: WorldEntityKindType;
  variant: number;
}

export interface MapResult {
  tiles: TilePlacement[][];
  entities: EntityPlacement[];
}
