import * as Phaser from 'phaser';
import Player from '../player';
import Structure from '../entities/structure/structure';
import { createTilemap, preloadWorld, setupCamera, setupPlayer } from './setup-world';
import { TREE_TEXTURE_KEY } from '../entities/tree';
import Tree from '../entities/tree';
import { TILE_TEXTURE_KEY } from '../entities/tile/tile';
import Tile from '../entities/tile/tile';
import { TOOL_TEXTURE_KEY } from '../entities/tool';
import {
  cancelBuildPlacement,
  destroyBuildingEvents,
  handleBuildPointerDown,
  handleBuildPointerMove,
  registerBuildingEvents,
  startBuildPlacement
} from './building';
import type { ActiveBuildPlacementState } from './building';
import { removeTreesInRange } from './remove-trees-in-range';

export class World extends Phaser.Scene {
  activeBuildPlacement?: ActiveBuildPlacementState;
  buildPlacementPreview?: Phaser.GameObjects.Rectangle;
  buildPlacementPrompt?: Phaser.GameObjects.Text;
  player!: Player;
  tiles: Tile[] = [];
  entities: Tree[] = [];
  structures: Structure[] = [];

  constructor() {
    super('world');
  }

  protected preloadWorld = preloadWorld;
  protected createTilemap = createTilemap;
  protected setupPlayer = setupPlayer;
  protected setupCamera = setupCamera;
  protected registerBuildingEvents = registerBuildingEvents;
  protected destroyBuildingEvents = destroyBuildingEvents;
  protected startBuildPlacement = startBuildPlacement;
  protected cancelBuildPlacement = cancelBuildPlacement;
  protected handleBuildPointerMove = handleBuildPointerMove;
  protected handleBuildPointerDown = handleBuildPointerDown;
  removeTreesInRange = removeTreesInRange;

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
    this.registerBuildingEvents();
  }

  update() {
    this.player.update();
  }
}
