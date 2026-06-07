import * as Phaser from 'phaser';
import { Biome } from '@absenat/specs';
import { TILE_SIZE } from '../../world/tiles';
import { getGroundTileDepth } from '../../world/render-depth';
import { TileVariantKind } from '../types';
import type { AnimatedTileVariant, TileVariant } from '../types';
import { getTileFrame, getTileVariant } from './tile-variants';

export const TILE_TEXTURE_KEY = 'worldTiles';
const TILE_ASSET_PATH = 'assets/tiles.png';
const TILE_ANIMATION_REPEAT = -1;

export default class Tile extends Phaser.GameObjects.Sprite {
  biome: Biome;
  variant: number;
  walkable: boolean;

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(TILE_TEXTURE_KEY, TILE_ASSET_PATH, {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE
    });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, biome: Biome, variant = 0) {
    super(scene, x, y, TILE_TEXTURE_KEY, getTileFrame(biome, variant));

    this.biome = biome;
    this.variant = variant;
    this.walkable = isWalkableBiome(biome);
    this.setOrigin(0, 1);
    this.setDepth(getGroundTileDepth());
    scene.add.existing(this);
    this.applyVariant();
  }

  setVariant(variant: number): this {
    this.variant = variant;
    this.applyVariant();
    return this;
  }

  setBiome(biome: Biome): this {
    this.biome = biome;
    this.walkable = isWalkableBiome(this.biome);
    this.applyVariant();
    return this;
  }

  private applyVariant(): void {
    const tileVariant = getTileVariant(this.biome, this.variant);
    if (tileVariant.kind === TileVariantKind.Animated) {
      this.playAnimatedVariant(tileVariant);
      return;
    }
    this.stop();
    this.setFrame(tileVariant.frame);
  }

  private playAnimatedVariant(tileVariant: AnimatedTileVariant): void {
    const key = getTileAnimationKey(tileVariant);
    createTileAnimation(this.scene, key, tileVariant);
    this.play(key);
  }
}

function isWalkableBiome(biome: Biome): boolean {
  return biome !== Biome.Water;
}

function createTileAnimation(scene: Phaser.Scene, key: string, tileVariant: AnimatedTileVariant): void {
  if (scene.anims.exists(key)) return;
  scene.anims.create({
    key,
    frames: tileVariant.frames.map(frame => ({ key: TILE_TEXTURE_KEY, frame })),
    frameRate: tileVariant.frameRate,
    repeat: TILE_ANIMATION_REPEAT
  });
}

function getTileAnimationKey(tileVariant: TileVariant): string {
  return `${TILE_TEXTURE_KEY}-${tileVariant.biome}-${tileVariant.variant}`;
}
