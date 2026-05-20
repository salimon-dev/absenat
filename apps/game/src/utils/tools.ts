export enum ToolType {
  Bow = 'bow',
  Sword = 'sword',
  Axe = 'axe',
  Pickaxe = 'pickaxe',
  Hammer = 'hammer',
}

export type ToolName = ToolType;

export interface ToolDefinition {
  name: ToolName;
  range: number;
}

export const TOOL_NAMES = [
  ToolType.Bow,
  ToolType.Sword,
  ToolType.Axe,
  ToolType.Pickaxe,
  ToolType.Hammer,
] as const;

export function isToolName(name: string): name is ToolName {
  return TOOL_NAMES.includes(name as ToolName);
}

export const TOOL_DEFINITIONS: Record<ToolName, ToolDefinition> = {
  [ToolType.Bow]: createToolDefinition(ToolType.Bow),
  [ToolType.Sword]: createToolDefinition(ToolType.Sword),
  [ToolType.Axe]: createToolDefinition(ToolType.Axe),
  [ToolType.Pickaxe]: createToolDefinition(ToolType.Pickaxe),
  [ToolType.Hammer]: createToolDefinition(ToolType.Hammer),
};

function createToolDefinition(name: ToolName): ToolDefinition {
  return { name, range: 1 };
}
