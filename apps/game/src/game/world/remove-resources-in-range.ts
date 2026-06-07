import { ResourceNodeCollision } from '../entities/resource-node-definitions';
import type ResourceNode from '../entities/resource-node';
import type { EntityContent } from '../entities/types';
import type { World } from '.';
import { TILE_SIZE } from './tiles';

interface TilePosition {
  x: number;
  y: number;
}

export interface ResourceCollisionBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function removeResourcesInRange(
  this: World,
  x: number,
  y: number,
  range: number,
  damage: number
): EntityContent {
  const origin = getTilePosition(x, y);
  const removedNodes = damageNodesInRange(this.entities, origin, range, damage);
  this.entities = this.entities.filter(node => !removedNodes.includes(node));
  removedNodes.forEach(node => node.destroy());
  return getNodeContents(removedNodes);
}

export function getResourceCollisionBounds(node: ResourceNode): ResourceCollisionBounds | undefined {
  if (node.collision === ResourceNodeCollision.Passable) return undefined;
  const tile = getNodeTilePosition(node);
  return {
    left: tile.x * TILE_SIZE,
    right: (tile.x + 1) * TILE_SIZE,
    top: tile.y * TILE_SIZE,
    bottom: (tile.y + 1) * TILE_SIZE
  };
}

function damageNodesInRange(
  nodes: ResourceNode[],
  origin: TilePosition,
  range: number,
  damage: number
): ResourceNode[] {
  return nodes.filter(node => isNodeInRange(node, origin, range) && node.takeDamage(damage));
}

function getNodeContents(nodes: ResourceNode[]): EntityContent {
  return nodes.flatMap(node => node.content.map(item => ({ ...item })));
}

function isNodeInRange(node: ResourceNode, origin: TilePosition, range: number): boolean {
  const tile = getNodeTilePosition(node);
  return getTileDistance(tile, origin) <= range;
}

function getTilePosition(x: number, y: number): TilePosition {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE)
  };
}

function getNodeTilePosition(node: ResourceNode): TilePosition {
  return {
    x: Math.floor(node.x / TILE_SIZE),
    y: Math.floor((node.y - 1) / TILE_SIZE)
  };
}

function getTileDistance(tile: TilePosition, origin: TilePosition): number {
  return Math.max(Math.abs(tile.x - origin.x), Math.abs(tile.y - origin.y));
}
