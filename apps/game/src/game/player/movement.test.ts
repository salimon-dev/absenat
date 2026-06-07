import { describe, expect, it } from 'vitest';
import type { PlayerConfig } from '@absenat/specs';
import type { World } from '../world';
import { applyMovement, Direction, type Keys } from './movement';

describe('applyMovement', () => {
  it('moves one direction at configured speed', () => {
    const result = applyMovement(createWorld(), createKeys({ right: true }), createConfig(), 16, 16, Direction.Down);

    expect(result).toEqual({
      x: 18,
      y: 16,
      moving: true,
      lastDirection: Direction.Right
    });
  });

  it('normalizes perpendicular input to configured speed', () => {
    const result = applyMovement(createWorld(), createKeys({ right: true, up: true }), createConfig(), 16, 16, Direction.Down);
    const deltaX = result.x - 16;
    const deltaY = result.y - 16;

    expect(Math.hypot(deltaX, deltaY)).toBeCloseTo(2);
    expect(deltaX).toBeCloseTo(Math.SQRT2);
    expect(deltaY).toBeCloseTo(-Math.SQRT2);
    expect(result.lastDirection).toBe(Direction.Up);
  });

  it('cancels opposing input without changing last direction', () => {
    const result = applyMovement(
      createWorld(),
      createKeys({ left: true, right: true }),
      createConfig(),
      16,
      16,
      Direction.Left
    );

    expect(result).toEqual({
      x: 16,
      y: 16,
      moving: false,
      lastDirection: Direction.Left
    });
  });

  it('moves on the uncancelled axis when the other axis has opposing input', () => {
    const result = applyMovement(
      createWorld(),
      createKeys({ left: true, right: true, up: true }),
      createConfig(),
      16,
      16,
      Direction.Right
    );

    expect(result).toEqual({
      x: 16,
      y: 14,
      moving: true,
      lastDirection: Direction.Up
    });
  });

  it('keeps diagonal sliding when one axis is blocked', () => {
    const result = applyMovement(
      createWorld({ blockedX: 16 + Math.SQRT2 }),
      createKeys({ right: true, up: true }),
      createConfig(),
      16,
      16,
      Direction.Down
    );

    expect(result.x).toBe(16);
    expect(result.y).toBeCloseTo(16 - Math.SQRT2);
    expect(result.moving).toBe(true);
    expect(result.lastDirection).toBe(Direction.Up);
  });
});

interface KeyOverrides {
  down?: boolean;
  left?: boolean;
  right?: boolean;
  up?: boolean;
}

interface WorldOverrides {
  blockedX?: number;
}

function createConfig(): PlayerConfig {
  return {
    position: { x: 0, y: 0 },
    speed: 2,
    attackSpeed: 1,
    inventorySlots: 16,
    health: { current: 100, total: 100, drainRate: 0 },
    thirst: { current: 50, total: 100, drainRate: 0 },
    hunger: { current: 50, total: 100, drainRate: 0 },
    fatigue: { current: 50, total: 100, drainRate: 0 }
  };
}

function createKeys(overrides: KeyOverrides): Keys {
  return {
    down: { isDown: overrides.down ?? false },
    left: { isDown: overrides.left ?? false },
    right: { isDown: overrides.right ?? false },
    up: { isDown: overrides.up ?? false }
  };
}

function createWorld(overrides: WorldOverrides = {}): World {
  return {
    tiles: createTiles(overrides),
    entities: [],
    structures: []
  } as unknown as World;
}

function createTiles(overrides: WorldOverrides): World['tiles'] {
  if (overrides.blockedX === undefined) return [];
  return [{ x: overrides.blockedX + 5, y: 28, walkable: false }] as World['tiles'];
}
