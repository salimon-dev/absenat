import * as Phaser from 'phaser';
import type { Biome } from '@absenat/specs';
import { WObject, WObjectTypeEnum } from '../world-object';
import { drawTile } from './draw-tile';

export class Tile extends WObject {
  sprite: Phaser.GameObjects.Image | null = null;

  constructor(
    public scene: Phaser.Scene,
    public biome: Biome
  ) {
    super(WObjectTypeEnum.Tile);
  }

  draw = drawTile;

  async destory(): Promise<void> {
    this.sprite?.destroy();
    this.sprite = null;
  }
}
