import type Tree from '../entities/tree';
import type { World } from '.';
import { TILE_SIZE } from './tiles';

interface TilePosition {
  x: number;
  y: number;
}

export function removeTreesInRange(this: World, x: number, y: number, range: number): void {
  const origin = getTilePosition(x, y);
  const remainingTrees = this.entities.filter(tree => keepTree(tree, origin, range));
  this.entities = remainingTrees;
}

function keepTree(tree: Tree, origin: TilePosition, range: number): boolean {
  if (!isTreeInRange(tree, origin, range)) return true;
  tree.destroy();
  return false;
}

function isTreeInRange(tree: Tree, origin: TilePosition, range: number): boolean {
  const tile = getTreeTilePosition(tree);
  return getTileDistance(tile, origin) <= range;
}

function getTilePosition(x: number, y: number): TilePosition {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE)
  };
}

function getTreeTilePosition(tree: Tree): TilePosition {
  return {
    x: Math.floor(tree.x / TILE_SIZE),
    y: Math.floor((tree.y - 1) / TILE_SIZE)
  };
}

function getTileDistance(tile: TilePosition, origin: TilePosition): number {
  return Math.max(Math.abs(tile.x - origin.x), Math.abs(tile.y - origin.y));
}
