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

export type Entity = {
  name: string;
  id: string;
  biomes: Biome[];
  type: EntityType;
  size: {
    w: number; // number of frames in width
    h: number; // number of frames in height
  };
  frames: {
    resourceId: string; // resouce file png name in asset folder
    frame: number; // index of frame in resource
    position: {
      x: number; // position of frame in entity when drawing (frame number in row)
      y: number; // frame number in col
    };
    attributes: {
      walkable: boolean;
      zindex: number;
      passiveDamage: number;
    };
  }[];
};
