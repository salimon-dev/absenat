import * as Phaser from 'phaser';
import { getGroundObjectDepth } from '../world/render-depth';
import { TILE_SIZE } from '../world/tiles';
import { BUILDABLE_DEFINITIONS } from './definitions';
import { getBuildablePixelSize } from './building-size';
import type { BuildableName } from './types';

export const BUILDABLE_TEXTURE_KEY = 'buildables';
const BUILDABLE_ASSET_PATH = 'assets/buildables.png';
const PREVIEW_ALPHA = 0.72;
const VALID_TINT = 0xffffff;
const INVALID_TINT = 0xff8b8b;

export default class BuildingObject extends Phaser.GameObjects.Container {
  readonly buildable: BuildableName;
  private readonly sprites: Phaser.GameObjects.Sprite[];

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(BUILDABLE_TEXTURE_KEY, BUILDABLE_ASSET_PATH, {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE
    });
  }

  static ensureTextures(scene: Phaser.Scene): void {
    scene.textures.get(BUILDABLE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, buildable: BuildableName) {
    super(scene, x, y);
    this.buildable = buildable;
    const pixelSize = getBuildablePixelSize(buildable);
    this.sprites = createFrameSprites(scene, buildable);
    this.add(this.sprites);
    this.setSize(pixelSize.width, pixelSize.height);
    this.setDepth(getGroundObjectDepth(y));
    scene.add.existing(this);
  }

  setPlacement(x: number, y: number): this {
    this.setPosition(x, y);
    this.setDepth(getGroundObjectDepth(y));
    return this;
  }

  setPreview(valid: boolean): this {
    this.sprites.forEach(sprite => setPreviewFrame(sprite, valid));
    return this;
  }

  setPlaced(): this {
    this.sprites.forEach(setPlacedFrame);
    return this;
  }
}

function createFrameSprites(scene: Phaser.Scene, buildable: BuildableName): Phaser.GameObjects.Sprite[] {
  return BUILDABLE_DEFINITIONS[buildable].asset.frames.map((frame, index) => createFrameSprite(scene, frame, index));
}

function createFrameSprite(scene: Phaser.Scene, frame: number, index: number): Phaser.GameObjects.Sprite {
  return scene.add.sprite(index * TILE_SIZE, 0, BUILDABLE_TEXTURE_KEY, frame).setOrigin(0, 1);
}

function setPreviewFrame(sprite: Phaser.GameObjects.Sprite, valid: boolean): void {
  sprite.setAlpha(PREVIEW_ALPHA);
  sprite.setTint(valid ? VALID_TINT : INVALID_TINT);
}

function setPlacedFrame(sprite: Phaser.GameObjects.Sprite): void {
  sprite.setAlpha(1);
  sprite.setTint(VALID_TINT);
}
