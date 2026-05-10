import * as Phaser from 'phaser';
import { ToolType } from '../../utils/tools';

const TOOL_FRAME: Record<ToolType, number> = {
  [ToolType.Axe]: 0,
  [ToolType.Pickaxe]: 1,
  [ToolType.Sword]: 2,
  [ToolType.Spear]: 3,
};

export class Tool extends Phaser.GameObjects.Image {
  readonly toolType: ToolType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: ToolType) {
    super(scene, x, y, 'tools', TOOL_FRAME[type]);
    this.toolType = type;
    scene.add.existing(this);
    this.setDepth(1);
  }
}
