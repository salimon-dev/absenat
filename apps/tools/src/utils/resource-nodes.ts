import { ResourceNodeAsset, type PixelRect, type ResourceNodeAssetData, type ResourceNodeVariant } from './types.ts';

export const resourceNodeWidth = 16;
export const resourceNodeHeight = 16;

export const resourceNodeVariants: ResourceNodeVariant[] = [
  { id: ResourceNodeAsset.RedMushroom, pixels: createMushroom('#c93636') },
  { id: ResourceNodeAsset.BlueMushroom, pixels: createMushroom('#3a68d8') },
  { id: ResourceNodeAsset.GreenMushroom, pixels: createMushroom('#3b9f53') },
  { id: ResourceNodeAsset.StoneOre, pixels: createOre('#6f777b', '#a7b0b0') },
  { id: ResourceNodeAsset.IronOre, pixels: createOre('#8798a1', '#d8e2e2') },
  { id: ResourceNodeAsset.CopperOre, pixels: createOre('#bd6638', '#ee9a51') },
  { id: ResourceNodeAsset.GoldOre, pixels: createOre('#dfa832', '#ffe070') },
  { id: ResourceNodeAsset.BlueBerries, pixels: createBlueBerries() },
  { id: ResourceNodeAsset.Wheat, pixels: createWheat() },
  { id: ResourceNodeAsset.Watermelon, pixels: createWatermelon() },
  { id: ResourceNodeAsset.Pumpkin, pixels: createPumpkin() },
];

export function createResourceNodeAssetData(variants: ResourceNodeVariant[]): ResourceNodeAssetData[] {
  return variants.map((variant, frame) => ({ id: variant.id, frame }));
}

function createMushroom(cap: string): PixelRect[] {
  return [
    rect(6, 8, 4, 6, '#d6b989'), rect(5, 12, 6, 2, '#6b4f3b'),
    rect(3, 5, 10, 4, '#2a201d'), rect(4, 4, 8, 4, cap),
    rect(5, 5, 2, 1, '#f5ebc2'), rect(10, 6, 1, 1, '#f5ebc2'),
  ];
}

function createOre(base: string, light: string): PixelRect[] {
  return [
    rect(3, 7, 10, 6, '#2a201d'), rect(2, 9, 12, 3, '#2a201d'),
    rect(4, 6, 8, 6, base), rect(5, 7, 3, 2, light),
    rect(9, 10, 3, 1, '#44494d'),
  ];
}

function createBlueBerries(): PixelRect[] {
  return [
    rect(7, 5, 2, 8, '#2e824a'), rect(4, 8, 7, 1, '#2e824a'),
    rect(3, 7, 4, 4, '#2a201d'), rect(9, 5, 4, 4, '#2a201d'),
    rect(7, 10, 4, 4, '#2a201d'), rect(4, 8, 2, 2, '#2f55cb'),
    rect(10, 6, 2, 2, '#2f55cb'), rect(8, 11, 2, 2, '#2f55cb'),
  ];
}

function createWheat(): PixelRect[] {
  return [
    rect(8, 4, 1, 10, '#d3a535'), rect(5, 5, 3, 1, '#f4cf5e'),
    rect(9, 6, 3, 1, '#f4cf5e'), rect(5, 8, 3, 1, '#d3a535'),
    rect(9, 9, 3, 1, '#d3a535'), rect(7, 13, 3, 1, '#8f6d24'),
  ];
}

function createWatermelon(): PixelRect[] {
  return [
    rect(3, 7, 10, 5, '#2a201d'), rect(4, 6, 8, 7, '#4db256'),
    rect(5, 7, 1, 5, '#27763d'), rect(10, 7, 1, 5, '#27763d'),
  ];
}

function createPumpkin(): PixelRect[] {
  return [
    rect(3, 6, 10, 7, '#2a201d'), rect(4, 5, 8, 8, '#dc7925'),
    rect(8, 5, 1, 8, '#974e1d'), rect(7, 3, 3, 3, '#66432a'),
  ];
}

function rect(x: number, y: number, width: number, height: number, fill: string): PixelRect {
  return { x, y, width, height, fill };
}
