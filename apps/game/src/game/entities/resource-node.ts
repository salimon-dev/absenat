import * as Phaser from 'phaser';
import { getGroundObjectDepth, getTallObjectDepth } from '../world/render-depth';
import type { WorldEntityKindType } from '../world/types';
import HealthBar from './health-bar/health-bar';
import {
  getResourceNodeContent,
  getResourceNodeDefinition,
  RESOURCE_NODE_ASSET_PATH,
  RESOURCE_NODE_FRAME_SIZE,
  RESOURCE_NODE_TEXTURE_KEY,
  ResourceNodeCollision,
  ResourceNodeLayerDepth
} from './resource-node-definitions';
import type { EntityContent } from './types';

const HEALTH_BAR_OFFSET_X = 1;
const HEALTH_BAR_OFFSET_Y = -5;

export default class ResourceNode extends Phaser.GameObjects.Container {
  public readonly kind: WorldEntityKindType;
  public readonly collision: ResourceNodeCollision;
  public content: EntityContent;
  public hp: number;
  public variant: number;
  private readonly healthBar: HealthBar;
  private readonly sprites: Phaser.GameObjects.Sprite[];

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet(RESOURCE_NODE_TEXTURE_KEY, RESOURCE_NODE_ASSET_PATH, {
      frameWidth: RESOURCE_NODE_FRAME_SIZE,
      frameHeight: RESOURCE_NODE_FRAME_SIZE
    });
  }

  constructor(scene: Phaser.Scene, x: number, y: number, kind: WorldEntityKindType, variant: number) {
    super(scene, x, y);
    const definition = getResourceNodeDefinition(kind);
    this.kind = kind;
    this.collision = definition.collision;
    this.content = getResourceNodeContent(kind, variant);
    this.hp = definition.maxHp;
    this.variant = variant;
    this.sprites = createSprites(scene, x, y, variant, definition);
    this.healthBar = createHealthBar(scene, x, y, this.hp);
    scene.add.existing(this);
  }

  setHp(hp: number): this {
    const maxHp = getResourceNodeDefinition(this.kind).maxHp;
    this.hp = Math.max(hp, 0);
    this.healthBar.setValue(this.hp, maxHp);
    return this;
  }

  takeDamage(amount: number): boolean {
    return this.setHp(this.hp - amount).hp === 0;
  }

  destroy(fromScene?: boolean): void {
    this.sprites.forEach(sprite => sprite.destroy(fromScene));
    this.healthBar.destroy(fromScene);
    super.destroy(fromScene);
  }
}

type ResourceNodeDefinition = ReturnType<typeof getResourceNodeDefinition>;

function createSprites(
  scene: Phaser.Scene,
  x: number,
  y: number,
  variant: number,
  definition: ResourceNodeDefinition
): Phaser.GameObjects.Sprite[] {
  return definition.layers.map(layer =>
    scene.add
      .sprite(x, y + layer.yOffset, definition.textureKey, variant + layer.frameOffset)
      .setOrigin(0, 1)
      .setDepth(getLayerDepth(layer.depth, y))
  );
}

function getLayerDepth(depth: ResourceNodeLayerDepth, y: number): number {
  return depth === ResourceNodeLayerDepth.Tall ? getTallObjectDepth(y) : getGroundObjectDepth(y);
}

function createHealthBar(scene: Phaser.Scene, x: number, y: number, maxHp: number): HealthBar {
  return new HealthBar(scene, x + HEALTH_BAR_OFFSET_X, y + HEALTH_BAR_OFFSET_Y, {
    current: maxHp,
    total: maxHp
  });
}
