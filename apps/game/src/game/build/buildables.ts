import { ResourceType, type ResourceName } from '../../utils/resources';

export enum BuildableType {
  SmallChest = 'small-chest',
  BigChest = 'big-chest',
  Campfire = 'campfire'
}

export type BuildableName = BuildableType;

export interface BuildCost {
  count: number;
  resource: ResourceName;
}

export interface BuildableSpec {
  costs: BuildCost[];
  description: string;
  height: number;
  label: string;
  name: BuildableName;
  width: number;
}

export const BUILDABLE_NAMES = [BuildableType.SmallChest, BuildableType.BigChest, BuildableType.Campfire] as const;

export const BUILDABLE_SPECS: Record<BuildableName, BuildableSpec> = {
  [BuildableType.SmallChest]: {
    name: BuildableType.SmallChest,
    label: 'Small Chest',
    description: 'Compact 1x1 storage crate for the raft.',
    width: 1,
    height: 1,
    costs: [{ resource: ResourceType.Wood, count: 4 }]
  },
  [BuildableType.BigChest]: {
    name: BuildableType.BigChest,
    label: 'Big Chest',
    description: 'Wide 2x1 chest for larger supplies.',
    width: 2,
    height: 1,
    costs: [{ resource: ResourceType.Wood, count: 6 }]
  },
  [BuildableType.Campfire]: {
    name: BuildableType.Campfire,
    label: 'Campfire',
    description: 'Simple raft firepit for warmth and cooking.',
    width: 1,
    height: 1,
    costs: [{ resource: ResourceType.Wood, count: 2 }]
  }
};

export function getBuildableSpec(name: BuildableName): BuildableSpec {
  return BUILDABLE_SPECS[name];
}
