import type { Biome } from './world.js';

export enum EntityTypeEnum {
  Tree = 'tree',
  Chest = 'chest',
  Mushroom = 'mushroom',
  Rock = 'rock',
  Iron = 'iron',
  Gold = 'gold',
  Copper = 'copper',
  Sign = 'sign',
}
export type EntityType = `${EntityTypeEnum}`;

export type EntityTile = {
  id: string;
  assetId?: string;
  position: { x: number; y: number };
  attributes: {
    walkable: boolean;
    zIndex: number;
    effect: Record<string, number>;
  };
};

export type EntityFrame = {
  order: number;
  tiles: EntityTile[];
};

export type Entity = {
  name: string;
  id: string;
  biomes: Biome[];
  type: EntityType;
  size: {
    w: number; // number of frames in width
    h: number; // number of frames in height
  };
  animateSpeed: number; // 0 = single frame, no animationr
  frames: EntityFrame[];
};
