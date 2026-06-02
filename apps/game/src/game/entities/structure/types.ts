import type { BuildableName } from '../../build/buildables';

export interface StructureFootprint {
  height: number;
  tileX: number;
  tileY: number;
  width: number;
}

export interface StructurePlacement {
  buildable: BuildableName;
  tileX: number;
  tileY: number;
}
