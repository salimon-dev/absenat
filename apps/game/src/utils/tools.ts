export enum ToolType {
  Bow = 'bow',
  Sword = 'sword',
  Axe = 'axe',
  Pickaxe = 'pickaxe',
  Hammer = 'hammer',
}

export const TOOL_NAMES = [
  ToolType.Bow,
  ToolType.Sword,
  ToolType.Axe,
  ToolType.Pickaxe,
  ToolType.Hammer,
] as const;

export type ToolName = ToolType;
