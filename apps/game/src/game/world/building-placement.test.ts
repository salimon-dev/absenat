import { describe, expect, it } from 'vitest';
import { BuildableType } from '../building/types';
import {
  BuildValidationReason,
  getBuildFootprintBounds,
  type Bounds,
  validateBuildPlacement
} from './building-placement';

describe('validateBuildPlacement', () => {
  it('requires enough wood before placement starts', () => {
    const result = validateBuildPlacement(createContext({ woodCount: 1 }));
    expect(result).toEqual({ valid: false, reason: BuildValidationReason.NotEnoughWood });
  });

  it('rejects placements outside the raft footprint', () => {
    const result = validateBuildPlacement(
      createContext({
        buildable: BuildableType.BigChest,
        tileX: 4,
        tileY: 2
      })
    );
    expect(result).toEqual({ valid: false, reason: BuildValidationReason.BuildOnRaft });
  });

  it('rejects placements that overlap another structure', () => {
    const result = validateBuildPlacement(
      createContext({
        structureBounds: [getBuildFootprintBounds(BuildableType.SmallChest, 2, 2)]
      })
    );
    expect(result).toEqual({ valid: false, reason: BuildValidationReason.SpaceOccupied });
  });

  it('rejects placements that overlap the player', () => {
    const result = validateBuildPlacement(
      createContext({
        playerBounds: {
          left: 32,
          right: 44,
          top: 36,
          bottom: 48
        }
      })
    );
    expect(result).toEqual({ valid: false, reason: BuildValidationReason.SpaceOccupied });
  });

  it('accepts a valid raft placement', () => {
    const result = validateBuildPlacement(createContext());
    expect(result).toEqual({ valid: true });
  });
});

interface TestContextOverrides {
  buildable?: BuildableType;
  playerBounds?: Bounds;
  structureBounds?: Bounds[];
  tileX?: number;
  tileY?: number;
  woodCount?: number;
}

function createContext(overrides: TestContextOverrides = {}) {
  return {
    buildable: overrides.buildable ?? BuildableType.SmallChest,
    isRaftTile,
    playerBounds: overrides.playerBounds ?? {
      left: 0,
      right: 12,
      top: 0,
      bottom: 12
    },
    structureBounds: overrides.structureBounds ?? [],
    tileX: overrides.tileX ?? 2,
    tileY: overrides.tileY ?? 2,
    woodCount: overrides.woodCount ?? 10
  };
}

function isRaftTile(x: number, y: number): boolean {
  return x >= 1 && x <= 3 && y >= 1 && y <= 3;
}
