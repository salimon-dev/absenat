import { describe, expect, it } from 'vitest';
import type { PlayerConfig } from '@absenat/specs';
import { createSurvivalPenaltyTimers, drainStats } from './stats';

describe('drainStats', () => {
  it('applies stacked health penalties after one minute at zero survival stats', () => {
    const config = createPlayerConfig({
      fatigue: 0,
      health: 10,
      hunger: 0,
      thirst: 0
    });
    const timers = createSurvivalPenaltyTimers();

    drainStats(config, 60, timers);

    expect(config.health.current).toBe(7.5);
  });

  it('resets a survival penalty timer when the stat recovers', () => {
    const config = createPlayerConfig({
      fatigue: 50,
      health: 10,
      hunger: 20,
      thirst: 0
    });
    const timers = createSurvivalPenaltyTimers();

    drainStats(config, 30, timers);
    config.thirst.current = 10;
    drainStats(config, 1, timers);
    config.thirst.current = 0;
    drainStats(config, 30, timers);

    expect(config.health.current).toBe(10);
  });

  it('clamps health at zero when the penalty would overkill the player', () => {
    const config = createPlayerConfig({
      fatigue: 0,
      health: 2,
      hunger: 0,
      thirst: 0
    });
    const timers = createSurvivalPenaltyTimers();

    const isDead = drainStats(config, 60, timers);

    expect(isDead).toBe(true);
    expect(config.health.current).toBe(0);
  });
});

interface PlayerConfigOverrides {
  fatigue?: number;
  health?: number;
  hunger?: number;
  thirst?: number;
}

function createPlayerConfig(overrides: PlayerConfigOverrides): PlayerConfig {
  return {
    position: { x: 0, y: 0 },
    speed: 2,
    attackSpeed: 1,
    inventorySlots: 16,
    health: { current: overrides.health ?? 100, total: 100, drainRate: 0 },
    thirst: { current: overrides.thirst ?? 50, total: 100, drainRate: 0 },
    hunger: { current: overrides.hunger ?? 50, total: 100, drainRate: 0 },
    fatigue: { current: overrides.fatigue ?? 50, total: 100, drainRate: 0 }
  };
}
