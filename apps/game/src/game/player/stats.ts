import type { PlayerConfig, PlayerStat } from '@absenat/specs';

const SECONDS_PER_MINUTE = 60;
const HUNGER_HEALTH_PENALTY = 1;
const THIRST_HEALTH_PENALTY = 1;
const FATIGUE_HEALTH_PENALTY = 0.5;

export interface SurvivalPenaltyTimers {
  fatigue: number;
  hunger: number;
  thirst: number;
}

export function createSurvivalPenaltyTimers(): SurvivalPenaltyTimers {
  return {
    fatigue: 0,
    hunger: 0,
    thirst: 0
  };
}

export function resetSurvivalPenaltyTimers(timers: SurvivalPenaltyTimers): void {
  timers.fatigue = 0;
  timers.hunger = 0;
  timers.thirst = 0;
}

export function drainStats(
  config: PlayerConfig,
  elapsedSeconds: number,
  timers: SurvivalPenaltyTimers
): boolean {
  drainBaseStats(config, elapsedSeconds);
  const healthPenalty = getHealthPenalty(config, elapsedSeconds, timers);
  if (healthPenalty > 0) {
    drainStat(config.health, healthPenalty);
  }
  return config.health.current <= 0;
}

function drainBaseStats(config: PlayerConfig, elapsedSeconds: number): void {
  drainStat(config.thirst, config.thirst.drainRate * elapsedSeconds);
  drainStat(config.hunger, config.hunger.drainRate * elapsedSeconds);
  drainStat(config.fatigue, config.fatigue.drainRate * elapsedSeconds);
  drainStat(config.health, config.health.drainRate * elapsedSeconds);
}

function getHealthPenalty(
  config: PlayerConfig,
  elapsedSeconds: number,
  timers: SurvivalPenaltyTimers
): number {
  return (
    accumulatePenalty(config.hunger, elapsedSeconds, HUNGER_HEALTH_PENALTY, 'hunger', timers) +
    accumulatePenalty(config.thirst, elapsedSeconds, THIRST_HEALTH_PENALTY, 'thirst', timers) +
    accumulatePenalty(config.fatigue, elapsedSeconds, FATIGUE_HEALTH_PENALTY, 'fatigue', timers)
  );
}

function accumulatePenalty(
  stat: PlayerStat,
  elapsedSeconds: number,
  penaltyPerMinute: number,
  timerKey: keyof SurvivalPenaltyTimers,
  timers: SurvivalPenaltyTimers
): number {
  if (stat.current > 0) {
    timers[timerKey] = 0;
    return 0;
  }

  timers[timerKey] += elapsedSeconds;
  const elapsedMinutes = Math.floor(timers[timerKey] / SECONDS_PER_MINUTE);
  timers[timerKey] -= elapsedMinutes * SECONDS_PER_MINUTE;
  return elapsedMinutes * penaltyPerMinute;
}

function drainStat(stat: PlayerStat, amount: number): void {
  stat.current = clampStatValue(stat, stat.current - amount);
}

function clampStatValue(stat: PlayerStat, nextValue: number): number {
  return Math.min(stat.total, Math.max(0, nextValue));
}
