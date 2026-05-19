import type { PixelRect, ToolVariant } from './types.ts';
import { ToolAsset } from './types.ts';

const wood = '#8b5a2b';
const woodDark = '#5c3518';
const leather = '#b07a3f';
const cord = '#ead7a0';
const steel = '#cbd5df';
const steelLight = '#f1f5f9';
const steelDark = '#6b7885';
const gold = '#d8a33a';

export const toolSize = 16;
export const toolVariants: ToolVariant[] = [
  { id: ToolAsset.Bow, pixels: createBow() },
  { id: ToolAsset.Sword, pixels: createSword() },
  { id: ToolAsset.Axe, pixels: createAxe() },
  { id: ToolAsset.Pickaxe, pixels: createPickaxe() },
  { id: ToolAsset.Hammer, pixels: createHammer() },
];

function createBow(): PixelRect[] {
  return [
    rect(9, 1, 2, 2, wood), rect(7, 3, 2, 3, wood), rect(6, 6, 2, 4, wood),
    rect(7, 10, 2, 3, wood), rect(9, 13, 2, 2, wood), rect(10, 2, 1, 12, woodDark),
    rect(10, 2, 1, 12, cord), rect(5, 7, 7, 1, cord), rect(11, 6, 3, 1, steelLight),
    rect(12, 5, 1, 3, steelDark), rect(13, 6, 1, 1, steel),
  ];
}

function createSword(): PixelRect[] {
  return [
    rect(7, 1, 2, 8, steel), rect(9, 2, 1, 6, steelDark), rect(6, 2, 1, 6, steelLight),
    rect(7, 0, 2, 1, steelLight), rect(5, 9, 6, 1, gold), rect(7, 10, 2, 4, leather),
    rect(6, 14, 4, 1, gold),
  ];
}

function createAxe(): PixelRect[] {
  return [
    rect(7, 4, 2, 10, wood), rect(8, 5, 1, 9, woodDark), rect(5, 2, 5, 2, steel),
    rect(4, 4, 7, 3, steel), rect(10, 5, 2, 2, steelDark), rect(4, 3, 1, 3, steelLight),
    rect(7, 1, 2, 3, woodDark), rect(6, 14, 4, 1, leather),
  ];
}

function createPickaxe(): PixelRect[] {
  return [
    rect(7, 5, 2, 9, wood), rect(8, 6, 1, 8, woodDark), rect(2, 3, 12, 2, steel),
    rect(1, 4, 3, 1, steelLight), rect(12, 4, 3, 1, steelDark), rect(4, 2, 8, 1, steel),
    rect(7, 14, 3, 1, leather),
  ];
}

function createHammer(): PixelRect[] {
  return [
    rect(5, 2, 7, 4, steel), rect(4, 3, 1, 2, steelLight), rect(12, 3, 1, 2, steelDark),
    rect(7, 6, 2, 8, wood), rect(8, 7, 1, 7, woodDark), rect(6, 14, 4, 1, leather),
  ];
}

function rect(x: number, y: number, width: number, height: number, fill: string): PixelRect {
  return { x, y, width, height, fill };
}
