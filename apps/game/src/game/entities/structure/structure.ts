import * as Phaser from 'phaser';
import { getBuildableSpec, BuildableType } from '../../build/buildables';
import { TILE_SIZE } from '../../world/tiles';
import type { StructureFootprint, StructurePlacement } from './types';

export default class Structure extends Phaser.GameObjects.Container {
  readonly buildable: StructurePlacement['buildable'];
  readonly footprint: StructureFootprint;

  constructor(scene: Phaser.Scene, placement: StructurePlacement) {
    super(scene, placement.tileX * TILE_SIZE, placement.tileY * TILE_SIZE);
    this.buildable = placement.buildable;
    this.footprint = createFootprint(placement);
    this.setDepth((placement.tileY + this.footprint.height) * TILE_SIZE + 1);
    this.setSize(this.footprint.width * TILE_SIZE, this.footprint.height * TILE_SIZE);
    this.add(createStructureChildren(scene, placement.buildable));
    scene.add.existing(this);
  }
}

function createFootprint(placement: StructurePlacement): StructureFootprint {
  const spec = getBuildableSpec(placement.buildable);
  return {
    tileX: placement.tileX,
    tileY: placement.tileY,
    width: spec.width,
    height: spec.height
  };
}

function createStructureChildren(scene: Phaser.Scene, buildable: StructurePlacement['buildable']): Phaser.GameObjects.Rectangle[] {
  if (buildable === BuildableType.SmallChest) return createSmallChest(scene);
  if (buildable === BuildableType.BigChest) return createBigChest(scene);
  return createCampfire(scene);
}

function createSmallChest(scene: Phaser.Scene): Phaser.GameObjects.Rectangle[] {
  return createChest(scene, TILE_SIZE, 0x6a4428, 0x9e6a3d, 0x3b2516);
}

function createBigChest(scene: Phaser.Scene): Phaser.GameObjects.Rectangle[] {
  return createChest(scene, TILE_SIZE * 2, 0x6a4428, 0xb27b42, 0x3b2516);
}

function createChest(
  scene: Phaser.Scene,
  width: number,
  baseColor: number,
  lidColor: number,
  accentColor: number
): Phaser.GameObjects.Rectangle[] {
  const body = createRectangle(scene, width / 2, 11, width - 2, 9, baseColor);
  const lid = createRectangle(scene, width / 2, 6, width, 5, lidColor);
  const trim = createRectangle(scene, width / 2, 9, width, 1, accentColor);
  const latch = createRectangle(scene, width / 2, 10, 2, 4, 0xd8b56a);
  return [body, lid, trim, latch];
}

function createCampfire(scene: Phaser.Scene): Phaser.GameObjects.Rectangle[] {
  const logA = createRectangle(scene, 6, 11, 8, 2, 0x7a4c29);
  logA.setRotation(0.45);
  const logB = createRectangle(scene, 10, 11, 8, 2, 0x8d5a31);
  logB.setRotation(-0.45);
  const ember = createRectangle(scene, 8, 11, 4, 3, 0x5a2e14);
  const flameOuter = createRectangle(scene, 8, 7, 7, 8, 0xe3892b);
  const flameInner = createRectangle(scene, 8, 8, 3, 5, 0xffe07d);
  return [logA, logB, ember, flameOuter, flameInner];
}

function createRectangle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number
): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(x, y, width, height, color).setOrigin(0.5);
}
