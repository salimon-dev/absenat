import { TILE_SIZE } from '../world/tiles';
import { BUILDABLE_DEFINITIONS } from './definitions';
import type { BuildableName } from './types';

export interface BuildablePixelSize {
  height: number;
  width: number;
}

export function getBuildablePixelSize(buildable: BuildableName): BuildablePixelSize {
  const definition = BUILDABLE_DEFINITIONS[buildable];
  return {
    height: definition.height * TILE_SIZE,
    width: definition.width * TILE_SIZE
  };
}
