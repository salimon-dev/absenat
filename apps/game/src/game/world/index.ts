import * as Phaser from 'phaser';
import Player from '../player';
import { createTilemap, getTilePlacements, preloadWorld, restoreSavedStructures, setupCamera, setupPlayer } from './setup-world';
import { TREE_TEXTURE_KEY } from '../entities/tree';
import Tree from '../entities/tree';
import { TILE_TEXTURE_KEY } from '../entities/tile/tile';
import Tile from '../entities/tile/tile';
import { TOOL_TEXTURE_KEY } from '../entities/tool';
import { removeTreesInRange } from './remove-trees-in-range';
import type BuildingObject from '../building/building-object';
import type { BuildableName } from '../building/types';
import type { GameSaveData } from '../save/types';
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
  initialSave?: GameSaveData;
  player!: Player;
  tiles: Tile[] = [];
  entities: Tree[] = [];
  structures: BuildingObject[] = [];
  activeBuild?: BuildableName;
  buildPreview?: BuildingObject;
  buildHint!: Phaser.GameObjects.Text;

  constructor(initialSave?: GameSaveData) {
    super('world');
    this.initialSave = initialSave;
  }

  protected preloadWorld = preloadWorld;
  protected createTilemap = createTilemap;
  getTilePlacements = getTilePlacements;
  protected setupPlayer = setupPlayer;
  protected setupCamera = setupCamera;
  protected restoreSavedStructures = restoreSavedStructures;
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
    this.restoreSavedStructures();
  }

  update() {
    this.player.update();
  }
}
