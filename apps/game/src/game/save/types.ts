import type { PlayerConfig } from '@absenat/specs';
import type { BuildableName } from '../building/types';
import type { TilePlacement } from '../entities/types';
import type { EntityPlacement } from '../world/types';
import type { InventorySnapshot, PlayerLifeStateType, QuickSlotsSnapshot } from '../player/types';
import type { PlayerSpawnState } from '../player/state';
import type { DirectionType } from '../player/movement';

export const SAVE_SCHEMA_VERSION = 1;
export const ACTIVE_SAVE_ID = 'active';

export enum GameStartMode {
  Continue = 'continue',
  NewGame = 'new-game'
}

export type GameStartModeType = GameStartMode;

export interface GameStartRequest {
  mode: GameStartModeType;
}

export interface SaveEntitySnapshot extends EntityPlacement {
  hp?: number;
}

export interface SaveStructureSnapshot {
  buildable: BuildableName;
  x: number;
  y: number;
}

export interface SavePlayerSnapshot {
  attackSpeed: number;
  config: PlayerConfig;
  inventory: InventorySnapshot;
  lastDirection: DirectionType;
  lifeState: PlayerLifeStateType;
  quickSlots: QuickSlotsSnapshot;
  spawnState: PlayerSpawnState;
  speed: number;
}

export interface SaveWorldSnapshot {
  entities: SaveEntitySnapshot[];
  structures: SaveStructureSnapshot[];
  tiles: TilePlacement[][];
}

export interface GameSaveData {
  id: typeof ACTIVE_SAVE_ID;
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  updatedAt: number;
  player: SavePlayerSnapshot;
  world: SaveWorldSnapshot;
}

export interface CreateGameOptions {
  initialSave?: GameSaveData;
}
