import * as Phaser from 'phaser';
import { ResourceType } from '../../utils/resources';
import type { EntityContent } from './types';

export const TREE_TEXTURE_KEY = 'trees';
const TREE_ASSET_PATH = 'assets/trees.png';
const TREE_FRAME_WIDTH = 16;
const TREE_FRAME_HEIGHT = 16;
const TREE_MAX_HP = 10;
const TREE_VARIANT_COUNT = 4;
const TREE_TOP_DEPTH = 20;
const TREE_BOTTOM_DEPTH = 5;

interface TreeFrames {
  top: Phaser.GameObjects.Sprite;
  bottom: Phaser.GameObjects.Sprite;
}

export default class Tree extends Phaser.GameObjects.Container {
  public content: EntityContent = [{ name: ResourceType.Wood, count: 3 }];
  public hp = TREE_MAX_HP;
  private readonly top: Phaser.GameObjects.Sprite;
  private readonly bottom: Phaser.GameObjects.Sprite;

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(TREE_TEXTURE_KEY, TREE_ASSET_PATH, {
      frameWidth: TREE_FRAME_WIDTH,
      frameHeight: TREE_FRAME_HEIGHT
    });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, variant: number) {
    super(scene, x, y);

    const frames = this.loadFrames(x, y);
    this.top = frames.top;
    this.bottom = frames.bottom;
    this.setVariant(variant);
    scene.add.existing(this);
  }

  private loadFrames(x: number, y: number): TreeFrames {
    return {
      top: createTreeFrame(this.scene, x, y - TREE_FRAME_HEIGHT, TREE_TOP_DEPTH),
      bottom: createTreeFrame(this.scene, x, y, TREE_BOTTOM_DEPTH)
    };
  }

  setVariant(variant: number): this {
    this.top.setFrame(getTopFrame(variant));
    this.bottom.setFrame(getBottomFrame(variant));
    return this;
  }

  takeDamage(amount: number): boolean {
    this.hp = Math.max(this.hp - amount, 0);
    return this.hp === 0;
  }

  destroy(fromScene?: boolean): void {
    this.top.destroy(fromScene);
    this.bottom.destroy(fromScene);
    super.destroy(fromScene);
  }
}

function createTreeFrame(scene: Phaser.Scene, x: number, y: number, depth: number): Phaser.GameObjects.Sprite {
  return scene.add.sprite(x, y, TREE_TEXTURE_KEY).setOrigin(0, 1).setDepth(depth);
}

function getTopFrame(variant: number): number {
  return variant;
}

function getBottomFrame(variant: number): number {
  return variant + TREE_VARIANT_COUNT;
}
