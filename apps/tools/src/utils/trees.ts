import type { PixelRect, TreeAssetData, TreeVariant } from './types.ts';

const bark = '#7a4a25';
const barkDark = '#523019';
const leafDark = '#1e5b2d';
const leaf = '#2f8a3d';
const leafLight = '#54b85d';
const leafBlue = '#2f7c54';
const leafYellow = '#79b65c';

export const treeWidth = 16;
export const treeHeight = 32;
export const treeVariants: TreeVariant[] = [
  { id: 'tree.0', pixels: createRoundTree(leaf, leafDark, leafLight) },
  { id: 'tree.1', pixels: createTallTree(leafBlue, leafDark, leafLight) },
  { id: 'tree.2', pixels: createWideTree(leafYellow, leaf, leafDark) },
  { id: 'tree.3', pixels: createSparseTree(leaf, leafBlue, leafLight) },
];

export function createTreeAssetData(variants: TreeVariant[]): TreeAssetData[] {
  return variants.map((variant, index) => createTreeData(variant.id, index));
}

function createTreeData(id: string, column: number): TreeAssetData {
  return {
    id,
    biome: 'grass',
    resources: [{ id: 'wood', count: 2 }],
    frames: [createFrame(column, 0, true), createFrame(column, 1, false)],
  };
}

function createFrame(column: number, row: number, walkable: boolean): TreeAssetData['frames'][number] {
  return {
    source: { x: column, y: row },
    position: { x: 0, y: row },
    walkable,
  };
}

function createRoundTree(primary: string, shade: string, shine: string): PixelRect[] {
  return [
    rect(5, 2, 6, 3, shade), rect(3, 5, 10, 5, primary), rect(2, 10, 12, 7, primary),
    rect(4, 17, 8, 4, shade), rect(5, 6, 3, 2, shine), rect(3, 12, 2, 2, shine),
    ...createTrunk(7, 18),
  ];
}

function createTallTree(primary: string, shade: string, shine: string): PixelRect[] {
  return [
    rect(6, 1, 4, 4, shade), rect(4, 5, 8, 5, primary), rect(3, 10, 10, 6, primary),
    rect(2, 16, 12, 4, shade), rect(7, 4, 2, 2, shine), rect(5, 11, 2, 2, shine),
    ...createTrunk(7, 17),
  ];
}

function createWideTree(primary: string, mid: string, shade: string): PixelRect[] {
  return [
    rect(4, 4, 8, 4, shade), rect(2, 8, 12, 5, primary), rect(1, 13, 14, 5, mid),
    rect(4, 18, 8, 3, shade), rect(10, 9, 2, 2, '#a2d36e'), rect(3, 14, 2, 2, '#a2d36e'),
    ...createTrunk(6, 18),
  ];
}

function createSparseTree(primary: string, shade: string, shine: string): PixelRect[] {
  return [
    rect(5, 3, 5, 3, shade), rect(3, 7, 9, 5, primary), rect(4, 13, 8, 4, primary),
    rect(2, 16, 11, 3, shade), rect(6, 7, 2, 2, shine), rect(10, 14, 1, 2, shine),
    ...createTrunk(7, 17),
  ];
}

function createTrunk(x: number, y: number): PixelRect[] {
  return [rect(x, y, 3, 13, bark), rect(x + 2, y + 1, 1, 12, barkDark)];
}

function rect(x: number, y: number, width: number, height: number, fill: string): PixelRect {
  return { x, y, width, height, fill };
}
