import * as Phaser from 'phaser';
import { ToolType, type ToolName } from '../../utils/tools';
import {
  InventoryEvent,
  type InventoryItem,
  type QuickSlotAssignmentPayload,
  type QuickSlotSet,
  type QuickSlotsSnapshot,
  type RemoveInventoryItemPayload
} from './types';

export default class InventoryManager {
  private items: InventoryItem[];
  private quickSlotSets: QuickSlotSet[];
  private selectedQuickSlotSetId = 1;
  private events: Phaser.Events.EventEmitter;

  constructor(
    events: Phaser.Events.EventEmitter,
    items = createInitialInventory(),
    quickSlotSets = createInitialQuickSlotSets()
  ) {
    this.events = events;
    this.items = cloneInventory(items);
    this.quickSlotSets = cloneQuickSlotSets(quickSlotSets);
    this.registerEvents();
  }

  addItem(item: InventoryItem): void {
    const existing = this.items.find(({ name }) => name === item.name);
    if (!existing) this.items.push(cloneItem(item));
    if (existing) mergeInventoryItem(existing, item);
    this.emitUpdate();
  }

  removeItem(name: ToolName, count = 1): void {
    const item = this.items.find(current => current.name === name);
    if (!item) return;
    item.count = Math.max((item.count ?? 1) - count, 0);
    if (item.count === 0) this.clearQuickSlotsForItem(name);
    this.items = this.items.filter(current => (current.count ?? 1) > 0);
    this.emitUpdate();
  }

  assignQuickSlot(payload: QuickSlotAssignmentPayload): void {
    const slot = this.getQuickSlot(payload.setId, payload.slotIndex);
    if (!slot) return;
    slot.itemName = payload.itemName;
    this.emitQuickSlotsUpdate();
  }

  getSnapshot(): InventoryItem[] {
    return cloneInventory(this.items);
  }

  getQuickSlotsSnapshot(): QuickSlotsSnapshot {
    return {
      selectedSetId: this.selectedQuickSlotSetId,
      sets: cloneQuickSlotSets(this.quickSlotSets)
    };
  }

  emitUpdate(): void {
    this.events.emit(InventoryEvent.Update, this.getSnapshot());
    this.emitQuickSlotsUpdate();
  }

  emitQuickSlotsUpdate(): void {
    this.events.emit(InventoryEvent.QuickSlotsUpdate, this.getQuickSlotsSnapshot());
  }

  destroy(): void {
    this.events.off(InventoryEvent.Request, this.handleRequest);
    this.events.off(InventoryEvent.Add, this.handleAdd);
    this.events.off(InventoryEvent.Remove, this.handleRemove);
    this.events.off(InventoryEvent.QuickSlotAssign, this.handleQuickSlotAssign);
    this.events.off(InventoryEvent.QuickSlotsRequest, this.handleQuickSlotsRequest);
    this.events.off(InventoryEvent.QuickSlotsSelectSet, this.handleQuickSlotsSelectSet);
  }

  private registerEvents(): void {
    this.events.on(InventoryEvent.Request, this.handleRequest);
    this.events.on(InventoryEvent.Add, this.handleAdd);
    this.events.on(InventoryEvent.Remove, this.handleRemove);
    this.events.on(InventoryEvent.QuickSlotAssign, this.handleQuickSlotAssign);
    this.events.on(InventoryEvent.QuickSlotsRequest, this.handleQuickSlotsRequest);
    this.events.on(InventoryEvent.QuickSlotsSelectSet, this.handleQuickSlotsSelectSet);
  }

  private handleRequest = (): void => {
    this.emitUpdate();
  };

  private handleAdd = (item: InventoryItem): void => {
    this.addItem(item);
  };

  private handleRemove = (payload: RemoveInventoryItemPayload): void => {
    this.removeItem(payload.name, payload.count);
  };

  private handleQuickSlotAssign = (payload: QuickSlotAssignmentPayload): void => {
    this.assignQuickSlot(payload);
  };

  private handleQuickSlotsRequest = (): void => {
    this.emitQuickSlotsUpdate();
  };

  private handleQuickSlotsSelectSet = (setId: number): void => {
    if (!this.quickSlotSets.some(({ id }) => id === setId)) return;
    this.selectedQuickSlotSetId = setId;
    this.emitQuickSlotsUpdate();
  };

  private getQuickSlot(setId: number, slotIndex: number) {
    return this.quickSlotSets.find(({ id }) => id === setId)?.slots[slotIndex];
  }

  private clearQuickSlotsForItem(itemName: ToolName): void {
    this.quickSlotSets.forEach(set => clearQuickSlotSetItem(set, itemName));
  }
}

function cloneInventory(items: InventoryItem[]): InventoryItem[] {
  return items.map(cloneItem);
}

function cloneItem(item: InventoryItem): InventoryItem {
  return { ...item };
}

function cloneQuickSlotSets(sets: QuickSlotSet[]): QuickSlotSet[] {
  return sets.map(set => ({ id: set.id, slots: set.slots.map(slot => ({ ...slot })) }));
}

function clearQuickSlotSetItem(set: QuickSlotSet, itemName: ToolName): void {
  set.slots.forEach(slot => {
    if (slot.itemName === itemName) slot.itemName = undefined;
  });
}

function mergeInventoryItem(target: InventoryItem, source: InventoryItem): void {
  target.count = (target.count ?? 1) + (source.count ?? 1);
  target.durability = source.durability ?? target.durability;
}

function createInitialInventory(): InventoryItem[] {
  return [
    createToolInventoryItem(ToolType.Axe),
    createToolInventoryItem(ToolType.Sword),
    createToolInventoryItem(ToolType.Pickaxe),
    createToolInventoryItem(ToolType.Hammer)
  ];
}

function createToolInventoryItem(name: ToolName): InventoryItem {
  return { name, count: 1, durability: 1 };
}

function createInitialQuickSlotSets(): QuickSlotSet[] {
  return [
    createQuickSlotSet(1, [ToolType.Sword, ToolType.Axe, ToolType.Pickaxe, ToolType.Hammer]),
    createQuickSlotSet(2, []),
    createQuickSlotSet(3, []),
    createQuickSlotSet(4, [])
  ];
}

function createQuickSlotSet(id: number, itemNames: ToolName[]): QuickSlotSet {
  return {
    id,
    slots: ['q', 'w', 'e', 'r'].map((key, index) => ({ key, itemName: itemNames[index] }))
  };
}
