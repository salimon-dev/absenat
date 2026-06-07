export const MAP_GEN_CONFIG = {
  island: {
    waterBodies: {
      countMin: 6,
      countMax: 8,
      sizeMin: 2,
      sizeMax: 6
    },
    dirtBodies: {
      countMin: 2,
      countMax: 4,
      sizeMin: 3,
      sizeMax: 8
    }
  },
  tree: {
    spawnChance: 0.05
  },
  resources: {
    mushrooms: {
      spawnChance: 0.012
    },
    ore: {
      stone: { spawnChance: 0.01 },
      iron: { spawnChance: 0.006 },
      copper: { spawnChance: 0.006 },
      gold: { spawnChance: 0.002 }
    },
    blueBerries: {
      spawnChance: 0.01
    },
    wheat: {
      spawnChance: 0.008
    },
    watermelon: {
      spawnChance: 0.004
    },
    pumpkin: {
      spawnChance: 0.004
    }
  },
  water: {
    borderMin: 1,
    borderMax: 3
  }
};
