import { describe, expect, it } from 'vitest';
import {
  getActiveToolDepth,
  getActorDepth,
  getGroundObjectDepth,
  getGroundTileDepth,
  getSceneOverlayDepth,
  getTallObjectDepth,
  getWorldOverlayDepth,
  WorldRenderDepth
} from '.';

describe('world render depth', () => {
  it('keeps named layers in render order', () => {
    const y = 16;
    expect(getGroundTileDepth()).toBeLessThan(getGroundObjectDepth(y));
    expect(getGroundObjectDepth(y)).toBeLessThan(getActorDepth(y));
    expect(getActorDepth(y)).toBeLessThan(getTallObjectDepth(y));
    expect(getTallObjectDepth(y)).toBeLessThan(getWorldOverlayDepth());
    expect(getWorldOverlayDepth()).toBeLessThan(getSceneOverlayDepth());
  });

  it('uses centralized y-based offsets for world sorting', () => {
    const y = 48;
    expect(getGroundObjectDepth(y)).toBe(y + WorldRenderDepth.GroundObjectOffset);
    expect(getActorDepth(y)).toBe(y + WorldRenderDepth.ActorOffset);
    expect(getActiveToolDepth(y)).toBe(y + WorldRenderDepth.ActiveToolOffset);
    expect(getTallObjectDepth(y)).toBe(y + WorldRenderDepth.TallObjectOffset);
  });
});
