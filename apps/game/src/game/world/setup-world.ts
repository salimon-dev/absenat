import type { World } from '.';
import Player from '../player';
import Tile from '../entities/tile/tile';
import Tree from '../entities/tree';
import Tool from '../entities/tool';
import type { TilePlacement } from '../entities/types';
import { generateRandomMap, TILE_SIZE, WORLD_SIZE } from './tiles';
import { WorldEntityKind } from './types';
import type { EntityPlacement } from './types';

export function preloadWorld(this: World): void {
  Tile.preload(this);
  Tree.preload(this);
  Tool.preload(this);
}

export function createTilemap(this: World): void {
  const { tiles, entities } = generateRandomMap();
  renderTiles(this, tiles);
  renderEntities(this, entities);
}

function renderTiles(world: World, tiles: TilePlacement[][]): void {
  tiles.forEach((row, y) => renderTileRow(world, row, y));
}

function renderTileRow(world: World, row: TilePlacement[], y: number): void {
  row.forEach((tile, x) => {
    world.tiles.push(new Tile(world, x * TILE_SIZE, (y + 1) * TILE_SIZE, tile.biome, tile.variant));
  });
}

function renderEntities(world: World, entities: EntityPlacement[]): void {
  entities.forEach(entity => renderEntity(world, entity));
}

function renderEntity(world: World, entity: EntityPlacement): void {
  if (entity.kind === WorldEntityKind.Tree) {
    world.entities.push(new Tree(world, entity.x, entity.y, entity.variant));
  }
}

export function setupPlayer(this: World): void {
  this.player = new Player(this, {
    position: { x: 15 * TILE_SIZE, y: 95 * TILE_SIZE },
    speed: 2,
    attackSpeed: 1,
    health: { current: 100, total: 100, drainRate: 0 },
    thirst: { current: 65, total: 100, drainRate: 0.1 },
    hunger: { current: 70, total: 100, drainRate: 0.07 },
    fatigue: { current: 80, total: 100, drainRate: 0.02 }
  });
}

export function setupCamera(this: World): void {
  this.cameras.main.startFollow(this.player);
  this.cameras.main.setBounds(0, 0, WORLD_SIZE * TILE_SIZE, WORLD_SIZE * TILE_SIZE);
}
