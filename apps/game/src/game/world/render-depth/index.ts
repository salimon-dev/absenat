import { WorldRenderDepth } from './types';
import type { WorldRenderDepthType } from './types';

export { WorldRenderDepth };
export type { WorldRenderDepthType };

export function getGroundTileDepth(): WorldRenderDepthType {
  return WorldRenderDepth.GroundTile;
}

export function getGroundObjectDepth(y: number): number {
  return y + WorldRenderDepth.GroundObjectOffset;
}

export function getActorDepth(y: number): number {
  return y + WorldRenderDepth.ActorOffset;
}

export function getActiveToolDepth(y: number): number {
  return y + WorldRenderDepth.ActiveToolOffset;
}

export function getTallObjectDepth(y: number): number {
  return y + WorldRenderDepth.TallObjectOffset;
}

export function getWorldOverlayDepth(): WorldRenderDepthType {
  return WorldRenderDepth.WorldOverlay;
}

export function getSceneOverlayDepth(): WorldRenderDepthType {
  return WorldRenderDepth.SceneOverlay;
}
