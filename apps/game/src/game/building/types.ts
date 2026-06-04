import { ResourceType } from '../../utils/resources';

export enum BuildableType {
  SmallChest = 'small-chest',
  BigChest = 'big-chest',
  Campfire = 'campfire'
}

export type BuildableName = BuildableType;

export interface BuildCost {
  name: ResourceType;
  count: number;
}

export interface BuildableDefinition {
  color: number;
  cost: BuildCost;
  description: string;
  height: number;
  label: string;
  width: number;
}

export interface BuildPlacementPayload {
  buildable: BuildableName;
}

export interface BuildStateSnapshot {
  activeBuild?: BuildableName;
}
