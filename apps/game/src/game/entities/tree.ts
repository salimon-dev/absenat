import * as Phaser from 'phaser';
import { ResourceType } from '../../utils/resources';
import type { EntityContent } from './types';

export const TREE_TEXTURE_KEY = 'trees';
const TREE_ASSET_PATH = 'assets/trees.png';
const TREE_FRAME_WIDTH = 16;
const TREE_FRAME_HEIGHT = 32;
const TREE_MAX_HP = 10;

export default class Tree extends Phaser.GameObjects.Sprite {
  public content: EntityContent = [{ name: ResourceType.Wood, count: 3 }];
  public hp = TREE_MAX_HP;

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(TREE_TEXTURE_KEY, TREE_ASSET_PATH, {
      frameWidth: TREE_FRAME_WIDTH,
      frameHeight: TREE_FRAME_HEIGHT
    });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, variant: number) {
    super(scene, x, y, TREE_TEXTURE_KEY, variant);

    this.setOrigin(0, 1);
    this.setDepth(y);
    scene.add.existing(this);
  }

  setVariant(variant: number): this {
    this.setFrame(variant);
    return this;
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(this.hp - amount, 0);
    return this.hp === 0;
  }
}
