import { TILE_SIZE, WORLD_SIZE } from './tiles';

const RAFT_SIZE = 18;
const RAFT_EDGE_GAP = 1;
const RAFT_BRIDGE_WIDTH = 3;
const RAFT_BRIDGE_LENGTH = 2;
const RAFT_LANDING_LENGTH = 8;
const RAFT_LANDING_PADDING = 2;

export function isRaftTile(x: number, y: number): boolean {
  return x >= getRaftLeft() && x <= getRaftRight() && y >= getRaftTop() && y <= getRaftBottom();
}

export function isRaftBridgeTile(x: number, y: number): boolean {
  const inBridgeX = x > getRaftRight() && x <= getRaftRight() + RAFT_BRIDGE_LENGTH;
  return inBridgeX && y >= getRaftBridgeTop() && y <= getRaftBridgeBottom();
}

export function isRaftFloorTile(x: number, y: number): boolean {
  return isRaftTile(x, y) || isRaftBridgeTile(x, y);
}

export function isRaftLandingTile(x: number, y: number): boolean {
  const inLandingX = x > getRaftRight() + RAFT_BRIDGE_LENGTH && x <= getRaftLandingRight();
  return inLandingX && y >= getRaftLandingTop() && y <= getRaftLandingBottom();
}

export function isRaftWaterTile(x: number, y: number): boolean {
  if (isRaftTile(x, y)) return false;
  if (isRaftBridgeTile(x, y)) return false;
  return x >= getRaftLeft() - 1 && x <= getRaftRight() + 1 && y >= getRaftTop() - 1 && y <= getRaftBottom() + 1;
}

export function getRaftSpawnPoint(): { x: number; y: number } {
  const tileX = getRaftLeft() + Math.floor(RAFT_SIZE / 2);
  const tileY = getRaftTop() + Math.floor(RAFT_SIZE / 2);
  return { x: tileX * TILE_SIZE, y: (tileY + 1) * TILE_SIZE };
}

function getRaftLeft(): number {
  return RAFT_EDGE_GAP;
}

function getRaftTop(): number {
  return WORLD_SIZE - RAFT_EDGE_GAP - RAFT_SIZE;
}

function getRaftRight(): number {
  return getRaftLeft() + RAFT_SIZE - 1;
}

function getRaftBottom(): number {
  return getRaftTop() + RAFT_SIZE - 1;
}

function getRaftBridgeTop(): number {
  return getRaftTop() + Math.floor((RAFT_SIZE - RAFT_BRIDGE_WIDTH) / 2);
}

function getRaftBridgeBottom(): number {
  return getRaftBridgeTop() + RAFT_BRIDGE_WIDTH - 1;
}

function getRaftLandingLeft(): number {
  return getRaftRight() + RAFT_BRIDGE_LENGTH + 1;
}

function getRaftLandingRight(): number {
  return getRaftLandingLeft() + RAFT_LANDING_LENGTH - 1;
}

function getRaftLandingTop(): number {
  return getRaftBridgeTop() - RAFT_LANDING_PADDING;
}

function getRaftLandingBottom(): number {
  return getRaftBridgeBottom() + RAFT_LANDING_PADDING;
}
