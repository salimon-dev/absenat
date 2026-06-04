import { TILE_SIZE, WORLD_SIZE } from './tiles';

const RAFT_SIZE = 18;
const RAFT_EDGE_GAP = 1;
const RAFT_BRIDGE_WIDTH = 3;
const RAFT_BRIDGE_LENGTH = 2;
const RAFT_LANDING_LENGTH = 8;
const RAFT_LANDING_PADDING = 2;

export interface RaftBounds {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export function isRaftTile(x: number, y: number): boolean {
  const bounds = getRaftBounds();
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}

export function isRaftBridgeTile(x: number, y: number): boolean {
  const raft = getRaftBounds();
  const bridge = getRaftBridgeBounds();
  const inBridgeX = x > raft.right && x <= raft.right + RAFT_BRIDGE_LENGTH;
  return inBridgeX && y >= bridge.top && y <= bridge.bottom;
}

export function isRaftFloorTile(x: number, y: number): boolean {
  return isRaftTile(x, y) || isRaftBridgeTile(x, y);
}

export function isRaftLandingTile(x: number, y: number): boolean {
  const landing = getRaftLandingBounds();
  return x >= landing.left && x <= landing.right && y >= landing.top && y <= landing.bottom;
}

export function isRaftWaterTile(x: number, y: number): boolean {
  const raft = getRaftBounds();
  if (isRaftTile(x, y)) return false;
  if (isRaftBridgeTile(x, y)) return false;
  return x >= raft.left - 1 && x <= raft.right + 1 && y >= raft.top - 1 && y <= raft.bottom + 1;
}

export function getRaftSpawnPoint(): { x: number; y: number } {
  const raft = getRaftBounds();
  const tileX = raft.left + Math.floor(RAFT_SIZE / 2);
  const tileY = raft.top + Math.floor(RAFT_SIZE / 2);
  return { x: tileX * TILE_SIZE, y: (tileY + 1) * TILE_SIZE };
}

export function getRaftBounds(): RaftBounds {
  const left = RAFT_EDGE_GAP;
  const top = WORLD_SIZE - RAFT_EDGE_GAP - RAFT_SIZE;
  return {
    left,
    top,
    right: left + RAFT_SIZE - 1,
    bottom: top + RAFT_SIZE - 1
  };
}

export function getRaftBridgeBounds(): RaftBounds {
  const raft = getRaftBounds();
  const top = raft.top + Math.floor((RAFT_SIZE - RAFT_BRIDGE_WIDTH) / 2);
  return {
    left: raft.right + 1,
    top,
    right: raft.right + RAFT_BRIDGE_LENGTH,
    bottom: top + RAFT_BRIDGE_WIDTH - 1
  };
}

export function getRaftLandingBounds(): RaftBounds {
  const bridge = getRaftBridgeBounds();
  const left = bridge.right + 1;
  return {
    left,
    top: bridge.top - RAFT_LANDING_PADDING,
    right: left + RAFT_LANDING_LENGTH - 1,
    bottom: bridge.bottom + RAFT_LANDING_PADDING
  };
}
