import { Game, AUTO } from 'phaser';
import { World } from './world';

export function createGame(parent: HTMLElement): Game {
  return new Game({
    type: AUTO,
    width: '100%',
    height: '100%',
    parent,
    scene: [World],
    backgroundColor: '#000',
    pixelArt: true,
    render: {
      antialias: false,
      roundPixels: true,
    },
  });
}
