import { Biome } from '@absenat/specs';
import { describe, expect, it } from 'vitest';
import { BuildableType } from '../building/types';
import type Player from '../player';
import { PlayerLifeState, type PlayerSnapshot } from '../player/types';
import type { World } from '../world';
import { WorldEntityKind } from '../world/types';
import { ResourceType } from '../../utils/resources';
import { ToolType } from '../../utils/tools';
import { createGameSave } from './snapshot';
import { ACTIVE_SAVE_ID, SAVE_SCHEMA_VERSION } from './types';

describe('createGameSave', () => {
  it('serializes world, player, inventory, quick slots, and structures', () => {
    const save = createGameSave(createWorld(), 1234);

    expect(save.id).toBe(ACTIVE_SAVE_ID);
    expect(save.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(save.updatedAt).toBe(1234);
    expect(save.world.tiles[0][0]).toEqual({ biome: Biome.Grass, variant: 2 });
    expect(save.world.entities[0]).toEqual({
      hp: 4,
      kind: WorldEntityKind.Tree,
      variant: 1,
      x: 32,
      y: 48
    });
    expect(save.world.structures[0]).toEqual({
      buildable: BuildableType.SmallChest,
      x: 16,
      y: 32
    });
    expect(save.player.inventory.slots[0].item?.name).toBe(ResourceType.Wood);
    expect(save.player.quickSlots.selectedSetId).toBe(2);
  });
});

function createWorld(): World {
  return {
    entities: [{ hp: 4, variant: 1, x: 32, y: 48 }],
    getTilePlacements: () => [[{ biome: Biome.Grass, variant: 2 }]],
    player: createPlayer(),
    structures: [{ buildable: BuildableType.SmallChest, x: 16, y: 32 }]
  } as unknown as World;
}

function createPlayer(): Player {
  return {
    getSnapshot: (): PlayerSnapshot => ({
      config: {
        attackSpeed: 1,
        fatigue: { current: 80, drainRate: 0.02, total: 100 },
        health: { current: 100, drainRate: 0, total: 100 },
        hunger: { current: 70, drainRate: 0.07, total: 100 },
        inventorySlots: 16,
        position: { x: 12, y: 34 },
        speed: 2,
        thirst: { current: 65, drainRate: 0.1, total: 100 }
      },
      inventory: {
        slotCount: 16,
        slots: [{ item: { count: 3, name: ResourceType.Wood } }]
      },
      lastDirection: 'down',
      lifeState: PlayerLifeState.Alive,
      quickSlots: {
        selectedSetId: 2,
        sets: [{ id: 2, slots: [{ itemName: ToolType.Axe, key: 'q' }] }]
      },
      spawnState: {
        position: { x: 12, y: 34 },
        stats: {
          fatigue: { current: 80, drainRate: 0.02, total: 100 },
          health: { current: 100, drainRate: 0, total: 100 },
          hunger: { current: 70, drainRate: 0.07, total: 100 },
          thirst: { current: 65, drainRate: 0.1, total: 100 }
        }
      }
    })
  } as unknown as Player;
}
