import type { ToolName } from '../../utils/tools';

export interface InventoryItem {
  name: ToolName;
  count?: number;
  durability?: number;
}
