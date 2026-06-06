import { Biome } from '@absenat/specs';
import { describe, expect, it } from 'vitest';
import { getRenderedTilePlacements } from './world-snapshot';

describe('getRenderedTilePlacements', () => {
  it('restores a flat rendered tile list to rows', () => {
    const placements = getRenderedTilePlacements([
      { biome: Biome.Grass, variant: 0 },
      { biome: Biome.Sand, variant: 2 },
      { biome: Biome.Water, variant: 1 },
      { biome: Biome.Dirt, variant: 3 }
    ], 2);

    expect(placements).toEqual([
      [
        { biome: Biome.Grass, variant: 0 },
        { biome: Biome.Sand, variant: 2 }
      ],
      [
        { biome: Biome.Water, variant: 1 },
        { biome: Biome.Dirt, variant: 3 }
      ]
    ]);
  });
});
