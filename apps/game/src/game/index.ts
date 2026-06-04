import { Game, AUTO } from 'phaser';
import { World } from './world';
import type { CreateGameOptions } from './save/types';

export function createGame(parent: HTMLElement, options: CreateGameOptions = {}): Game {
  return new Game({
    type: AUTO,
    width: '100%',
    height: '100%',
    parent,
    scene: [new World(options.initialSave)],
    backgroundColor: '#000',
    pixelArt: true,
    render: {
      antialias: false,
      roundPixels: true,
    },
  });
}
