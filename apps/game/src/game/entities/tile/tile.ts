import * as Phaser from 'phaser';
import { Biome } from '@absenat/specs';
import { TILE_SIZE } from '../../world/tiles';
import { getTileFrame } from './tile-variants';

export const TILE_TEXTURE_KEY = 'worldTiles';
const TILE_ASSET_PATH = 'assets/tiles.png';

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
    this.setDepth(0);
    scene.add.existing(this);
  }

  setVariant(variant: number): this {
    this.variant = variant;
    this.setFrame(getTileFrame(this.biome, this.variant));
    return this;
  }

  setBiome(biome: Biome): this {
    this.biome = biome;
    this.walkable = isWalkableBiome(this.biome);
    this.setFrame(getTileFrame(this.biome, this.variant));
    return this;
  }
}

function isWalkableBiome(biome: Biome): boolean {
  return biome !== Biome.Water;
}
