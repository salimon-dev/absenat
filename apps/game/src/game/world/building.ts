import * as Phaser from 'phaser';
import { BuildEvent, BuildPlacementReason, type BuildPlacementReasonType, type BuildPlacementStartPayload } from '../build/types';
import { getBuildableSpec } from '../build/buildables';
import Structure from '../entities/structure/structure';
import { TILE_SIZE } from './tiles';
import { isRaftBuildTile } from './raft';
import type { World } from '.';

interface TilePointer {
  tileX: number;
  tileY: number;
}

interface ActiveBuildPlacement extends TilePointer {
  buildable: BuildPlacementStartPayload['buildable'];
  reason: BuildPlacementReasonType;
  valid: boolean;
}

export type ActiveBuildPlacementState = ActiveBuildPlacement;

const BUILD_PREVIEW_ALPHA = 0.45;
const BUILD_VALID_COLOR = 0x65d26e;
const BUILD_INVALID_COLOR = 0xd15a5a;

export function registerBuildingEvents(this: World): void {
  this.game.events.on(BuildEvent.PlacementStart, this.startBuildPlacement, this);
  this.game.events.on(BuildEvent.PlacementCancel, this.cancelBuildPlacement, this);
  this.input.on(Phaser.Input.Events.POINTER_MOVE, this.handleBuildPointerMove, this);
  this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleBuildPointerDown, this);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroyBuildingEvents, this);
}

export function destroyBuildingEvents(this: World): void {
  this.game.events.off(BuildEvent.PlacementStart, this.startBuildPlacement, this);
  this.game.events.off(BuildEvent.PlacementCancel, this.cancelBuildPlacement, this);
  this.input.off(Phaser.Input.Events.POINTER_MOVE, this.handleBuildPointerMove, this);
  this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handleBuildPointerDown, this);
  this.buildPlacementPreview?.destroy();
  this.buildPlacementPreview = undefined;
  this.buildPlacementPrompt?.destroy();
  this.buildPlacementPrompt = undefined;
  this.activeBuildPlacement = undefined;
}

export function startBuildPlacement(this: World, payload: BuildPlacementStartPayload): void {
  this.activeBuildPlacement = createBuildPlacement(payload.buildable);
  updatePlacementFromPointer(this, this.input.activePointer);
}

export function cancelBuildPlacement(this: World): void {
  this.activeBuildPlacement = undefined;
  this.buildPlacementPreview?.setVisible(false);
  this.buildPlacementPrompt?.setVisible(false);
}

export function handleBuildPointerMove(this: World, pointer: Phaser.Input.Pointer): void {
  if (!this.activeBuildPlacement) return;
  updatePlacementFromPointer(this, pointer);
}

export function handleBuildPointerDown(this: World, pointer: Phaser.Input.Pointer): void {
  if (!this.activeBuildPlacement) return;
  if (pointer.button !== 0) return;
  updatePlacementFromPointer(this, pointer);
  if (!this.activeBuildPlacement.valid) return;
  placeStructure(this);
}

function placeStructure(world: World): void {
  const placement = world.activeBuildPlacement;
  if (!placement) return;
  const structure = new Structure(world, placement);
  world.structures.push(structure);
  removeBuildCosts(world, placement.buildable);
  cancelBuildPlacement.call(world);
}

function removeBuildCosts(world: World, buildable: BuildPlacementStartPayload['buildable']): void {
  const costs = getBuildableSpec(buildable).costs;
  costs.forEach(cost => world.player.inventory.removeItem(cost.resource, cost.count));
}

function updatePlacementFromPointer(world: World, pointer: Phaser.Input.Pointer): void {
  const placement = world.activeBuildPlacement;
  if (!placement) return;
  const target = getTilePointer(pointer);
  placement.tileX = target.tileX;
  placement.tileY = target.tileY;
  placement.reason = getPlacementReason(world, placement);
  placement.valid = placement.reason === BuildPlacementReason.Unset;
  renderPlacementPreview(world, placement);
}

function renderPlacementPreview(world: World, placement: ActiveBuildPlacement): void {
  const preview = getBuildPreview(world, placement);
  preview.setPosition(placement.tileX * TILE_SIZE, placement.tileY * TILE_SIZE);
  preview.setFillStyle(placement.valid ? BUILD_VALID_COLOR : BUILD_INVALID_COLOR, BUILD_PREVIEW_ALPHA);
  preview.setVisible(true);
  renderPlacementPrompt(world, placement);
}

function renderPlacementPrompt(world: World, placement: ActiveBuildPlacement): void {
  const prompt = getBuildPrompt(world);
  const text = getPlacementPromptText(placement.reason);
  if (!text) {
    prompt.setVisible(false);
    return;
  }
  prompt.setText(text);
  prompt.setPosition((placement.tileX + 0.5) * TILE_SIZE, placement.tileY * TILE_SIZE - 8);
  prompt.setVisible(true);
}

function getBuildPreview(world: World, placement: ActiveBuildPlacement): Phaser.GameObjects.Rectangle {
  const spec = getBuildableSpec(placement.buildable);
  const preview = world.buildPlacementPreview;
  if (preview) {
    preview.setSize(spec.width * TILE_SIZE, spec.height * TILE_SIZE);
    preview.setDisplaySize(spec.width * TILE_SIZE, spec.height * TILE_SIZE);
    return preview;
  }
  world.buildPlacementPreview = world.add
    .rectangle(0, 0, spec.width * TILE_SIZE, spec.height * TILE_SIZE, BUILD_VALID_COLOR, BUILD_PREVIEW_ALPHA)
    .setOrigin(0)
    .setDepth(40);
  return world.buildPlacementPreview;
}

function getBuildPrompt(world: World): Phaser.GameObjects.Text {
  if (world.buildPlacementPrompt) return world.buildPlacementPrompt;
  world.buildPlacementPrompt = world.add
    .text(0, 0, '', {
      color: '#fff4d0',
      backgroundColor: '#312114',
      fontFamily: 'monospace',
      fontSize: '10px',
      padding: { x: 5, y: 3 }
    })
    .setOrigin(0.5, 1)
    .setDepth(41)
    .setVisible(false);
  return world.buildPlacementPrompt;
}

function getPlacementReason(world: World, placement: ActiveBuildPlacement): BuildPlacementReasonType {
  if (!hasBuildResources(world, placement.buildable)) return BuildPlacementReason.NoResources;
  if (!isBuildAreaFree(world, placement)) return BuildPlacementReason.OutsideRaft;
  if (hasStructureOverlap(world, placement)) return BuildPlacementReason.Occupied;
  if (isPlayerInsidePlacement(world, placement)) return BuildPlacementReason.PlayerBlocked;
  return BuildPlacementReason.Unset;
}

function hasBuildResources(world: World, buildable: BuildPlacementStartPayload['buildable']): boolean {
  return getBuildableSpec(buildable).costs.every(cost => world.player.inventory.getItemCount(cost.resource) >= cost.count);
}

function isBuildAreaFree(_world: World, placement: ActiveBuildPlacement): boolean {
  const spec = getBuildableSpec(placement.buildable);
  return iterateFootprint(placement.tileX, placement.tileY, spec.width, spec.height).every(tile =>
    isRaftBuildTile(tile.tileX, tile.tileY)
  );
}

function hasStructureOverlap(world: World, placement: ActiveBuildPlacement): boolean {
  const spec = getBuildableSpec(placement.buildable);
  return world.structures.some(structure => footprintsOverlap(placement, spec.width, spec.height, structure.footprint));
}

function isPlayerInsidePlacement(world: World, placement: ActiveBuildPlacement): boolean {
  const spec = getBuildableSpec(placement.buildable);
  const playerTileX = Math.floor(world.player.x / TILE_SIZE);
  const playerTileY = Math.floor(world.player.y / TILE_SIZE);
  return (
    playerTileX >= placement.tileX &&
    playerTileX < placement.tileX + spec.width &&
    playerTileY >= placement.tileY &&
    playerTileY < placement.tileY + spec.height
  );
}

function footprintsOverlap(
  placement: TilePointer,
  width: number,
  height: number,
  footprint: Structure['footprint']
): boolean {
  return !(
    placement.tileX + width <= footprint.tileX ||
    placement.tileX >= footprint.tileX + footprint.width ||
    placement.tileY + height <= footprint.tileY ||
    placement.tileY >= footprint.tileY + footprint.height
  );
}

function iterateFootprint(tileX: number, tileY: number, width: number, height: number): TilePointer[] {
  return Array.from({ length: width * height }, (_, index) => ({
    tileX: tileX + (index % width),
    tileY: tileY + Math.floor(index / width)
  }));
}

function getTilePointer(pointer: Phaser.Input.Pointer): TilePointer {
  return {
    tileX: Math.floor(pointer.worldX / TILE_SIZE),
    tileY: Math.floor(pointer.worldY / TILE_SIZE)
  };
}

function createBuildPlacement(buildable: BuildPlacementStartPayload['buildable']): ActiveBuildPlacement {
  return {
    buildable,
    tileX: 0,
    tileY: 0,
    reason: BuildPlacementReason.Unset,
    valid: false
  };
}

function getPlacementPromptText(reason: BuildPlacementReasonType): string {
  if (reason === BuildPlacementReason.NoResources) return 'Not enough wood';
  if (reason === BuildPlacementReason.OutsideRaft) return 'Build inside the raft';
  if (reason === BuildPlacementReason.PlayerBlocked) return 'Move away to place this';
  if (reason === BuildPlacementReason.Occupied) return 'That spot is blocked';
  return '';
}
