export enum ResourceType {
  Wood = 'wood',
  Plank = 'plank',
  Stone = 'stone',
  Iron = 'iron',
  Copper = 'copper',
  Gold = 'gold',
  RedMushroom = 'red-mushroom',
  BlueMushroom = 'blue-mushroom',
  GreenMushroom = 'green-mushroom',
}

export type ResourceName = ResourceType;

export const RESOURCE_NAMES = [
  ResourceType.Wood,
  ResourceType.Plank,
  ResourceType.Stone,
  ResourceType.Iron,
  ResourceType.Copper,
  ResourceType.Gold,
  ResourceType.RedMushroom,
  ResourceType.BlueMushroom,
  ResourceType.GreenMushroom,
] as const;
