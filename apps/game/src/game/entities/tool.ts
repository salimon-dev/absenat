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
const SWING_DURATION = 130;

interface SwingPose {
  x: number;
  y: number;
  depth: number;
  startAngle: number;
  endAngle: number;
}

export default class Tool extends Phaser.GameObjects.Sprite {
  private swingTween?: Phaser.Tweens.Tween;

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(TOOL_TEXTURE_KEY, TOOL_ASSET_PATH, {
      frameWidth: TOOL_FRAME_WIDTH,
      frameHeight: TOOL_FRAME_HEIGHT
    });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, type: ToolType) {
    super(scene, x, y, TOOL_TEXTURE_KEY, getToolFrame(type));

    this.setOrigin(0.5, 1);
    this.setDepth(y);
    scene.add.existing(this);
  }

  setType(type: ToolType): this {
    this.setFrame(getToolFrame(type));
    return this;
  }

  use(type: ToolType, x: number, y: number): void {
    this.setType(type);
    this.swing(x, y);
  }

  follow(x: number, y: number): void {
    updateSwingPosition(this, createSwingPose(x, y));
  }

  swing(x: number, y: number): void {
    const pose = createSwingPose(x, y);
    this.swingTween?.stop();
    prepareSwing(this, pose);
    this.swingTween = this.scene.tweens.add(createSwingTween(this, pose));
  }

  stopSwing(): void {
    this.swingTween?.stop();
    this.swingTween = undefined;
    this.setVisible(false);
  }
}

function getToolFrame(type: ToolType): number {
  return TOOL_TYPES.indexOf(type);
}

function prepareSwing(tool: Tool, pose: SwingPose): void {
  updateSwingPosition(tool, pose);
  tool.setAngle(pose.startAngle);
  tool.setFlipX(false);
  tool.setVisible(true);
}

function updateSwingPosition(tool: Tool, pose: SwingPose): void {
  tool.setPosition(pose.x, pose.y);
  tool.setDepth(pose.depth);
}

function createSwingTween(tool: Tool, pose: SwingPose): Phaser.Types.Tweens.TweenBuilderConfig {
  return {
    targets: tool,
    angle: pose.endAngle,
    duration: SWING_DURATION,
    ease: 'Linear',
    onComplete: () => tool.setVisible(false),
    onStop: () => tool.setVisible(false)
  };
}

function createSwingPose(x: number, y: number): SwingPose {
  return { x, y, depth: y + 1, startAngle: 0, endAngle: 360 };
}
