import type { PlayerStat } from '@absenat/specs';
import type { ItemName } from '../../utils/items';
import type { ToolName } from '../../utils/tools';

export enum InventoryEvent {
  Add = 'inventory-add',
  Move = 'inventory-move',
  QuickSlotAssign = 'inventory-quick-slot-assign',
  QuickSlotMove = 'inventory-quick-slot-move',
  QuickSlotsRequest = 'inventory-quick-slots-request',
  QuickSlotsSelectSet = 'inventory-quick-slots-select-set',
  QuickSlotsUpdate = 'inventory-quick-slots-update',
  Remove = 'inventory-remove',
  Request = 'inventory-request',
  Update = 'inventory-update'
}

export type InventoryEventType = InventoryEvent;

export enum PlayerEvent {
  LifeStateChange = 'player-life-state',
  RespawnRequest = 'player-respawn-request',
  StatsUpdate = 'stats-update'
}

export type PlayerEventType = PlayerEvent;

export enum PlayerLifeState {
  Alive = 'alive',
  Dead = 'dead'
}

export type PlayerLifeStateType = PlayerLifeState;

export interface PlayerLifeStatePayload {
  state: PlayerLifeStateType;
}

export interface PlayerStatsSnapshot {
  health: PlayerStat;
  thirst: PlayerStat;
  hunger: PlayerStat;
  fatigue: PlayerStat;
}

export interface InventoryItem {
  name: ItemName;
  count?: number;
  durability?: number;
  range?: number;
}

export interface InventorySlot {
  item?: InventoryItem;
}

export interface InventorySnapshot {
  slots: InventorySlot[];
  slotCount: number;
}

export interface RemoveInventoryItemPayload {
  name: ItemName;
  count?: number;
}

export interface InventorySlotPosition {
  slotIndex: number;
}

export interface InventorySlotMovePayload {
  source: InventorySlotPosition;
  target: InventorySlotPosition;
}

export interface QuickSlot {
  key: string;
  itemName?: ToolName;
}

export interface QuickSlotSet {
  id: number;
  slots: QuickSlot[];
}

export interface QuickSlotsSnapshot {
  selectedSetId: number;
  sets: QuickSlotSet[];
}

export interface QuickSlotAssignmentPayload {
  itemName?: ToolName;
  setId: number;
  slotIndex: number;
}

export interface QuickSlotPosition {
  setId: number;
  slotIndex: number;
}

export interface QuickSlotMovePayload {
  source: QuickSlotPosition;
  target: QuickSlotPosition;
}

export interface InventoryCountByName {
  name: ItemName;
  count: number;
}
