import { offsetRect, renderRect } from './rects.ts';
import { resourceNodeHeight, resourceNodeWidth } from './resource-nodes.ts';
import type { ResourceNodeVariant } from './types.ts';

export function createResourceNodeSheetSvg(variants: ResourceNodeVariant[]): string {
  return [renderSvgOpening(variants.length), variants.map(renderNode).join(''), '</svg>'].join('');
}

function renderSvgOpening(nodeCount: number): string {
  const width = nodeCount * resourceNodeWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${resourceNodeHeight}" shape-rendering="crispEdges">`;
}

function renderNode(variant: ResourceNodeVariant, index: number): string {
  const xOffset = index * resourceNodeWidth;
  return variant.pixels.map(pixel => renderRect(offsetRect(pixel, xOffset, 0))).join('');
}
