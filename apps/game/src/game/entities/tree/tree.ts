import * as Phaser from 'phaser';
import { WObject, WObjectTypeEnum } from '../world-object';
import { drawTree } from './draw-tree';

export class Tree extends WObject {
  sprites: Phaser.GameObjects.Image[] = [];
  walkableMap: Map<string, boolean> = new Map();

  constructor(
    public scene: Phaser.Scene,
    public id: string
  ) {
    super(WObjectTypeEnum.Tree);
  }

  draw = drawTree;

  async destory(): Promise<void> {
    for (const sprite of this.sprites) sprite.destroy();
    this.sprites = [];
    this.walkableMap.clear();
  }

  isWalkable(tileX: number, tileY: number): boolean {
    return this.walkableMap.get(`${tileX},${tileY}`) ?? true;
  }
}
