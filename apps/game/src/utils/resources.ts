export enum ResourceType {
  Wood = 'wood',
  Plank = 'plank',
  Stone = 'stone',
  Iron = 'iron',
  Copper = 'copper',
  Gold = 'gold',
  RedMushroom = 'red-mushroom',
  BlueMushroom = 'blue-mushroom',
  GreenMushroom = 'green-mushroom'
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
  ResourceType.GreenMushroom
] as const;

export function isResourceName(name: string): name is ResourceName {
  return RESOURCE_NAMES.includes(name as ResourceName);
}

export type ResourceEffects = {
  health: number;
  fatigue: number;
  hunger: number;
  thirst: number;
};

export type ResourceSpec = {
  description: string;
  effects: ResourceEffects;
};

export const RESOURCE_SPECS: Record<ResourceName, ResourceSpec> = {
  [ResourceType.Wood]: {
    description: 'A rough timber log useful for fuel and basic construction.',
    effects: { health: 0, fatigue: 0, hunger: 0, thirst: 0 }
  },
  [ResourceType.Plank]: {
    description: 'A cut wooden board prepared for crafting and building.',
    effects: { health: 0, fatigue: 0, hunger: 0, thirst: 0 }
  },
  [ResourceType.Stone]: {
    description: 'A sturdy rock used for tools, structures, and camp fixtures.',
    effects: { health: 0, fatigue: 0, hunger: 0, thirst: 0 }
  },
  [ResourceType.Iron]: {
    description: 'A durable metal ore suited for strong tools and equipment.',
    effects: { health: 0, fatigue: 0, hunger: 0, thirst: 0 }
  },
  [ResourceType.Copper]: {
    description: 'A workable metal ore used for simple gear and utility parts.',
    effects: { health: 0, fatigue: 0, hunger: 0, thirst: 0 }
  },
  [ResourceType.Gold]: {
    description: 'A rare precious ore valued for trade and advanced crafting.',
    effects: { health: 0, fatigue: 0, hunger: 0, thirst: 0 }
  },
  [ResourceType.RedMushroom]: {
    description: 'A bright mushroom with a risky medicinal bite.',
    effects: { health: 4, fatigue: 2, hunger: 8, thirst: -2 }
  },
  [ResourceType.BlueMushroom]: {
    description: 'A cool mushroom that restores thirst but leaves the body sluggish.',
    effects: { health: 0, fatigue: -6, hunger: 4, thirst: 10 }
  },
  [ResourceType.GreenMushroom]: {
    description: 'An earthy mushroom that fills the stomach with little downside.',
    effects: { health: 1, fatigue: 0, hunger: 12, thirst: 2 }
  }
};

export function getResourceSpec(resource: ResourceName): ResourceSpec {
  return RESOURCE_SPECS[resource];
}
