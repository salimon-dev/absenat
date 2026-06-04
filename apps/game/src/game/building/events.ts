export enum BuildEvent {
  CancelPlacement = 'build-cancel-placement',
  StartPlacement = 'build-start-placement',
  StateUpdate = 'build-state-update'
}

export type BuildEventType = BuildEvent;
