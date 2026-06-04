import type { PlayerConfig, PlayerStat } from '@absenat/specs';
import type { PlayerStatsSnapshot } from './types';

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface PlayerSpawnState {
  position: PlayerPosition;
  stats: PlayerStatsSnapshot;
}

export function createPlayerSpawnState(config: PlayerConfig): PlayerSpawnState {
  return {
    position: { ...config.position },
    stats: {
      health: clonePlayerStat(config.health),
      thirst: clonePlayerStat(config.thirst),
      hunger: clonePlayerStat(config.hunger),
      fatigue: clonePlayerStat(config.fatigue)
    }
  };
}

export function resetPlayerConfig(config: PlayerConfig, spawnState: PlayerSpawnState): void {
  config.position = { ...spawnState.position };
  restorePlayerStat(config.health, spawnState.stats.health);
  restorePlayerStat(config.thirst, spawnState.stats.thirst);
  restorePlayerStat(config.hunger, spawnState.stats.hunger);
  restorePlayerStat(config.fatigue, spawnState.stats.fatigue);
}

function clonePlayerStat(stat: PlayerStat): PlayerStat {
  return {
    current: stat.current,
    total: stat.total,
    drainRate: stat.drainRate
  };
}

function restorePlayerStat(target: PlayerStat, source: PlayerStat): void {
  target.current = source.current;
  target.total = source.total;
  target.drainRate = source.drainRate;
}
