import type { TilePlacement } from '../entities/types';

export enum WorldEntityKind {
  Tree = 'tree'
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
