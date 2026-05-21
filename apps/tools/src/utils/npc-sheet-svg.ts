import { offsetRect, renderRect } from './rects.ts';
import type { NpcAnimationRow, NpcVariant, PixelRect } from './types.ts';
import { npcFrameSize, npcFramesPerAnimation } from './npcs.ts';

export function createNpcSheetSvg(variant: NpcVariant): string {
  return [
    renderSvgOpening(variant.animations.length),
    variant.animations.map(renderAnimationRow).join(''),
    '</svg>',
  ].join('');
}

function renderSvgOpening(rowCount: number): string {
  const width = npcFramesPerAnimation * npcFrameSize;
  const height = rowCount * npcFrameSize;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="crispEdges">`;
}

function renderAnimationRow(row: NpcAnimationRow, rowIndex: number): string {
  return row.frames.map((frame, frameIndex) => renderFrame(frame, frameIndex, rowIndex)).join('');
}

function renderFrame(frame: PixelRect[], frameIndex: number, rowIndex: number): string {
  const xOffset = frameIndex * npcFrameSize;
  const yOffset = rowIndex * npcFrameSize;
  return frame.map((pixel) => renderRect(offsetRect(pixel, xOffset, yOffset))).join('');
}
