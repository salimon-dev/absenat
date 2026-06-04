import type { PlayerConfig, PlayerStat } from '@absenat/specs';
import type Player from '../player';
import type { PlayerSpawnState } from '../player/state';
import type { InventorySlot, QuickSlotSet } from '../player/types';
import { ACTIVE_SAVE_ID, SAVE_SCHEMA_VERSION } from './types';
import type { GameSaveData, SaveStructureSnapshot, SaveWorldSnapshot } from './types';
import type { World } from '../world';
import { WorldEntityKind } from '../world/types';

export function createGameSave(world: World, updatedAt = Date.now()): GameSaveData {
  return {
    id: ACTIVE_SAVE_ID,
    schemaVersion: SAVE_SCHEMA_VERSION,
    updatedAt,
    player: createPlayerSnapshot(world.player),
    world: createWorldSnapshot(world)
  };
}

export function createWorldSnapshot(world: World): SaveWorldSnapshot {
  return {
    tiles: world.getTilePlacements(),
    entities: world.entities.map(entity => ({
      kind: WorldEntityKind.Tree,
      x: entity.x,
      y: entity.y,
      variant: entity.variant,
      hp: entity.hp
    })),
    structures: world.structures.map(createStructureSnapshot)
  };
}

function createPlayerSnapshot(player: Player): GameSaveData['player'] {
  const snapshot = player.getSnapshot();
  return {
    attackSpeed: snapshot.config.attackSpeed,
    config: clonePlayerConfig(snapshot.config),
    inventory: {
      slotCount: snapshot.inventory.slotCount,
      slots: snapshot.inventory.slots.map(cloneInventorySlot)
    },
    lastDirection: snapshot.lastDirection,
    lifeState: snapshot.lifeState,
    quickSlots: {
      selectedSetId: snapshot.quickSlots.selectedSetId,
      sets: snapshot.quickSlots.sets.map(cloneQuickSlotSet)
    },
    spawnState: cloneSpawnState(snapshot.spawnState),
    speed: snapshot.config.speed
  };
}

function createStructureSnapshot(structure: World['structures'][number]): SaveStructureSnapshot {
  return {
    buildable: structure.buildable,
    x: structure.x,
    y: structure.y
  };
}

function clonePlayerConfig(config: PlayerConfig): PlayerConfig {
  return {
    position: { ...config.position },
    speed: config.speed,
    attackSpeed: config.attackSpeed,
    inventorySlots: config.inventorySlots,
    health: clonePlayerStat(config.health),
    thirst: clonePlayerStat(config.thirst),
    hunger: clonePlayerStat(config.hunger),
    fatigue: clonePlayerStat(config.fatigue)
  };
}

function cloneSpawnState(spawnState: PlayerSpawnState): PlayerSpawnState {
  return {
    position: { ...spawnState.position },
    stats: {
      health: clonePlayerStat(spawnState.stats.health),
      thirst: clonePlayerStat(spawnState.stats.thirst),
      hunger: clonePlayerStat(spawnState.stats.hunger),
      fatigue: clonePlayerStat(spawnState.stats.fatigue)
    }
  };
}

function clonePlayerStat(stat: PlayerStat): PlayerStat {
  return {
    current: stat.current,
    total: stat.total,
    drainRate: stat.drainRate
  };
}

function cloneInventorySlot(slot: InventorySlot): InventorySlot {
  return slot.item ? { item: { ...slot.item } } : {};
}

function cloneQuickSlotSet(set: QuickSlotSet): QuickSlotSet {
  return {
    id: set.id,
    slots: set.slots.map(slot => ({ ...slot }))
  };
}
