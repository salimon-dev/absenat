import type { BuildableName } from './buildables';

export enum BuildEvent {
  PlacementCancel = 'build-placement-cancel',
  PlacementStart = 'build-placement-start'
}

export type BuildEventType = BuildEvent;

export enum BuildPlacementReason {
  NoResources = 'no-resources',
  Occupied = 'occupied',
  OutsideRaft = 'outside-raft',
  PlayerBlocked = 'player-blocked',
  Unset = 'unset'
}

export type BuildPlacementReasonType = BuildPlacementReason;

export interface BuildPlacementStartPayload {
  buildable: BuildableName;
}
