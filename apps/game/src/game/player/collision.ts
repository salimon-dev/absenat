import type Tile from '../entities/tile/tile';
import type { World } from '../world';
import { TILE_SIZE, WORLD_SIZE } from '../world/tiles';
import type BuildingObject from '../building/building-object';

const PLAYER_RADIUS = 6;

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function canMove(world: World, nextX: number, nextY: number): boolean {
  return (
    isInsideWorld(nextX, nextY) &&
    canWalkOnTiles(world, nextX, nextY) &&
    canAvoidTrees(world, nextX, nextY) &&
    canAvoidStructures(world, nextX, nextY)
  );
}

function isInsideWorld(nextX: number, nextY: number): boolean {
  const maxPosition = WORLD_SIZE * TILE_SIZE;
  return nextX >= PLAYER_RADIUS && nextX <= maxPosition - PLAYER_RADIUS && nextY >= 0 && nextY <= maxPosition;
}

function canAvoidTrees(world: World, nextX: number, nextY: number): boolean {
  return world.entities.every(tree => !overlapsTree(nextX, nextY, tree.x, tree.y));
}

function canWalkOnTiles(world: World, nextX: number, nextY: number): boolean {
  return world.tiles.every(tile => tile.walkable || !overlapsTile(nextX, nextY, tile));
}

function canAvoidStructures(world: World, nextX: number, nextY: number): boolean {
  return world.structures.every(structure => !overlapsStructure(nextX, nextY, structure));
}

function overlapsTile(playerX: number, playerY: number, tile: Tile): boolean {
  const player = getPlayerBounds(playerX, playerY);
  const tileBounds = getTileBounds(tile);
  return overlapsBounds(player, tileBounds);
}

function overlapsTree(playerX: number, playerY: number, treeX: number, treeY: number): boolean {
  const player = getPlayerBounds(playerX, playerY);
  const root = getTreeRootBounds(treeX, treeY);
  return overlapsBounds(player, root);
}

function overlapsStructure(playerX: number, playerY: number, structure: BuildingObject): boolean {
  const player = getPlayerBounds(playerX, playerY);
  const bounds = getStructureBounds(structure);
  return overlapsBounds(player, bounds);
}

function getPlayerBounds(x: number, y: number): Bounds {
  return {
    left: x - PLAYER_RADIUS,
    right: x + PLAYER_RADIUS,
    top: y + 4,
    bottom: y + 12
  };
}

function getTreeRootBounds(x: number, y: number): Bounds {
  return {
    left: x,
    right: x + TILE_SIZE,
    top: y - TILE_SIZE,
    bottom: y
  };
}

function getTileBounds(tile: Tile): Bounds {
  return {
    left: tile.x,
    right: tile.x + TILE_SIZE,
    top: tile.y - TILE_SIZE,
    bottom: tile.y
  };
}

function getStructureBounds(structure: BuildingObject): Bounds {
  return {
    left: structure.x,
    right: structure.x + structure.width * TILE_SIZE,
    top: structure.y - structure.height * TILE_SIZE,
    bottom: structure.y
  };
}

function overlapsBounds(first: Bounds, second: Bounds): boolean {
  return (
    first.right > second.left && first.left < second.right && first.bottom > second.top && first.top < second.bottom
  );
}
