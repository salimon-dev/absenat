import type { Game } from 'phaser';

declare global {
  interface Window {
    __ABSENAT_GAME__?: Game;
  }
}

export function attachDebugGame(game: Game): void {
  if (!import.meta.env.DEV) return;
  window.__ABSENAT_GAME__ = game;
}

export function detachDebugGame(game: Game): void {
  if (!import.meta.env.DEV) return;
  if (window.__ABSENAT_GAME__ !== game) return;
  delete window.__ABSENAT_GAME__;
}
