import type { PixelTemplate, TerrainPalette, TerrainType, Tile } from './types.ts';

export function createTiles(
  palette: TerrainPalette,
  templates: Record<TerrainType, PixelTemplate[][]>,
): Tile[] {
  return templates[palette.terrain].map((template) => createTile(palette, template));
}

function createTile(palette: TerrainPalette, template: PixelTemplate[]): Tile {
  return {
    base: palette.base,
    pixels: template.map((pixel) => ({ ...pixel, fill: palette.detail })),
  };
}
