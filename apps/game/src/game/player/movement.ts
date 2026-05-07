import * as Phaser from 'phaser';
import type { PlayerConfig } from '@absenat/specs';
import { World } from '../world';
import { canMove } from './collision';

type Direction = 'up' | 'down' | 'left' | 'right';

export interface Keys {
  UP: Phaser.Input.Keyboard.Key;
  LEFT: Phaser.Input.Keyboard.Key;
  DOWN: Phaser.Input.Keyboard.Key;
  RIGHT: Phaser.Input.Keyboard.Key;
}

export interface MovementState {
  x: number;
  y: number;
  moving: boolean;
  lastDirection: Direction;
}

export function applyMovement(
  world: World,
  keys: Keys,
  config: PlayerConfig,
  x: number,
  y: number,
  lastDirection: Direction
): MovementState {
  let dx = 0;
  let dy = 0;
  let moving = false;

  if (keys.LEFT.isDown) {
    dx -= config.speed;
    lastDirection = 'left';
    moving = true;
  } else if (keys.RIGHT.isDown) {
    dx += config.speed;
    lastDirection = 'right';
    moving = true;
  }

  if (keys.UP.isDown) {
    dy -= config.speed;
    lastDirection = 'up';
    moving = true;
  } else if (keys.DOWN.isDown) {
    dy += config.speed;
    lastDirection = 'down';
    moving = true;
  }

  if (dx !== 0 && canMove(world, x + dx, y)) {
    x += dx;
  }
  if (dy !== 0 && canMove(world, x, y + dy)) {
    y += dy;
  }

  return { x, y, moving, lastDirection };
}
