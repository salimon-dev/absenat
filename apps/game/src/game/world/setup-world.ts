import type { World } from '.';
import Player from '../player';
import Tile from '../entities/tile/tile';
import Tree from '../entities/tree';
import Tool from '../entities/tool';
import type { TilePlacement } from '../entities/types';
import { generateRandomMap, TILE_SIZE, WORLD_SIZE } from './tiles';
import { WorldEntityKind } from './types';
import type { EntityPlacement } from './types';
import { getRaftSpawnPoint } from './raft';
import BuildingObject from '../building/building-object';
import type { SaveEntitySnapshot } from '../save/types';
import { getRenderedTilePlacements } from '../save/world-snapshot';

export function preloadWorld(this: World): void {
  Tile.preload(this);
  Tree.preload(this);
  Tool.preload(this);
}

export function createTilemap(this: World): void {
  if (this.initialSave) {
    renderTiles(this, this.initialSave.world.tiles);
    renderEntities(this, this.initialSave.world.entities);
    return;
  }
  const { tiles, entities } = generateRandomMap();
  renderTiles(this, tiles);
  renderEntities(this, entities);
}

export function getTilePlacements(this: World): TilePlacement[][] {
  return getRenderedTilePlacements(this.tiles, WORLD_SIZE);
}

function renderTiles(world: World, tiles: TilePlacement[][]): void {
  tiles.forEach((row, y) => renderTileRow(world, row, y));
}

function renderTileRow(world: World, row: TilePlacement[], y: number): void {
  row.forEach((tile, x) => {
    world.tiles.push(new Tile(world, x * TILE_SIZE, (y + 1) * TILE_SIZE, tile.biome, tile.variant));
  });
}

function renderEntities(world: World, entities: (EntityPlacement | SaveEntitySnapshot)[]): void {
  entities.forEach(entity => renderEntity(world, entity));
}

function renderEntity(world: World, entity: EntityPlacement | SaveEntitySnapshot): void {
  if (entity.kind === WorldEntityKind.Tree) {
    const tree = new Tree(world, entity.x, entity.y, entity.variant);
    const hp = getEntityHp(entity);
    if (hp !== undefined) tree.setHp(hp);
    world.entities.push(tree);
  }
}

function getEntityHp(entity: EntityPlacement | SaveEntitySnapshot): number | undefined {
  return 'hp' in entity ? entity.hp : undefined;
}

export function setupPlayer(this: World): void {
  if (this.initialSave) {
    this.player = new Player(this, this.initialSave.player.config);
    this.player.restoreSnapshot(this.initialSave.player);
    return;
  }
  const spawn = getRaftSpawnPoint();
  this.player = new Player(this, {
    position: spawn,
    speed: 2,
    attackSpeed: 1,
    inventorySlots: 16,
    health: { current: 100, total: 100, drainRate: 0 },
    thirst: { current: 65, total: 100, drainRate: 0.1 },
    hunger: { current: 70, total: 100, drainRate: 0.07 },
    fatigue: { current: 80, total: 100, drainRate: 0.02 }
  });
}

export function restoreSavedStructures(this: World): void {
  this.initialSave?.world.structures.forEach(structure => {
    this.structures.push(new BuildingObject(this, structure.x, structure.y, structure.buildable).setPlaced());
  });
}

export function setupCamera(this: World): void {
  this.cameras.main.startFollow(this.player);
  this.cameras.main.setBounds(0, 0, WORLD_SIZE * TILE_SIZE, WORLD_SIZE * TILE_SIZE);
}
