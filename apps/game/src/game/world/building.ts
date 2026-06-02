import * as Phaser from 'phaser';
import { TILE_SIZE } from './tiles';
import { BuildEvent } from '../building/events';
import type { BuildPlacementPayload } from '../building/types';
import type { World } from '.';
import { BUILDABLE_DEFINITIONS } from '../building/definitions';
import type { BuildableName } from '../building/types';
import BuildingObject from '../building/building-object';
import { ResourceType } from '../../utils/resources';
import { isRaftTile } from './raft';

const BUILD_HINT_TEXT = 'Build on the raft';
const BLOCKED_HINT_TEXT = 'Space is occupied';
const LACKING_HINT_TEXT = 'Not enough wood';
const HINT_TEXT_STYLE = {
  backgroundColor: '#20140a',
  color: '#fff3d4',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: { x: 6, y: 4 }
} satisfies Phaser.Types.GameObjects.Text.TextStyle;

export function setupBuilding(this: World): void {
  BuildingObject.ensureTextures(this);
  this.input.mouse?.disableContextMenu();
  this.buildHint = this.add.text(0, 0, BUILD_HINT_TEXT, HINT_TEXT_STYLE).setDepth(1000).setScrollFactor(0).setVisible(false);
  this.input.on('pointermove', this.handleBuildPointerMove, this);
  this.input.on('pointerdown', this.handleBuildPointerDown, this);
  this.game.events.on(BuildEvent.StartPlacement, this.handleBuildStart, this);
  this.game.events.on(BuildEvent.CancelPlacement, this.handleBuildCancel, this);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardownBuilding, this);
  this.emitBuildState();
}

export function teardownBuilding(this: World): void {
  this.input.off('pointermove', this.handleBuildPointerMove, this);
  this.input.off('pointerdown', this.handleBuildPointerDown, this);
  this.game.events.off(BuildEvent.StartPlacement, this.handleBuildStart, this);
  this.game.events.off(BuildEvent.CancelPlacement, this.handleBuildCancel, this);
  this.buildPreview?.destroy();
  this.buildHint?.destroy();
}

export function handleBuildStart(this: World, payload: BuildPlacementPayload): void {
  this.activeBuild = payload.buildable;
  this.buildPreview?.destroy();
  this.buildPreview = new BuildingObject(this, 0, 0, payload.buildable).setPreview(false);
  this.emitBuildState();
}

export function handleBuildCancel(this: World): void {
  this.activeBuild = undefined;
  this.buildPreview?.destroy();
  this.buildPreview = undefined;
  this.buildHint.setVisible(false);
  this.emitBuildState();
}

export function handleBuildPointerMove(this: World, pointer: Phaser.Input.Pointer): void {
  if (!this.activeBuild || !this.buildPreview) return;
  const placement = getPointerPlacement(pointer);
  this.buildPreview.setPlacement(placement.x, placement.y);
  const validation = validatePlacement(this, this.activeBuild, placement.tileX, placement.tileY);
  this.buildPreview.setPreview(validation.valid);
  updateBuildHint(this, pointer, validation.reason);
}

export function handleBuildPointerDown(this: World, pointer: Phaser.Input.Pointer): void {
  if (pointer.button === 2) {
    this.handleBuildCancel();
    return;
  }
  if (pointer.button !== 0) return;
  if (!this.activeBuild || !this.buildPreview) return;
  const placement = getPointerPlacement(pointer);
  const validation = validatePlacement(this, this.activeBuild, placement.tileX, placement.tileY);
  if (!validation.valid) {
    updateBuildHint(this, pointer, validation.reason);
    return;
  }
  const structure = new BuildingObject(this, placement.x, placement.y, this.activeBuild).setPlaced();
  this.structures.push(structure);
  this.player.inventory.removeItem(ResourceType.Wood, BUILDABLE_DEFINITIONS[this.activeBuild].cost.count);
  this.handleBuildCancel();
}

export function emitBuildState(this: World): void {
  this.game.events.emit(BuildEvent.StateUpdate, { activeBuild: this.activeBuild });
}

function getPointerPlacement(pointer: Phaser.Input.Pointer): { x: number; y: number; tileX: number; tileY: number } {
  const tileX = Math.floor(pointer.worldX / TILE_SIZE);
  const tileY = Math.floor(pointer.worldY / TILE_SIZE);
  return { tileX, tileY, x: tileX * TILE_SIZE, y: (tileY + 1) * TILE_SIZE };
}

function validatePlacement(
  world: World,
  buildable: BuildableName,
  tileX: number,
  tileY: number
): { valid: boolean; reason?: string } {
  if (!hasBuildCost(world, buildable)) return { valid: false, reason: LACKING_HINT_TEXT };
  if (!isPlacementInsideRaft(buildable, tileX, tileY)) return { valid: false, reason: BUILD_HINT_TEXT };
  if (isStructureOccupied(world, buildable, tileX, tileY)) return { valid: false, reason: BLOCKED_HINT_TEXT };
  if (isPlayerInPlacement(world, buildable, tileX, tileY)) return { valid: false, reason: BLOCKED_HINT_TEXT };
  return { valid: true };
}

function hasBuildCost(world: World, buildable: BuildableName): boolean {
  const wood = world.player.inventory.getItemCount(ResourceType.Wood);
  return wood >= BUILDABLE_DEFINITIONS[buildable].cost.count;
}

function isPlacementInsideRaft(buildable: BuildableName, tileX: number, tileY: number): boolean {
  const definition = BUILDABLE_DEFINITIONS[buildable];
  return Array.from({ length: definition.width }).every((_, dx) =>
    Array.from({ length: definition.height }).every((__, dy) => isRaftTile(tileX + dx, tileY - dy))
  );
}

function isStructureOccupied(world: World, buildable: BuildableName, tileX: number, tileY: number): boolean {
  const bounds = getFootprintBounds(buildable, tileX, tileY);
  return world.structures.some(structure => Phaser.Geom.Intersects.RectangleToRectangle(bounds, getStructureBounds(structure)));
}

function isPlayerInPlacement(world: World, buildable: BuildableName, tileX: number, tileY: number): boolean {
  const player = world.player.getCollisionBounds();
  const bounds = getFootprintBounds(buildable, tileX, tileY);
  return Phaser.Geom.Intersects.RectangleToRectangle(player, bounds);
}

function getFootprintBounds(buildable: BuildableName, tileX: number, tileY: number): Phaser.Geom.Rectangle {
  const definition = BUILDABLE_DEFINITIONS[buildable];
  return new Phaser.Geom.Rectangle(
    tileX * TILE_SIZE,
    (tileY - definition.height + 1) * TILE_SIZE,
    definition.width * TILE_SIZE,
    definition.height * TILE_SIZE
  );
}

function getStructureBounds(structure: BuildingObject): Phaser.Geom.Rectangle {
  return new Phaser.Geom.Rectangle(
    structure.x,
    structure.y - structure.height * TILE_SIZE,
    structure.width * TILE_SIZE,
    structure.height * TILE_SIZE
  );
}

function updateBuildHint(world: World, pointer: Phaser.Input.Pointer, reason?: string): void {
  if (!reason) {
    world.buildHint.setVisible(false);
    return;
  }
  world.buildHint.setText(reason).setPosition(pointer.x + 14, pointer.y + 14).setVisible(true);
}
