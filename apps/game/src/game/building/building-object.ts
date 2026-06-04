import * as Phaser from 'phaser';
import { TILE_SIZE } from '../world/tiles';
import { BUILDABLE_DEFINITIONS } from './definitions';
import { BuildableType, type BuildableName } from './types';

const CAMPFIRE_BASE_COLOR = 0x5b4434;
const CAMPFIRE_FLAME_COLOR = 0xffb347;
const PREVIEW_ALPHA = 0.72;
const VALID_TINT = 0xffffff;
const INVALID_TINT = 0xff8b8b;

export default class BuildingObject extends Phaser.GameObjects.Container {
  readonly buildable: BuildableName;
  readonly width: number;
  readonly height: number;
  private readonly sprite: Phaser.GameObjects.Sprite;

  static ensureTextures(scene: Phaser.Scene): void {
    createChestTexture(scene, BuildableType.SmallChest, 1, BUILDABLE_DEFINITIONS[BuildableType.SmallChest].color);
    createChestTexture(scene, BuildableType.BigChest, 2, BUILDABLE_DEFINITIONS[BuildableType.BigChest].color);
    createCampfireTexture(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, buildable: BuildableName) {
    super(scene, x, y);
    const definition = BUILDABLE_DEFINITIONS[buildable];
    this.buildable = buildable;
    this.width = definition.width;
    this.height = definition.height;
    this.sprite = scene.add.sprite(0, 0, getTextureKey(buildable)).setOrigin(0, 1);
    this.add(this.sprite);
    this.setSize(definition.width * TILE_SIZE, definition.height * TILE_SIZE);
    this.setDepth(y + 2);
    scene.add.existing(this);
  }

  setPlacement(x: number, y: number): this {
    this.setPosition(x, y);
    this.setDepth(y + 2);
    return this;
  }

  setPreview(valid: boolean): this {
    this.sprite.setAlpha(PREVIEW_ALPHA);
    this.sprite.setTint(valid ? VALID_TINT : INVALID_TINT);
    return this;
  }

  setPlaced(): this {
    this.sprite.setAlpha(1);
    this.sprite.setTint(VALID_TINT);
    return this;
  }
}

function createChestTexture(
  scene: Phaser.Scene,
  buildable: BuildableType.SmallChest | BuildableType.BigChest,
  widthInTiles: number,
  color: number
): void {
  const key = getTextureKey(buildable);
  if (scene.textures.exists(key)) return;
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  const width = widthInTiles * TILE_SIZE;
  graphics.fillStyle(0x4f3218).fillRect(0, 3, width, 13);
  graphics.fillStyle(color).fillRect(1, 4, width - 2, 11);
  graphics.fillStyle(0xd7b56d).fillRect(Math.floor(width / 2) - 1, 8, 2, 4);
  graphics.lineStyle(1, 0x35210f).strokeRect(0.5, 3.5, width - 1, 12);
  graphics.lineStyle(1, 0x71461f).lineBetween(1, 8, width - 2, 8);
  graphics.generateTexture(key, width, TILE_SIZE);
  graphics.destroy();
}

function createCampfireTexture(scene: Phaser.Scene): void {
  const key = getTextureKey(BuildableType.Campfire);
  if (scene.textures.exists(key)) return;
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(CAMPFIRE_BASE_COLOR).fillRect(3, 10, 10, 3);
  graphics.fillStyle(CAMPFIRE_BASE_COLOR).fillRect(4, 6, 3, 7);
  graphics.fillStyle(CAMPFIRE_BASE_COLOR).fillRect(9, 6, 3, 7);
  graphics.fillStyle(CAMPFIRE_FLAME_COLOR).fillRect(6, 5, 4, 6);
  graphics.fillStyle(0xffe27a).fillRect(7, 4, 2, 3);
  graphics.generateTexture(key, TILE_SIZE, TILE_SIZE);
  graphics.destroy();
}

function getTextureKey(buildable: BuildableName): string {
  return `building-${buildable}`;
}
