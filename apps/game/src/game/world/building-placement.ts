import { BUILDABLE_DEFINITIONS } from '../building/definitions';
import type { BuildableName } from '../building/types';
import { TILE_SIZE } from './tiles';

export enum BuildValidationReason {
  BuildOnRaft = 'Build on the raft',
  SpaceOccupied = 'Space is occupied',
  NotEnoughWood = 'Not enough wood'
}

export type BuildValidationReasonType = BuildValidationReason;

export interface Bounds {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface BuildValidationContext {
  buildable: BuildableName;
  isRaftTile: (x: number, y: number) => boolean;
  playerBounds: Bounds;
  structureBounds: Bounds[];
  tileX: number;
  tileY: number;
  woodCount: number;
}

export interface BuildValidationResult {
  reason?: BuildValidationReasonType;
  valid: boolean;
}

export function validateBuildPlacement(context: BuildValidationContext): BuildValidationResult {
  if (!hasBuildCost(context.buildable, context.woodCount)) return invalid(BuildValidationReason.NotEnoughWood);
  if (!isPlacementInsideRaft(context.buildable, context.tileX, context.tileY, context.isRaftTile)) {
    return invalid(BuildValidationReason.BuildOnRaft);
  }
  const bounds = getBuildFootprintBounds(context.buildable, context.tileX, context.tileY);
  if (hasCollision(bounds, context.structureBounds)) return invalid(BuildValidationReason.SpaceOccupied);
  if (overlapsBounds(bounds, context.playerBounds)) return invalid(BuildValidationReason.SpaceOccupied);
  return { valid: true };
}

export function getBuildFootprintBounds(buildable: BuildableName, tileX: number, tileY: number): Bounds {
  const definition = BUILDABLE_DEFINITIONS[buildable];
  return {
    left: tileX * TILE_SIZE,
    right: (tileX + definition.width) * TILE_SIZE,
    top: (tileY - definition.height + 1) * TILE_SIZE,
    bottom: (tileY + 1) * TILE_SIZE
  };
}

function hasBuildCost(buildable: BuildableName, woodCount: number): boolean {
  return woodCount >= BUILDABLE_DEFINITIONS[buildable].cost.count;
}

function isPlacementInsideRaft(
  buildable: BuildableName,
  tileX: number,
  tileY: number,
  isRaftTile: (x: number, y: number) => boolean
): boolean {
  const definition = BUILDABLE_DEFINITIONS[buildable];
  for (let dx = 0; dx < definition.width; dx += 1) {
    for (let dy = 0; dy < definition.height; dy += 1) {
      if (!isRaftTile(tileX + dx, tileY - dy)) return false;
    }
  }
  return true;
}

function hasCollision(bounds: Bounds, structureBounds: Bounds[]): boolean {
  return structureBounds.some(structure => overlapsBounds(bounds, structure));
}

function overlapsBounds(first: Bounds, second: Bounds): boolean {
  return (
    first.right > second.left &&
    first.left < second.right &&
    first.bottom > second.top &&
    first.top < second.bottom
  );
}

function invalid(reason: BuildValidationReasonType): BuildValidationResult {
  return { valid: false, reason };
}
