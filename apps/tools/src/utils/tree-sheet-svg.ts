import { offsetRect, renderRect } from './rects.ts';
import type { TreeVariant } from './types.ts';
import { treeHeight, treeWidth } from './trees.ts';

export function createTreeSheetSvg(variants: TreeVariant[]): string {
  return [
    renderSvgOpening(variants.length),
    variants.map(renderTree).join(''),
    '</svg>',
  ].join('');
}

function renderSvgOpening(treeCount: number): string {
  const width = treeCount * treeWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${treeHeight}" shape-rendering="crispEdges">`;
}

function renderTree(variant: TreeVariant, index: number): string {
  const xOffset = index * treeWidth;
  return variant.pixels.map((pixel) => renderRect(offsetRect(pixel, xOffset, 0))).join('');
}
