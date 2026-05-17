import { Terrain, type PixelTemplate, type TerrainType } from './types.ts';

export const tileTemplates: Record<TerrainType, PixelTemplate[][]> = {
  [Terrain.Grass]: [
    [
      { x: 7, y: 5, width: 1, height: 3 },
      { x: 6, y: 7, width: 3, height: 1 },
    ],
    [
      { x: 4, y: 9, width: 1, height: 2 },
      { x: 3, y: 10, width: 3, height: 1 },
      { x: 11, y: 3, width: 1, height: 2 },
      { x: 10, y: 4, width: 2, height: 1 },
    ],
    [
      { x: 11, y: 10, width: 1, height: 3 },
      { x: 10, y: 12, width: 3, height: 1 },
    ],
    [
      { x: 13, y: 6, width: 1, height: 3 },
      { x: 12, y: 8, width: 3, height: 1 },
      { x: 2, y: 12, width: 1, height: 2 },
      { x: 1, y: 13, width: 3, height: 1 },
    ],
    [
      { x: 4, y: 2, width: 1, height: 3 },
      { x: 3, y: 4, width: 3, height: 1 },
      { x: 10, y: 10, width: 1, height: 2 },
      { x: 9, y: 11, width: 3, height: 1 },
    ],
    [
      { x: 7, y: 1, width: 1, height: 2 },
      { x: 6, y: 2, width: 2, height: 1 },
      { x: 12, y: 4, width: 1, height: 3 },
      { x: 11, y: 6, width: 3, height: 1 },
      { x: 3, y: 11, width: 1, height: 2 },
      { x: 2, y: 12, width: 2, height: 1 },
    ],
    [
      { x: 1, y: 7, width: 1, height: 2 },
      { x: 1, y: 8, width: 3, height: 1 },
      { x: 8, y: 12, width: 1, height: 3 },
      { x: 7, y: 14, width: 3, height: 1 },
    ],
    [
      { x: 5, y: 7, width: 1, height: 3 },
      { x: 4, y: 9, width: 3, height: 1 },
      { x: 13, y: 2, width: 1, height: 2 },
      { x: 12, y: 3, width: 2, height: 1 },
    ],
    [
      { x: 3, y: 4, width: 1, height: 3 },
      { x: 2, y: 6, width: 3, height: 1 },
      { x: 9, y: 8, width: 1, height: 2 },
      { x: 8, y: 9, width: 3, height: 1 },
      { x: 12, y: 11, width: 1, height: 3 },
      { x: 11, y: 13, width: 3, height: 1 },
    ],
    [
      { x: 1, y: 12, width: 1, height: 3 },
      { x: 1, y: 14, width: 3, height: 1 },
      { x: 10, y: 3, width: 1, height: 2 },
      { x: 9, y: 4, width: 3, height: 1 },
    ],
    [
      { x: 4, y: 1, width: 1, height: 3 },
      { x: 3, y: 3, width: 3, height: 1 },
      { x: 8, y: 6, width: 1, height: 3 },
      { x: 7, y: 8, width: 3, height: 1 },
      { x: 14, y: 9, width: 1, height: 3 },
      { x: 13, y: 11, width: 2, height: 1 },
    ],
    [
      { x: 2, y: 8, width: 1, height: 3 },
      { x: 1, y: 10, width: 3, height: 1 },
      { x: 6, y: 2, width: 1, height: 2 },
      { x: 5, y: 3, width: 3, height: 1 },
      { x: 11, y: 6, width: 1, height: 3 },
      { x: 10, y: 8, width: 3, height: 1 },
    ],
    [
      { x: 5, y: 11, width: 1, height: 3 },
      { x: 4, y: 13, width: 3, height: 1 },
      { x: 9, y: 1, width: 1, height: 2 },
      { x: 8, y: 2, width: 3, height: 1 },
      { x: 13, y: 5, width: 1, height: 3 },
      { x: 12, y: 7, width: 3, height: 1 },
    ],
    [
      { x: 1, y: 4, width: 1, height: 2 },
      { x: 1, y: 5, width: 3, height: 1 },
      { x: 7, y: 9, width: 1, height: 2 },
      { x: 6, y: 10, width: 3, height: 1 },
      { x: 12, y: 1, width: 1, height: 3 },
      { x: 11, y: 3, width: 3, height: 1 },
    ],
    [
      { x: 6, y: 5, width: 1, height: 3 },
      { x: 5, y: 7, width: 3, height: 1 },
      { x: 10, y: 12, width: 1, height: 2 },
      { x: 9, y: 13, width: 2, height: 1 },
    ],
    [
      { x: 2, y: 13, width: 1, height: 2 },
      { x: 1, y: 14, width: 3, height: 1 },
      { x: 8, y: 3, width: 1, height: 3 },
      { x: 7, y: 5, width: 3, height: 1 },
      { x: 13, y: 8, width: 1, height: 2 },
      { x: 12, y: 9, width: 3, height: 1 },
    ],
  ],
  [Terrain.Water]: [
    [],
    [
      { x: 3, y: 6, width: 3, height: 1 },
      { x: 6, y: 7, width: 2, height: 1 },
    ],
    [
      { x: 2, y: 11, width: 3, height: 1 },
      { x: 5, y: 12, width: 2, height: 1 },
      { x: 9, y: 4, width: 3, height: 1 },
      { x: 12, y: 5, width: 2, height: 1 },
    ],
    [
      { x: 6, y: 12, width: 3, height: 1 },
      { x: 9, y: 13, width: 3, height: 1 },
    ],
    [
      { x: 1, y: 7, width: 3, height: 1 },
      { x: 4, y: 8, width: 2, height: 1 },
      { x: 10, y: 9, width: 3, height: 1 },
      { x: 13, y: 10, width: 2, height: 1 },
    ],
    [
      { x: 2, y: 3, width: 4, height: 1 },
      { x: 6, y: 4, width: 2, height: 1 },
      { x: 11, y: 12, width: 3, height: 1 },
    ],
    [
      { x: 4, y: 10, width: 4, height: 1 },
      { x: 8, y: 11, width: 2, height: 1 },
      { x: 12, y: 2, width: 2, height: 1 },
    ],
    [
      { x: 1, y: 13, width: 3, height: 1 },
      { x: 4, y: 14, width: 2, height: 1 },
      { x: 9, y: 7, width: 4, height: 1 },
      { x: 13, y: 8, width: 2, height: 1 },
    ],
  ],
  [Terrain.Dirt]: [
    [],
    [{ x: 5, y: 4, width: 2, height: 2 }],
    [
      { x: 3, y: 11, width: 1, height: 1 },
      { x: 10, y: 6, width: 2, height: 2 },
    ],
    [{ x: 12, y: 12, width: 2, height: 1 }],
    [
      { x: 2, y: 3, width: 1, height: 1 },
      { x: 7, y: 13, width: 2, height: 2 },
    ],
    [
      { x: 4, y: 7, width: 2, height: 2 },
      { x: 11, y: 3, width: 1, height: 1 },
    ],
    [
      { x: 2, y: 12, width: 2, height: 1 },
      { x: 9, y: 9, width: 2, height: 2 },
    ],
    [
      { x: 6, y: 2, width: 1, height: 1 },
      { x: 12, y: 8, width: 2, height: 2 },
      { x: 3, y: 14, width: 1, height: 1 },
    ],
  ],
  [Terrain.Sand]: [
    [],
    [{ x: 7, y: 5, width: 1, height: 1 }],
    [
      { x: 4, y: 9, width: 1, height: 1 },
      { x: 12, y: 3, width: 1, height: 1 },
    ],
    [{ x: 9, y: 12, width: 1, height: 1 }],
    [
      { x: 2, y: 6, width: 1, height: 1 },
      { x: 13, y: 11, width: 1, height: 1 },
    ],
    [
      { x: 5, y: 3, width: 1, height: 1 },
      { x: 10, y: 8, width: 1, height: 1 },
      { x: 3, y: 13, width: 1, height: 1 },
    ],
    [
      { x: 2, y: 9, width: 1, height: 1 },
      { x: 8, y: 4, width: 1, height: 1 },
      { x: 13, y: 6, width: 1, height: 1 },
    ],
    [
      { x: 6, y: 12, width: 1, height: 1 },
      { x: 11, y: 10, width: 1, height: 1 },
    ],
  ],
  [Terrain.Ice]: [
    [],
    [
      { x: 4, y: 4, width: 1, height: 1 },
      { x: 5, y: 5, width: 1, height: 1 },
      { x: 6, y: 6, width: 1, height: 1 },
    ],
    [
      { x: 10, y: 2, width: 1, height: 1 },
      { x: 9, y: 3, width: 1, height: 1 },
      { x: 8, y: 4, width: 1, height: 1 },
    ],
    [
      { x: 3, y: 12, width: 1, height: 1 },
      { x: 4, y: 11, width: 1, height: 1 },
    ],
    [
      { x: 12, y: 9, width: 1, height: 1 },
      { x: 13, y: 10, width: 1, height: 1 },
      { x: 14, y: 11, width: 1, height: 1 },
    ],
    [
      { x: 2, y: 5, width: 1, height: 1 },
      { x: 3, y: 6, width: 1, height: 1 },
      { x: 4, y: 7, width: 1, height: 1 },
    ],
    [
      { x: 11, y: 12, width: 1, height: 1 },
      { x: 12, y: 13, width: 1, height: 1 },
      { x: 5, y: 3, width: 1, height: 1 },
    ],
    [
      { x: 7, y: 9, width: 1, height: 1 },
      { x: 8, y: 8, width: 1, height: 1 },
      { x: 9, y: 7, width: 1, height: 1 },
    ],
  ],
  [Terrain.Snow]: [
    [],
    [{ x: 5, y: 5, width: 2, height: 1 }],
    [
      { x: 3, y: 10, width: 2, height: 1 },
      { x: 11, y: 4, width: 1, height: 2 },
    ],
    [{ x: 8, y: 12, width: 3, height: 1 }],
    [
      { x: 2, y: 7, width: 2, height: 1 },
      { x: 12, y: 11, width: 2, height: 1 },
    ],
    [
      { x: 4, y: 3, width: 2, height: 1 },
      { x: 10, y: 8, width: 1, height: 2 },
    ],
    [
      { x: 6, y: 11, width: 2, height: 1 },
      { x: 12, y: 4, width: 2, height: 1 },
    ],
    [
      { x: 3, y: 13, width: 3, height: 1 },
      { x: 9, y: 2, width: 1, height: 2 },
    ],
  ],
};
