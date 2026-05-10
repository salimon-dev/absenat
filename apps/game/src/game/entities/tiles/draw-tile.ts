import * as Phaser from 'phaser';
import { Biome } from '@absenat/specs';
import type { TileEntry } from '@absenat/specs';
import type { Tile } from './tile';
import { TILE_SIZE } from '../../world/tiles';

const TILES_KEY = 'tiles';
const TILEMAP_DATA_KEY = 'tilemap_data';
const GRASS_MODE = 'gggg';

async function loadAssets(scene: Phaser.Scene): Promise<void> {
  const needTexture = !scene.textures.exists(TILES_KEY);
  const needJson = !scene.cache.json.exists(TILEMAP_DATA_KEY);
  if (!needTexture && !needJson) return;

  return new Promise<void>(resolve => {
    if (needTexture) {
      scene.load.spritesheet(TILES_KEY, 'assets/tilemap.png', {
        frameWidth: TILE_SIZE,
        frameHeight: TILE_SIZE
      });
    }
    if (needJson) scene.load.json(TILEMAP_DATA_KEY, 'assets/tilemap.json');
    scene.load.once('complete', resolve);
    scene.load.start();
  });
}

export async function drawTile(this: Tile, x: number, y: number): Promise<void> {
  if (this.biome !== Biome.Grass) throw new Error(`Unsupported biome: ${this.biome}`);

  await loadAssets(this.scene);

  const tilemap = this.scene.cache.json.get(TILEMAP_DATA_KEY) as TileEntry[];
  const entry = tilemap.find(t => t.mode === GRASS_MODE);
  if (!entry) throw new Error('No grass tile found in tilemap');

  this.sprite = this.scene.add.image(x, y, TILES_KEY, entry.frame);
  this.sprite.setOrigin(0, 0);
}
