import type { ToolName } from '../../utils/tools';
import type { InventorySlotPosition, QuickSlotPosition } from '../../game/player/types';

export enum DragPayloadKind {
  InventorySlot = 'inventory-slot',
  QuickSlot = 'quick-slot'
}

export interface InventorySlotDragPayload {
  kind: DragPayloadKind.InventorySlot;
  itemName: ToolName;
  source: InventorySlotPosition;
}

export interface QuickSlotDragPayload {
  kind: DragPayloadKind.QuickSlot;
  source: QuickSlotPosition;
}

export type SlotDragPayload = InventorySlotDragPayload | QuickSlotDragPayload;

export function parseSlotDragPayload(value: string): SlotDragPayload | undefined {
  try {
    return getSlotDragPayload(JSON.parse(value));
  } catch {
    return undefined;
  }
}

export function serializeSlotDragPayload(payload: SlotDragPayload): string {
  return JSON.stringify(payload);
}

function getSlotDragPayload(value: unknown): SlotDragPayload | undefined {
  if (!isDragPayloadRecord(value)) return undefined;
  if (value.kind === DragPayloadKind.InventorySlot) return getInventorySlotPayload(value);
  if (value.kind === DragPayloadKind.QuickSlot) return getQuickSlotPayload(value);
  return undefined;
}

function getInventorySlotPayload(
  value: Record<string, unknown>
): InventorySlotDragPayload | undefined {
  if (!isDragPosition(value.source)) return undefined;
  if (typeof value.itemName !== 'string') return undefined;
  return {
    kind: DragPayloadKind.InventorySlot,
    itemName: value.itemName as ToolName,
    source: value.source
  };
}

function getQuickSlotPayload(value: Record<string, unknown>): QuickSlotDragPayload | undefined {
  if (!isQuickSlotPosition(value.source)) return undefined;
  return {
    kind: DragPayloadKind.QuickSlot,
    source: value.source
  };
}

function isDragPayloadRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

function isDragPosition(value: unknown): value is InventorySlotPosition {
  if (!isRecord(value)) return false;
  return Number.isInteger(value.slotIndex);
}

function isQuickSlotPosition(value: unknown): value is QuickSlotPosition {
  if (!isRecord(value)) return false;
  return Number.isInteger(value.setId) && Number.isInteger(value.slotIndex);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
