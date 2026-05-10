import type { Biome } from '@absenat/specs';

export type TreeData = {
  id: string;
  biome: Biome;
  resources: { id: string; count: number }[];
  frames: {
    source: { x: number; y: number };
    position: { x: number; y: number };
    walkable: boolean;
  }[];
};
