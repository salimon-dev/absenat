import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { TILE_SIZE } from '../world/tiles';
import { BUILDABLE_DEFINITIONS } from './definitions';
import { getBuildablePixelSize } from './building-size';
import { BuildableType } from './types';

const BUILDABLE_ASSET_PATH = resolve(process.cwd(), 'public/assets/buildables.png');

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

  it('uses a single 16px-frame buildable spritesheet', async () => {
    expect(existsSync(BUILDABLE_ASSET_PATH)).toBe(true);
    const metadata = await sharp(BUILDABLE_ASSET_PATH).metadata();
    expect(metadata.height).toBe(TILE_SIZE);
    expect(metadata.width).toBe(getExpectedSheetWidth());
  });

  it.each(Object.values(BuildableType))('maps %s to its tile footprint frames', buildable => {
    const definition = BUILDABLE_DEFINITIONS[buildable];
    const expectedSize = getBuildablePixelSize(buildable);
    expect(definition.asset.frames).toHaveLength(expectedSize.width / TILE_SIZE);
    expect(definition.asset.frames.every(Number.isInteger)).toBe(true);
  });
});

function getExpectedSheetWidth(): number {
  return Math.max(...Object.values(BUILDABLE_DEFINITIONS).flatMap(definition => definition.asset.frames)) * TILE_SIZE + TILE_SIZE;
}
