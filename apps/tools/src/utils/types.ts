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

export enum ToolAsset {
  Bow = 'bow',
  Sword = 'sword',
  Axe = 'axe',
  Pickaxe = 'pickaxe',
  Hammer = 'hammer',
}

export type ToolAssetType = ToolAsset;

export type ToolVariant = {
  id: ToolAssetType;
  pixels: PixelRect[];
};

export enum NpcAsset {
  Skeleton = 'skeleton',
}

export type NpcAssetType = NpcAsset;

export enum NpcAnimation {
  IdleDown = 'idle-down',
  WalkUp = 'walk-up',
  WalkLeft = 'walk-left',
  WalkDown = 'walk-down',
  WalkRight = 'walk-right',
}

export type NpcAnimationType = NpcAnimation;

export type NpcAnimationRow = {
  id: NpcAnimationType;
  frames: PixelRect[][];
};

export type NpcVariant = {
  id: NpcAssetType;
  animations: NpcAnimationRow[];
};

export type NpcAssetData = {
  id: NpcAssetType;
  frameWidth: number;
  frameHeight: number;
  animations: {
    id: NpcAnimationType;
    row: number;
    frames: number[];
  }[];
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

export enum ResourceNodeAsset {
  RedMushroom = 'red-mushroom',
  BlueMushroom = 'blue-mushroom',
  GreenMushroom = 'green-mushroom',
  StoneOre = 'stone-ore',
  IronOre = 'iron-ore',
  CopperOre = 'copper-ore',
  GoldOre = 'gold-ore',
  BlueBerries = 'blue-berries',
  Wheat = 'wheat',
  Watermelon = 'watermelon',
  Pumpkin = 'pumpkin',
}

export type ResourceNodeAssetType = ResourceNodeAsset;

export type ResourceNodeVariant = {
  id: ResourceNodeAssetType;
  pixels: PixelRect[];
};

export type ResourceNodeAssetData = {
  id: ResourceNodeAssetType;
  frame: number;
};
