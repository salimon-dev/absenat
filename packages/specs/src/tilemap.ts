export type BiomeCode = 'g' | 's' | 'i' | 'w' | 'd' | 'm' | 'o';

export type TileMode = `${BiomeCode}${BiomeCode}${BiomeCode}${BiomeCode}`;

export type TileType = 'tile';

export interface TileEntry {
  frame: number;
  type: TileType;
  mode: TileMode;
  id: string;
}

export type Tilemap = TileEntry[];
