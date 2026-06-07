import { ResourceType } from '../../utils/resources';
import { BuildableType, type BuildableDefinition, type BuildableName } from './types';

export const BUILDABLE_DEFINITIONS: Record<BuildableName, BuildableDefinition> = {
  [BuildableType.SmallChest]: {
    label: 'Small Chest',
    description: '1x1 storage chest.',
    width: 1,
    height: 1,
    cost: { name: ResourceType.Wood, count: 4 },
    asset: {
      frames: [0]
    }
  },
  [BuildableType.BigChest]: {
    label: 'Big Chest',
    description: '2x1 storage chest.',
    width: 2,
    height: 1,
    cost: { name: ResourceType.Wood, count: 6 },
    asset: {
      frames: [1, 2]
    }
  },
  [BuildableType.Campfire]: {
    label: 'Campfire',
    description: '1x1 fire pit.',
    width: 1,
    height: 1,
    cost: { name: ResourceType.Wood, count: 2 },
    asset: {
      frames: [3]
    }
  }
};

export const BUILDABLE_NAMES = Object.values(BuildableType);
