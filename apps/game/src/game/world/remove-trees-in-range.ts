import type Tree from '../entities/tree';
import type { EntityContent } from '../entities/types';
import type { World } from '.';
import { TILE_SIZE } from './tiles';

interface TilePosition {
  x: number;
  y: number;
}

export function removeTreesInRange(
  this: World,
  x: number,
  y: number,
  range: number,
  damage: number
): EntityContent {
  const origin = getTilePosition(x, y);
  const removedTrees = damageTreesInRange(this.entities, origin, range, damage);
  this.entities = this.entities.filter(tree => !removedTrees.includes(tree));
  removedTrees.forEach(tree => tree.destroy());
  return getTreeContents(removedTrees);
}

function damageTreesInRange(trees: Tree[], origin: TilePosition, range: number, damage: number): Tree[] {
  return trees.filter(tree => isTreeInRange(tree, origin, range) && tree.takeDamage(damage));
}

function getTreeContents(trees: Tree[]): EntityContent {
  return trees.flatMap(tree => tree.content.map(item => ({ ...item })));
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
