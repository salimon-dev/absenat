import type { PlayerConfig } from '@absenat/specs';
import type { World } from '../world';
import { canMove } from './collision';

export enum Direction {
  Down = 'down',
  Left = 'left',
  Right = 'right',
  Up = 'up'
}

export type DirectionType = Direction;

interface MovementKey {
  isDown: boolean;
}

export interface Keys {
  up: MovementKey;
  down: MovementKey;
  left: MovementKey;
  right: MovementKey;
}

export interface MovementState {
  x: number;
  y: number;
  moving: boolean;
  lastDirection: DirectionType;
}

interface MovementIntent {
  x: number;
  y: number;
}

interface Velocity {
  dx: number;
  dy: number;
}

export function applyMovement(
  world: World,
  keys: Keys,
  config: PlayerConfig,
  x: number,
  y: number,
  lastDirection: DirectionType
): MovementState {
  const intent = createMovementIntent(keys);
  const { dx, dy } = createVelocity(intent, config.speed);
  const moving = dx !== 0 || dy !== 0;
  const nextDirection = moving ? getLastDirection(intent, lastDirection) : lastDirection;

  if (dx !== 0 && canMove(world, x + dx, y)) {
    x += dx;
  }
  if (dy !== 0 && canMove(world, x, y + dy)) {
    y += dy;
  }

  return { x, y, moving, lastDirection: nextDirection };
}

function createMovementIntent(keys: Keys): MovementIntent {
  return {
    x: getAxisIntent(keys.left.isDown, keys.right.isDown),
    y: getAxisIntent(keys.up.isDown, keys.down.isDown)
  };
}

function getAxisIntent(negative: boolean, positive: boolean): number {
  if (negative === positive) return 0;
  return negative ? -1 : 1;
}

function createVelocity(intent: MovementIntent, speed: number): Velocity {
  if (intent.x === 0 || intent.y === 0) return { dx: intent.x * speed, dy: intent.y * speed };
  const diagonalSpeed = speed / Math.SQRT2;
  return { dx: intent.x * diagonalSpeed, dy: intent.y * diagonalSpeed };
}

function getLastDirection(intent: MovementIntent, current: DirectionType): DirectionType {
  if (intent.y < 0) return Direction.Up;
  if (intent.y > 0) return Direction.Down;
  if (intent.x < 0) return Direction.Left;
  if (intent.x > 0) return Direction.Right;
  return current;
}
