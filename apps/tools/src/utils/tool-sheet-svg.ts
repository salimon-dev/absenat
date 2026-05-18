import { offsetRect, renderRect } from './rects.ts';
import type { ToolVariant } from './types.ts';
import { toolSize } from './tools.ts';

export function createToolSheetSvg(variants: ToolVariant[]): string {
  return [
    renderSvgOpening(variants.length),
    variants.map(renderTool).join(''),
    '</svg>',
  ].join('');
}

function renderSvgOpening(toolCount: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${toolSize}" height="${toolCount * toolSize}" shape-rendering="crispEdges">`;
}

function renderTool(variant: ToolVariant, index: number): string {
  const yOffset = index * toolSize;
  return variant.pixels.map((pixel) => renderRect(offsetRect(pixel, 0, yOffset))).join('');
}
