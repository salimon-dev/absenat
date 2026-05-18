import * as Phaser from 'phaser';
import { ToolType } from '../../utils/tools';

export const TOOL_TEXTURE_KEY = 'tools';
const TOOL_ASSET_PATH = 'assets/tools.png';
const TOOL_FRAME_WIDTH = 16;
const TOOL_FRAME_HEIGHT = 16;
const TOOL_TYPES = [
  ToolType.Bow,
  ToolType.Sword,
  ToolType.Axe,
  ToolType.Pickaxe,
  ToolType.Hammer
];

export default class Tool extends Phaser.GameObjects.Sprite {
  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(TOOL_TEXTURE_KEY, TOOL_ASSET_PATH, {
      frameWidth: TOOL_FRAME_WIDTH,
      frameHeight: TOOL_FRAME_HEIGHT
    });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, type: ToolType) {
    super(scene, x, y, TOOL_TEXTURE_KEY, getToolFrame(type));

    this.setOrigin(0, 1);
    this.setDepth(y);
    scene.add.existing(this);
  }

  setType(type: ToolType): this {
    this.setFrame(getToolFrame(type));
    return this;
  }
}

function getToolFrame(type: ToolType): number {
  return TOOL_TYPES.indexOf(type);
}
