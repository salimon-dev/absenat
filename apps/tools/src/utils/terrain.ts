import { Terrain, type TerrainPalette } from './types.ts';

export const terrainPalettes: TerrainPalette[] = [
  { terrain: Terrain.Grass, base: '#4f9f38', detail: '#6fbd4b' },
  { terrain: Terrain.Water, base: '#2f78c4', detail: '#58a7df' },
  { terrain: Terrain.Dirt, base: '#8a5b32', detail: '#a87643' },
  { terrain: Terrain.Sand, base: '#d7b765', detail: '#efd88a' },
  { terrain: Terrain.Ice, base: '#8fd2e8', detail: '#c4f0f5' },
  { terrain: Terrain.Snow, base: '#dfeff2', detail: '#ffffff' },
];
