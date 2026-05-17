export enum Biome {
  Snow = 'snow',
  Ice = 'ice',
  Lava = 'lava',
  Water = 'water',
  Grass = 'grass',
  Marsh = 'marsh',
  Desert = 'desert',
  Sand = 'sand',
  Dirt = 'dirt',
  Wood = 'wood'
}

export type BiomeType = Biome;

// Maps single-char mode codes in tilemap.json to Biome values.
// Mode string order: TL, TR, BL, BR (e.g. "gwwg" = grass TL, water TR, water BL, grass BR)
export const MODE_CHAR_TO_BIOME: Record<string, Biome> = {
  g: Biome.Grass,
  w: Biome.Water,
  d: Biome.Dirt,
  a: Biome.Sand,
  m: Biome.Marsh,
  n: Biome.Snow,
  i: Biome.Ice,
  o: Biome.Wood,
};

export interface TileSchema {
  frame: number;
  mode: string;
}

export type TilemapSchema = TileSchema[];
