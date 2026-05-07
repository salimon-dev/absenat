export interface PlayerStat {
  current: number;
  total: number;
  drainRate: number;
}

export interface PlayerConfig {
  position: {
    x: number;
    y: number;
  };
  speed: number;
  health: PlayerStat;
  thirst: PlayerStat;
  hunger: PlayerStat;
  fatigue: PlayerStat;
}
