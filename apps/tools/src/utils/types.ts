export enum Terrain {
  Grass = 'grass',
  Water = 'water',
  Dirt = 'dirt',
  Sand = 'sand',
  Ice = 'ice',
  Snow = 'snow',
  Wood = 'wood',
}

export type TerrainType = Terrain;

export type PixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

export type PixelTemplate = Omit<PixelRect, 'fill'>;

export type TerrainPalette = {
  terrain: TerrainType;
  base: string;
  detail: string;
};

export type Tile = {
  base: string;
  pixels: PixelRect[];
};

export type TreeVariant = {
  id: string;
  pixels: PixelRect[];
};

export type TreeAssetData = {
  id: string;
  biome: string;
  resources: { id: string; count: number }[];
  frames: {
    source: { x: number; y: number };
    position: { x: number; y: number };
    walkable: boolean;
  }[];
};
