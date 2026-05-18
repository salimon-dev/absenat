import * as Phaser from 'phaser';
import { World } from '../world';
import type { PlayerConfig } from '@absenat/specs';
import { setupPlayerAnimations } from './animations';
import { applyMovement, type Direction, type Keys } from './movement';
import { drainStats } from './stats';
import Tool from '../entities/tool';
import { ToolType, type ToolName } from '../../utils/tools';
import type { InventoryItem } from './types';

interface ToolKeys {
  sword: Phaser.Input.Keyboard.Key;
}

const MILLISECONDS_PER_SECOND = 1000;

export default class Player extends Phaser.GameObjects.Sprite {
  speed = 2;
  protected world: World;
  protected config: PlayerConfig;
  inventory: InventoryItem[] = createInitialInventory();
  private keys: Keys;
  private toolKeys: ToolKeys;
  private sword: Tool;
  private lastDirection: Direction = 'down';
  private nextSwordSwingAt = 0;
  private statsDrainInterval!: ReturnType<typeof setInterval>;

  constructor(world: World, config: PlayerConfig) {
    super(world, config.position.x, config.position.y, 'player');
    this.config = config;

    world.add.existing(this);
    this.world = world;

    if (world.input.keyboard) {
      this.keys = {
        up: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        left: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
      };
      this.toolKeys = {
        sword: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
      };
    } else {
      throw new Error('Keyboard input not available');
    }

    this.sword = new Tool(world, this.x, this.y, ToolType.Sword);
    this.sword.setVisible(false);

    setupPlayerAnimations(this.scene.anims);
    this.play('idle-down');

    // Setup camera
    world.cameras.main.setZoom(4);
    world.cameras.main.startFollow(this, true, 0.1, 0.1);

    this.statsDrainInterval = setInterval(() => this.updateStats(), 1000);
    this.updateStats();
    window.setTimeout(() => this.emitInventory(), 0);
  }

  emitInventory(): void {
    this.scene.game.events.emit('inventory-update', this.getInventorySnapshot());
  }

  private getInventorySnapshot(): InventoryItem[] {
    return this.inventory.map(item => ({ ...item }));
  }

  private updateStats(): void {
    drainStats(this.config);
    this.scene.game.events.emit('stats-update', {
      health: this.config.health,
      thirst: this.config.thirst,
      hunger: this.config.hunger,
      fatigue: this.config.fatigue
    });
  }

  destroy(fromScene?: boolean) {
    clearInterval(this.statsDrainInterval);
    this.sword.destroy(fromScene);
    super.destroy(fromScene);
  }

  update() {
    const { x, y, moving, lastDirection } = applyMovement(
      this.world,
      this.keys,
      this.config,
      this.x,
      this.y,
      this.lastDirection
    );
    this.x = x;
    this.y = y;
    this.lastDirection = lastDirection;

    this.setDepth(2);

    if (moving) {
      this.play(`walk-${this.lastDirection}`, true);
    } else {
      const idleKey = this.lastDirection === 'up' ? 'idle-up' : 'idle-down';
      this.play(idleKey, true);
    }

    this.handleToolInput();
  }

  private handleToolInput(): void {
    if (this.toolKeys.sword.isDown) {
      this.updateSwordSwing();
      return;
    }
    this.nextSwordSwingAt = 0;
    this.sword.stopSwing();
  }

  private updateSwordSwing(): void {
    this.sword.follow(this.x, this.y);
    if (this.config.attackSpeed <= 0) return;
    if (this.scene.time.now < this.nextSwordSwingAt) return;
    this.sword.swing(this.x, this.y);
    this.nextSwordSwingAt = this.scene.time.now + getAttackInterval(this.config.attackSpeed);
  }
}

function getAttackInterval(attackSpeed: number): number {
  if (attackSpeed <= 0) return Number.POSITIVE_INFINITY;
  return MILLISECONDS_PER_SECOND / attackSpeed;
}

function createInitialInventory(): InventoryItem[] {
  return [
    createToolInventoryItem(ToolType.Axe),
    createToolInventoryItem(ToolType.Sword),
    createToolInventoryItem(ToolType.Pickaxe),
    createToolInventoryItem(ToolType.Hammer)
  ];
}

function createToolInventoryItem(name: ToolName): InventoryItem {
  return { name, count: 1, durability: 1 };
}
