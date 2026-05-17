import type { PixelRect } from './types.ts';

export function offsetRect(rect: PixelRect, xOffset: number, yOffset: number): PixelRect {
  return { ...rect, x: rect.x + xOffset, y: rect.y + yOffset };
}

export function renderRect(rect: PixelRect): string {
  return `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${rect.fill}"/>`;
}
