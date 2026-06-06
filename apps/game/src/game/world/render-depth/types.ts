export enum WorldRenderDepth {
  GroundTile = 0,
  GroundObjectOffset = 2,
  ActorOffset = 10,
  ActiveToolOffset = 11,
  TallObjectOffset = 20,
  WorldOverlay = 200000,
  SceneOverlay = 201000
}

export type WorldRenderDepthType = WorldRenderDepth;
