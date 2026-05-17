import * as Phaser from 'phaser';

export const TREE_TEXTURE_KEY = 'trees';
const TREE_ASSET_PATH = 'assets/trees.png';
const TREE_FRAME_WIDTH = 16;
const TREE_FRAME_HEIGHT = 32;

export default class Tree extends Phaser.GameObjects.Sprite {
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
}
