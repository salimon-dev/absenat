import * as Phaser from 'phaser';
import type { Tree } from './tree';
import type { TreeData } from './types';
import { TILE_SIZE } from '../../world/tiles';

const TREES_KEY = 'trees';

async function loadAssets(scene: Phaser.Scene): Promise<void> {
  const needTexture = !scene.textures.exists(TREES_KEY);
  const needJson = !scene.cache.json.exists('trees_data');
  if (!needTexture && !needJson) return;

  return new Promise<void>(resolve => {
    if (needTexture) {
      scene.load.spritesheet(TREES_KEY, 'assets/trees.png', {
        frameWidth: TILE_SIZE,
        frameHeight: TILE_SIZE
      });
    }
    if (needJson) scene.load.json('trees_data', 'assets/trees.json');
    scene.load.once('complete', resolve);
    scene.load.start();
  });
}

function addFrame(this: Tree, frame: TreeData['frames'][number], x: number, y: number, cols: number): void {
  const frameIndex = frame.source.y * cols + frame.source.x;
  const img = this.scene.add.image(
    x + frame.position.x * TILE_SIZE,
    y + frame.position.y * TILE_SIZE,
    TREES_KEY,
    frameIndex
  );
  img.setOrigin(0, 0);
  this.sprites.push(img);
  this.walkableMap.set(`${frame.position.x},${frame.position.y}`, frame.walkable);
}

export async function drawTree(this: Tree, x: number, y: number): Promise<void> {
  await loadAssets(this.scene);
  const allData = this.scene.cache.json.get('trees_data') as TreeData[];
  const data = allData.find(t => t.id === this.id);
  if (!data) throw new Error(`Tree "${this.id}" not found`);

  const texture = this.scene.textures.get(TREES_KEY);
  const cols = Math.round(texture.source[0].width / TILE_SIZE);

  for (const frame of data.frames) {
    addFrame.call(this, frame, x, y, cols);
  }
}
