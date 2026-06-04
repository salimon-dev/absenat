import * as Phaser from 'phaser';
import Player from '../player';
import { createTilemap, preloadWorld, setupCamera, setupPlayer } from './setup-world';
import { TREE_TEXTURE_KEY } from '../entities/tree';
import Tree from '../entities/tree';
import { TILE_TEXTURE_KEY } from '../entities/tile/tile';
import Tile from '../entities/tile/tile';
import { TOOL_TEXTURE_KEY } from '../entities/tool';
import { removeTreesInRange } from './remove-trees-in-range';
import type BuildingObject from '../building/building-object';
import type { BuildableName } from '../building/types';
import {
  emitBuildState,
  handleBuildCancel,
  handleBuildPointerDown,
  handleBuildPointerMove,
  handleBuildStart,
  setupBuilding,
  teardownBuilding
} from './building';

export class World extends Phaser.Scene {
  player!: Player;
  tiles: Tile[] = [];
  entities: Tree[] = [];
  structures: BuildingObject[] = [];
  activeBuild?: BuildableName;
  buildPreview?: BuildingObject;
  buildHint!: Phaser.GameObjects.Text;

  constructor() {
    super('world');
  }

  protected preloadWorld = preloadWorld;
  protected createTilemap = createTilemap;
  protected setupPlayer = setupPlayer;
  protected setupCamera = setupCamera;
  removeTreesInRange = removeTreesInRange;
  protected setupBuilding = setupBuilding;
  protected teardownBuilding = teardownBuilding;
  protected handleBuildStart = handleBuildStart;
  protected handleBuildCancel = handleBuildCancel;
  protected handleBuildPointerMove = handleBuildPointerMove;
  protected handleBuildPointerDown = handleBuildPointerDown;
  protected emitBuildState = emitBuildState;

  preload() {
    this.preloadWorld();
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  create() {
    this.textures.get(TREE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get(TILE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get(TOOL_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.createTilemap();
    this.setupPlayer();
    this.setupCamera();
    this.setupBuilding();
  }

  update() {
    this.player.update();
  }
}
