import * as Phaser from 'phaser';
import { World } from '../world';
import type { PlayerConfig } from '@absenat/specs';
import { setupPlayerAnimations } from './animations';
import { applyMovement, type Keys } from './movement';
import { drainStats } from './stats';

export default class Player extends Phaser.GameObjects.Sprite {
  speed = 2;
  protected world: World;
  protected config: PlayerConfig;
  private keys: Keys;
  private lastDirection: 'up' | 'down' | 'left' | 'right' = 'down';
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
    } else {
      throw new Error('Keyboard input not available');
    }

    setupPlayerAnimations(this.scene.anims);
    this.play('idle-down');

    // Setup camera
    world.cameras.main.setZoom(4);
    world.cameras.main.startFollow(this, true, 0.1, 0.1);

    this.statsDrainInterval = setInterval(() => this.updateStats(), 1000);
    this.updateStats();
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
  }
}
