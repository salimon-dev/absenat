import { describe, expect, it } from 'vitest';
import { TILE_SIZE } from '../world/tiles';
import { getBuildablePixelSize } from './building-size';
import { BuildableType } from './types';

describe('getBuildablePixelSize', () => {
  it('scales multi-tile buildables to their tile footprint', () => {
    expect(getBuildablePixelSize(BuildableType.BigChest)).toEqual({
      height: TILE_SIZE,
      width: TILE_SIZE * 2
    });
  });

  it('keeps one-tile buildables at one tile', () => {
    expect(getBuildablePixelSize(BuildableType.SmallChest)).toEqual({
      height: TILE_SIZE,
      width: TILE_SIZE
    });
  });
});
