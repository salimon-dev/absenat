import * as Phaser from 'phaser';
import type { PlayerConfig } from '@absenat/specs';
import { World } from '../world';
import { canMove } from './collision';

type Direction = 'up' | 'down' | 'left' | 'right';

export interface Keys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
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

  if (keys.A.isDown) {
    dx -= config.speed;
    lastDirection = 'left';
    moving = true;
  } else if (keys.D.isDown) {
    dx += config.speed;
    lastDirection = 'right';
    moving = true;
  }

  if (keys.W.isDown) {
    dy -= config.speed;
    lastDirection = 'up';
    moving = true;
  } else if (keys.S.isDown) {
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
