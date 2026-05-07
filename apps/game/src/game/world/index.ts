import * as Phaser from 'phaser';
import Player from '../player';
import { createTilemap, preloadWorld, setupCamera, setupPlayer } from './setup-world';
import { EntitySprite } from '../entities/entity';

export class World extends Phaser.Scene {
  player!: Player;
  mapData: number[][] = [];
  tilemap!: Phaser.Tilemaps.Tilemap;
  nonWalkableIds: Set<number> = new Set();
  entities: EntitySprite[] = [];

  constructor() {
    super('world');
  }

  protected preloadWorld = preloadWorld;
  protected createTilemap = createTilemap;
  protected setupPlayer = setupPlayer;
  protected setupCamera = setupCamera;

  preload() {
    this.preloadWorld();
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  create() {
    this.textures.get('tiles').setFilter(Phaser.Textures.FilterMode.NEAREST);

    this.createTilemap();
    this.setupPlayer();
    this.setupCamera();
  }

  update() {
    this.player.update();
  }
}
