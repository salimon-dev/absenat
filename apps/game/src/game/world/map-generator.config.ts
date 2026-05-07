export const MAP_GEN_CONFIG = {
  tree: {
    spawnChance: 0.05
  },
  ore: {
    iron: {
      spawnChance: 0.01
    },
    copper: {
      spawnChance: 0.005
    },
    gold: {
      spawnChance: 0.001
    }
  },
  water: {
    border: 3,
    patchCountMin: 1,
    patchCountMax: 5,
    budget: 199,
    maxRadius: 8
  },
  road: {
    margin: 8, // relative to water border (water.border + 5)
    innerMargin: 5, // relative to water border (water.border + 2)
    crossCountMin: 1,
    crossCountMax: 3,
    turnCountMin: 1,
    turnCountMax: 3,
    halfLengthMin: 5,
    halfLengthMax: 15,
    bodyWidth: [0, 1]
  }
};
