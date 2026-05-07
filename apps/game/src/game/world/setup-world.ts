import type { World } from '.';
import { TILE_SIZE, WORLD_SIZE } from './tiles';
import type { Tilemap, Entity } from '@absenat/specs';
import { Biome, MODE_CHAR_TO_BIOME } from '@absenat/specs';
import { generateRandomMap } from './tiles';
import Player from '../player';
import { EntitySprite } from '../entities/entity';
import type { MapResult } from './map-generator';
import { parseModulesData } from './module-parser';

export function preloadWorld(this: World) {
  this.load.spritesheet('tiles', 'assets/tilemap.png', {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE,
    margin: 0,
    spacing: 0
  });
  this.load.json('tilemap_data', 'assets/tilemap.json');

  this.load.spritesheet('entities', 'assets/entities.png', {
    frameWidth: TILE_SIZE,
    frameHeight: TILE_SIZE
  });
  this.load.json('entities_data', 'assets/entities.json');
  this.load.text('modules_data', 'assets/modules.data');
}

export function createTilemap(this: World) {
  const tilemapJson = this.cache.json.get('tilemap_data') as Tilemap;
  const entityDefs = this.cache.json.get('entities_data') as Entity[];
  const modulesText = this.cache.text.get('modules_data') as string;
  const modules = parseModulesData(modulesText);
  const { tiles, entities } = generateRandomMap(tilemapJson, modules) as unknown as MapResult;
  this.mapData = tiles;
  const entityDefMap = new Map(entityDefs.map(e => [e.id, e]));

  const nonWalkableBiomes = new Set([Biome.Water, Biome.Lava]);
  const nonWalkableIds = new Set<number>();

  tilemapJson.forEach(tile => {
    const biomes = tile.mode.split('').map(c => MODE_CHAR_TO_BIOME[c]);
    if (biomes.some(b => b && nonWalkableBiomes.has(b))) {
      nonWalkableIds.add(tile.frame);
    }
  });

  this.nonWalkableIds = nonWalkableIds;

  this.tilemap = this.make.tilemap({
    data: this.mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });

  const tileset = this.tilemap.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0);
  if (tileset) {
    this.tilemap.createLayer(0, tileset, 0, 0);
  }

  entities.forEach(placement => {
    const def = entityDefMap.get(placement.entityId);
    if (!def) return;
    this.entities.push(new EntitySprite(this, placement.x, placement.y, def));
  });
}

export function setupPlayer(this: World) {
  this.player = new Player(this, {
    position: { x: 15 * TILE_SIZE, y: 95 * TILE_SIZE },
    speed: 2,
    health: { current: 100, total: 100, drainRate: 0 },
    thirst: { current: 65, total: 100, drainRate: 0.1 },
    hunger: { current: 70, total: 100, drainRate: 0.07 },
    fatigue: { current: 80, total: 100, drainRate: 0.02 }
  });
}

export function setupCamera(this: World) {
  this.cameras.main.startFollow(this.player);
  this.cameras.main.setBounds(0, 0, WORLD_SIZE * TILE_SIZE, WORLD_SIZE * TILE_SIZE);
}
