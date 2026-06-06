import * as Phaser from 'phaser';
import { getWorldOverlayDepth } from '../../world/render-depth';
import type { HealthBarConfig, HealthBarValue } from './types';

const DEFAULT_HEALTH_BAR_CONFIG: HealthBarConfig = {
  width: 14,
  height: 3,
  borderWidth: 0.5,
  backgroundColor: 0x1f1f1f,
  borderColor: 0x000000,
  fillColor: 0xd94a38,
  depth: getWorldOverlayDepth()
};

export default class HealthBar extends Phaser.GameObjects.Graphics {
  private readonly config: HealthBarConfig;
  private value: HealthBarValue;

  constructor(scene: Phaser.Scene, x: number, y: number, value: HealthBarValue, config?: Partial<HealthBarConfig>) {
    super(scene);

    this.config = { ...DEFAULT_HEALTH_BAR_CONFIG, ...config };
    this.value = value;
    this.setPosition(x, y);
    this.setDepth(this.config.depth);
    scene.add.existing(this);
    this.render();
  }

  setValue(current: number, total: number): this {
    this.value = { current, total };
    this.render();
    return this;
  }

  private render(): void {
    this.clear();
    this.setVisible(!isFullHealth(this.value));
    if (!this.visible) return;
    drawBackground(this, this.config);
    drawFill(this, this.config, getHealthRatio(this.value));
  }
}

function isFullHealth(value: HealthBarValue): boolean {
  return value.current >= value.total;
}

function getHealthRatio(value: HealthBarValue): number {
  if (value.total <= 0) return 0;
  return Phaser.Math.Clamp(value.current / value.total, 0, 1);
}

function drawBackground(bar: HealthBar, config: HealthBarConfig): void {
  bar.fillStyle(config.borderColor);
  bar.fillRect(0, 0, config.width, config.height);
  bar.fillStyle(config.backgroundColor);
  bar.fillRect(config.borderWidth, config.borderWidth, getInnerWidth(config), getInnerHeight(config));
}

function drawFill(bar: HealthBar, config: HealthBarConfig, ratio: number): void {
  bar.fillStyle(config.fillColor);
  bar.fillRect(config.borderWidth, config.borderWidth, getFillWidth(config, ratio), getInnerHeight(config));
}

function getFillWidth(config: HealthBarConfig, ratio: number): number {
  return Math.ceil(getInnerWidth(config) * ratio);
}

function getInnerWidth(config: HealthBarConfig): number {
  return config.width - config.borderWidth * 2;
}

function getInnerHeight(config: HealthBarConfig): number {
  return config.height - config.borderWidth * 2;
}
