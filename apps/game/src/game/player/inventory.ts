import * as Phaser from 'phaser';
import type { ItemName } from '../../utils/items';
import { TOOL_DEFINITIONS, ToolType, type ToolName } from '../../utils/tools';
import {
  InventoryEvent,
  type InventoryItem,
  type InventorySlotMovePayload,
  type InventorySlot,
  type InventorySnapshot,
  type QuickSlotAssignmentPayload,
  type QuickSlotMovePayload,
  type QuickSlotSet,
  type QuickSlotsSnapshot,
  type RemoveInventoryItemPayload
} from './types';

export default class InventoryManager {
  private slots: InventorySlot[];
  private slotCount: number;
  private quickSlotSets: QuickSlotSet[];
  private selectedQuickSlotSetId = 1;
  private events: Phaser.Events.EventEmitter;

  constructor(
    events: Phaser.Events.EventEmitter,
    slotCount: number,
    items = createInitialInventory(),
    quickSlotSets = createInitialQuickSlotSets()
  ) {
    this.events = events;
    this.slotCount = slotCount;
    this.slots = createInventorySlots(slotCount, items);
    this.quickSlotSets = cloneQuickSlotSets(quickSlotSets);
    this.registerEvents();
  }

  addItem(item: InventoryItem): void {
    const existing = this.slots.find(({ item: current }) => current?.name === item.name)?.item;
    if (!existing && !this.addItemToEmptySlot(item)) return;
    if (existing) mergeInventoryItem(existing, item);
    this.emitUpdate();
  }

  moveItem(payload: InventorySlotMovePayload): void {
    if (!isValidItemMove(payload, this.slotCount)) return;
    swapInventorySlots(this.slots, payload.source.slotIndex, payload.target.slotIndex);
    this.emitUpdate();
  }

  removeItem(name: ItemName, count = 1): void {
    const slot = this.slots.find(current => current.item?.name === name);
    const item = slot?.item;
    if (!item) return;
    item.count = Math.max((item.count ?? 1) - count, 0);
    if (item.count === 0) this.clearQuickSlotsForItem(name);
    if (item.count === 0 && slot) slot.item = undefined;
    this.emitUpdate();
  }

  getItemCount(name: ItemName): number {
    return this.slots.find(current => current.item?.name === name)?.item?.count ?? 0;
  }

  assignQuickSlot(payload: QuickSlotAssignmentPayload): void {
    const slot = this.getQuickSlot(payload.setId, payload.slotIndex);
    if (!slot) return;
    slot.itemName = payload.itemName;
    this.emitQuickSlotsUpdate();
  }

  moveQuickSlot(payload: QuickSlotMovePayload): void {
    const source = this.getQuickSlot(payload.source.setId, payload.source.slotIndex);
    const target = this.getQuickSlot(payload.target.setId, payload.target.slotIndex);
    if (!source || !target || source === target) return;
    swapQuickSlotItems(source, target);
    this.emitQuickSlotsUpdate();
  }

  getSelectedQuickSlotItemName(key: string): ToolName | undefined {
    const slot = this.getSelectedQuickSlot()?.slots.find(current => current.key === key);
    return slot?.itemName;
  }

  getSnapshot(): InventorySnapshot {
    return {
      slots: cloneInventorySlots(this.slots),
      slotCount: this.slotCount
    };
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
    this.events.off(InventoryEvent.Move, this.handleMove);
    this.events.off(InventoryEvent.Remove, this.handleRemove);
    this.events.off(InventoryEvent.QuickSlotAssign, this.handleQuickSlotAssign);
    this.events.off(InventoryEvent.QuickSlotMove, this.handleQuickSlotMove);
    this.events.off(InventoryEvent.QuickSlotsRequest, this.handleQuickSlotsRequest);
    this.events.off(InventoryEvent.QuickSlotsSelectSet, this.handleQuickSlotsSelectSet);
  }

  private registerEvents(): void {
    this.events.on(InventoryEvent.Request, this.handleRequest);
    this.events.on(InventoryEvent.Add, this.handleAdd);
    this.events.on(InventoryEvent.Move, this.handleMove);
    this.events.on(InventoryEvent.Remove, this.handleRemove);
    this.events.on(InventoryEvent.QuickSlotAssign, this.handleQuickSlotAssign);
    this.events.on(InventoryEvent.QuickSlotMove, this.handleQuickSlotMove);
    this.events.on(InventoryEvent.QuickSlotsRequest, this.handleQuickSlotsRequest);
    this.events.on(InventoryEvent.QuickSlotsSelectSet, this.handleQuickSlotsSelectSet);
  }

  private handleRequest = (): void => {
    this.emitUpdate();
  };

  private handleAdd = (item: InventoryItem): void => {
    this.addItem(item);
  };

  private handleMove = (payload: InventorySlotMovePayload): void => {
    this.moveItem(payload);
  };

  private handleRemove = (payload: RemoveInventoryItemPayload): void => {
    this.removeItem(payload.name, payload.count);
  };

  private handleQuickSlotAssign = (payload: QuickSlotAssignmentPayload): void => {
    this.assignQuickSlot(payload);
  };

  private handleQuickSlotMove = (payload: QuickSlotMovePayload): void => {
    this.moveQuickSlot(payload);
  };

  private handleQuickSlotsRequest = (): void => {
    this.emitQuickSlotsUpdate();
  };

  private handleQuickSlotsSelectSet = (setId: number): void => {
    if (!this.quickSlotSets.some(({ id }) => id === setId)) return;
    this.selectedQuickSlotSetId = setId;
    this.emitQuickSlotsUpdate();
  };

  private getSelectedQuickSlot(): QuickSlotSet | undefined {
    return this.quickSlotSets.find(({ id }) => id === this.selectedQuickSlotSetId);
  }

  private getQuickSlot(setId: number, slotIndex: number) {
    return this.quickSlotSets.find(({ id }) => id === setId)?.slots[slotIndex];
  }

  private addItemToEmptySlot(item: InventoryItem): boolean {
    const slot = this.slots.find(current => !current.item);
    if (!slot) return false;
    slot.item = cloneItem(item);
    return true;
  }

  private clearQuickSlotsForItem(itemName: ItemName): void {
    this.quickSlotSets.forEach(set => clearQuickSlotSetItem(set, itemName));
  }
}

function createInventorySlots(slotCount: number, items: InventoryItem[]): InventorySlot[] {
  return Array.from({ length: slotCount }, (_, index) => {
    const item = items[index];
    return item ? { item: cloneItem(item) } : {};
  });
}

function cloneInventorySlots(slots: InventorySlot[]): InventorySlot[] {
  return slots.map(slot => (slot.item ? { item: cloneItem(slot.item) } : {}));
}

function cloneItem(item: InventoryItem): InventoryItem {
  return { ...item };
}

function isValidItemMove(payload: InventorySlotMovePayload, slotCount: number): boolean {
  const { source, target } = payload;
  if (source.slotIndex === target.slotIndex) return false;
  if (source.slotIndex < 0 || source.slotIndex >= slotCount) return false;
  if (target.slotIndex < 0 || target.slotIndex >= slotCount) return false;
  return true;
}

function swapInventorySlots(slots: InventorySlot[], sourceIndex: number, targetIndex: number): void {
  const sourceItem = slots[sourceIndex].item;
  if (!sourceItem) return;
  slots[sourceIndex].item = slots[targetIndex].item;
  slots[targetIndex].item = sourceItem;
}

function cloneQuickSlotSets(sets: QuickSlotSet[]): QuickSlotSet[] {
  return sets.map(set => ({ id: set.id, slots: set.slots.map(slot => ({ ...slot })) }));
}

function clearQuickSlotSetItem(set: QuickSlotSet, itemName: ItemName): void {
  set.slots.forEach(slot => {
    if (slot.itemName === itemName) slot.itemName = undefined;
  });
}

function swapQuickSlotItems(
  source: QuickSlotSet['slots'][number],
  target: QuickSlotSet['slots'][number]
): void {
  const itemName = source.itemName;
  source.itemName = target.itemName;
  target.itemName = itemName;
}

function mergeInventoryItem(target: InventoryItem, source: InventoryItem): void {
  target.count = (target.count ?? 1) + (source.count ?? 1);
  target.durability = source.durability ?? target.durability;
  target.range = source.range ?? target.range;
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
  return { name, count: 1, durability: 1, range: TOOL_DEFINITIONS[name].range };
}

function createInitialQuickSlotSets(): QuickSlotSet[] {
  return [
    createQuickSlotSet(1, [ToolType.Sword, ToolType.Axe]),
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
