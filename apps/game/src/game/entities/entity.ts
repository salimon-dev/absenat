import * as Phaser from 'phaser';
import type { Entity } from '@absenat/specs';
import { TILE_SIZE } from '../world/tiles';

export class EntitySprite {
  sprites: Phaser.GameObjects.Sprite[] = [];
  x: number;
  y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, def: Entity) {
    this.x = x;
    this.y = y;
    for (const f of def.frames) {
      const sx = x + f.position.x * TILE_SIZE;
      const sy = y - (def.size.h - 1 - f.position.y) * TILE_SIZE;
      const sprite = scene.add.sprite(sx, sy, 'entities', f.frame);
      sprite.setOrigin(0.5, 1);
      sprite.setDepth(f.attributes.zindex);
      this.sprites.push(sprite);
    }
  }
}
