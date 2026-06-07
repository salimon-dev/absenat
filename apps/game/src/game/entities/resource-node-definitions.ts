import { Biome } from '@absenat/specs';
import { ResourceType } from '../../utils/resources';
import { WorldEntityKind, type WorldEntityKindType } from '../world/types';
import type { EntityContent } from './types';

export const RESOURCE_NODE_TEXTURE_KEY = 'world-resources';
export const RESOURCE_NODE_ASSET_PATH = 'assets/world-resources.png';
export const RESOURCE_NODE_FRAME_SIZE = 16;

export enum ResourceNodeLayerDepth {
  Ground = 'ground',
  Tall = 'tall'
}

export type ResourceNodeLayerDepthType = ResourceNodeLayerDepth;

export enum ResourceNodeCollision {
  Blocking = 'blocking',
  Passable = 'passable'
}

export type ResourceNodeCollisionType = ResourceNodeCollision;

export interface ResourceNodeLayer {
  frameOffset: number;
  yOffset: number;
  depth: ResourceNodeLayerDepthType;
}

export interface ResourceNodeDefinition {
  kind: WorldEntityKindType;
  textureKey: string;
  maxHp: number;
  variantCount: number;
  allowedBiomes: Biome[];
  collision: ResourceNodeCollisionType;
  content: EntityContent;
  layers: ResourceNodeLayer[];
}

const TREE_TEXTURE_KEY = 'trees';
const TREE_VARIANT_COUNT = 4;

export const RESOURCE_NODE_DEFINITIONS: Record<WorldEntityKindType, ResourceNodeDefinition> = {
  [WorldEntityKind.Tree]: {
    kind: WorldEntityKind.Tree,
    textureKey: TREE_TEXTURE_KEY,
    maxHp: 10,
    variantCount: TREE_VARIANT_COUNT,
    allowedBiomes: [Biome.Grass],
    collision: ResourceNodeCollision.Blocking,
    content: [{ name: ResourceType.Wood, count: 3 }],
    layers: [
      { frameOffset: 0, yOffset: -RESOURCE_NODE_FRAME_SIZE, depth: ResourceNodeLayerDepth.Tall },
      { frameOffset: TREE_VARIANT_COUNT, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }
    ]
  },
  [WorldEntityKind.Mushroom]: {
    kind: WorldEntityKind.Mushroom,
    textureKey: RESOURCE_NODE_TEXTURE_KEY,
    maxHp: 3,
    variantCount: 3,
    allowedBiomes: [Biome.Grass, Biome.Dirt],
    collision: ResourceNodeCollision.Passable,
    content: [{ name: ResourceType.RedMushroom, count: 1 }],
    layers: [{ frameOffset: 0, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }]
  },
  [WorldEntityKind.OreRock]: {
    kind: WorldEntityKind.OreRock,
    textureKey: RESOURCE_NODE_TEXTURE_KEY,
    maxHp: 8,
    variantCount: 4,
    allowedBiomes: [Biome.Grass, Biome.Dirt, Biome.Sand],
    collision: ResourceNodeCollision.Blocking,
    content: [{ name: ResourceType.Stone, count: 2 }],
    layers: [{ frameOffset: 3, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }]
  },
  [WorldEntityKind.BlueBerries]: {
    kind: WorldEntityKind.BlueBerries,
    textureKey: RESOURCE_NODE_TEXTURE_KEY,
    maxHp: 4,
    variantCount: 1,
    allowedBiomes: [Biome.Grass],
    collision: ResourceNodeCollision.Passable,
    content: [{ name: ResourceType.BlueBerries, count: 2 }],
    layers: [{ frameOffset: 7, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }]
  },
  [WorldEntityKind.Wheat]: {
    kind: WorldEntityKind.Wheat,
    textureKey: RESOURCE_NODE_TEXTURE_KEY,
    maxHp: 3,
    variantCount: 1,
    allowedBiomes: [Biome.Grass, Biome.Dirt],
    collision: ResourceNodeCollision.Passable,
    content: [{ name: ResourceType.Wheat, count: 2 }],
    layers: [{ frameOffset: 8, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }]
  },
  [WorldEntityKind.Watermelon]: {
    kind: WorldEntityKind.Watermelon,
    textureKey: RESOURCE_NODE_TEXTURE_KEY,
    maxHp: 5,
    variantCount: 1,
    allowedBiomes: [Biome.Grass],
    collision: ResourceNodeCollision.Blocking,
    content: [{ name: ResourceType.Watermelon, count: 1 }],
    layers: [{ frameOffset: 9, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }]
  },
  [WorldEntityKind.Pumpkin]: {
    kind: WorldEntityKind.Pumpkin,
    textureKey: RESOURCE_NODE_TEXTURE_KEY,
    maxHp: 5,
    variantCount: 1,
    allowedBiomes: [Biome.Grass, Biome.Dirt],
    collision: ResourceNodeCollision.Blocking,
    content: [{ name: ResourceType.Pumpkin, count: 1 }],
    layers: [{ frameOffset: 10, yOffset: 0, depth: ResourceNodeLayerDepth.Ground }]
  }
};

export function getResourceNodeDefinition(kind: WorldEntityKindType): ResourceNodeDefinition {
  return RESOURCE_NODE_DEFINITIONS[kind];
}

export function getResourceNodeContent(kind: WorldEntityKindType, variant: number): EntityContent {
  if (kind === WorldEntityKind.Mushroom) return getMushroomContent(variant);
  if (kind === WorldEntityKind.OreRock) return getOreContent(variant);
  return cloneContent(getResourceNodeDefinition(kind).content);
}

function getMushroomContent(variant: number): EntityContent {
  const names = [ResourceType.RedMushroom, ResourceType.BlueMushroom, ResourceType.GreenMushroom];
  return [{ name: names[variant] ?? ResourceType.RedMushroom, count: 1 }];
}

function getOreContent(variant: number): EntityContent {
  const names = [ResourceType.Stone, ResourceType.Iron, ResourceType.Copper, ResourceType.Gold];
  return [{ name: names[variant] ?? ResourceType.Stone, count: variant === 0 ? 2 : 1 }];
}

function cloneContent(content: EntityContent): EntityContent {
  return content.map(item => ({ ...item }));
}
