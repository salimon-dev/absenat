import * as Phaser from 'phaser';
import { World } from '../world';
import type { PlayerConfig } from '@absenat/specs';
import { setupPlayerAnimations } from './animations';
import { applyMovement, type Direction, type Keys } from './movement';
import {
  createSurvivalPenaltyTimers,
  drainStats,
  resetSurvivalPenaltyTimers,
  type SurvivalPenaltyTimers
} from './stats';
import Tool from '../entities/tool';
import { TOOL_DEFINITIONS, ToolType, type ToolName } from '../../utils/tools';
import InventoryManager from './inventory';
import {
  PlayerEvent,
  PlayerLifeState,
  type PlayerLifeStatePayload,
  type PlayerStatsSnapshot
} from './types';
import { createPlayerSpawnState, resetPlayerConfig, type PlayerSpawnState } from './state';

interface ToolKeys {
  q: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  e: Phaser.Input.Keyboard.Key;
  r: Phaser.Input.Keyboard.Key;
}

const MILLISECONDS_PER_SECOND = 1000;
const AXE_TREE_DAMAGE = 3;

export default class Player extends Phaser.GameObjects.Sprite {
  speed = 2;
  protected world: World;
  protected config: PlayerConfig;
  inventory: InventoryManager;
  private keys: Keys;
  private toolKeys: ToolKeys;
  private activeTool: Tool;
  private lastDirection: Direction = 'down';
  private lifeState = PlayerLifeState.Alive;
  private nextToolUseAt = 0;
  private spawnState: PlayerSpawnState;
  private statsDrainInterval!: ReturnType<typeof setInterval>;
  private survivalPenaltyTimers: SurvivalPenaltyTimers;

  constructor(world: World, config: PlayerConfig) {
    super(world, config.position.x, config.position.y, 'player');
    this.config = config;
    this.spawnState = createPlayerSpawnState(config);
    this.survivalPenaltyTimers = createSurvivalPenaltyTimers();

    world.add.existing(this);
    this.world = world;
    this.inventory = new InventoryManager(this.scene.game.events, config.inventorySlots);

    if (world.input.keyboard) {
      this.keys = {
        up: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        down: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        left: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
      };
      this.toolKeys = {
        q: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        w: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        e: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        r: world.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
      };
    } else {
      throw new Error('Keyboard input not available');
    }

    this.activeTool = new Tool(world, this.x, this.y, ToolType.Sword);
    this.activeTool.setVisible(false);

    setupPlayerAnimations(this.scene.anims);
    this.play('idle-down');

    // Setup camera
    world.cameras.main.setZoom(4);
    world.cameras.main.startFollow(this, true, 0.1, 0.1);

    this.scene.game.events.on(PlayerEvent.RespawnRequest, this.handleRespawnRequest, this);
    this.statsDrainInterval = setInterval(() => this.updateStats(), 1000);
    this.updateStats();
    window.setTimeout(() => this.inventory.emitUpdate(), 0);
  }

  emitInventory(): void {
    this.inventory.emitUpdate();
  }

  getCollisionBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 6, this.y + 4, 12, 8);
  }

  private updateStats(): void {
    const isDead = drainStats(this.config, 1, this.survivalPenaltyTimers);
    this.emitStatsUpdate();
    if (isDead) {
      this.handleDeath();
    }
  }

  private emitStatsUpdate(): void {
    const payload: PlayerStatsSnapshot = {
      health: this.config.health,
      thirst: this.config.thirst,
      hunger: this.config.hunger,
      fatigue: this.config.fatigue
    };
    this.scene.game.events.emit(PlayerEvent.StatsUpdate, payload);
  }

  private handleDeath(): void {
    if (this.lifeState === PlayerLifeState.Dead) return;
    this.lifeState = PlayerLifeState.Dead;
    this.activeTool.stopSwing();
    this.emitLifeState();
  }

  private emitLifeState(): void {
    const payload: PlayerLifeStatePayload = { state: this.lifeState };
    this.scene.game.events.emit(PlayerEvent.LifeStateChange, payload);
  }

  private handleRespawnRequest(): void {
    if (this.lifeState !== PlayerLifeState.Dead) return;
    resetPlayerConfig(this.config, this.spawnState);
    resetSurvivalPenaltyTimers(this.survivalPenaltyTimers);
    this.x = this.spawnState.position.x;
    this.y = this.spawnState.position.y;
    this.lastDirection = 'down';
    this.nextToolUseAt = 0;
    this.lifeState = PlayerLifeState.Alive;
    this.activeTool.follow(this.x, this.y);
    this.activeTool.stopSwing();
    this.emitStatsUpdate();
    this.emitLifeState();
  }

  destroy(fromScene?: boolean) {
    clearInterval(this.statsDrainInterval);
    this.scene.game.events.off(PlayerEvent.RespawnRequest, this.handleRespawnRequest, this);
    this.inventory.destroy();
    this.activeTool.destroy(fromScene);
    super.destroy(fromScene);
  }

  update() {
    if (this.lifeState === PlayerLifeState.Dead) {
      this.activeTool.stopSwing();
      this.playIdleAnimation();
      return;
    }

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

    this.setDepth(10);

    if (moving) {
      this.play(`walk-${this.lastDirection}`, true);
    } else {
      this.playIdleAnimation();
    }

    this.handleToolInput();
  }

  private playIdleAnimation(): void {
    const idleKey = this.lastDirection === 'up' ? 'idle-up' : 'idle-down';
    this.play(idleKey, true);
  }

  private handleToolInput(): void {
    const toolName = this.getActiveQuickSlotToolName();
    if (toolName) {
      this.updateToolUse(toolName);
      return;
    }
    this.activeTool.stopSwing();
  }

  private getActiveQuickSlotToolName(): ToolName | undefined {
    const key = getPressedToolKey(this.toolKeys);
    if (!key) return undefined;
    return this.inventory.getSelectedQuickSlotItemName(key);
  }

  private updateToolUse(toolName: ToolName): void {
    this.activeTool.setType(toolName);
    this.activeTool.follow(this.x, this.y);
    if (this.config.attackSpeed <= 0) return;
    if (this.scene.time.now < this.nextToolUseAt) return;
    this.activeTool.use(toolName, this.x, this.y);
    this.applyToolEffect(toolName);
    this.nextToolUseAt = this.scene.time.now + getAttackInterval(this.config.attackSpeed);
  }

  private applyToolEffect(toolName: ToolName): void {
    if (toolName !== ToolType.Axe) return;
    const contents = this.world.removeTreesInRange(this.x, this.y, TOOL_DEFINITIONS[toolName].range, AXE_TREE_DAMAGE);
    contents.forEach(item => this.inventory.addItem(item));
  }
}

function getAttackInterval(attackSpeed: number): number {
  if (attackSpeed <= 0) return Number.POSITIVE_INFINITY;
  return MILLISECONDS_PER_SECOND / attackSpeed;
}

function getPressedToolKey(keys: ToolKeys): string | undefined {
  if (keys.q.isDown) return 'q';
  if (keys.w.isDown) return 'w';
  if (keys.e.isDown) return 'e';
  if (keys.r.isDown) return 'r';
  return undefined;
}
