import type { PlayerConfig } from '@absenat/specs';

export function drainStats(config: PlayerConfig): void {
  const stats = [config.thirst, config.hunger, config.fatigue, config.health] as const;
  for (const stat of stats) {
    if (!stat) continue;
    stat.current = Math.max(0, stat.current - stat.drainRate);
  }
}
