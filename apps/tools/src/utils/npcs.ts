import type { NpcAnimationRow, NpcAssetData, NpcVariant, PixelRect } from './types.ts';
import { NpcAnimation, NpcAsset } from './types.ts';

const outline = '#1e2430';
const bone = '#d8d0b8';
const boneDark = '#9c927a';
const boneLight = '#f2ead1';
const eye = '#151923';
const shadow = '#3b3440';

export const npcFrameSize = 32;
export const npcFramesPerAnimation = 4;
export const npcVariants: NpcVariant[] = [
  { id: NpcAsset.Skeleton, animations: createSkeletonAnimations() },
];

export function createNpcAssetData(variant: NpcVariant): NpcAssetData {
  return {
    id: variant.id,
    frameWidth: npcFrameSize,
    frameHeight: npcFrameSize,
    animations: variant.animations.map(createAnimationData),
  };
}

function createAnimationData(row: NpcAnimationRow, rowIndex: number): NpcAssetData['animations'][number] {
  return {
    id: row.id,
    row: rowIndex,
    frames: row.frames.map((_, frameIndex) => rowIndex * npcFramesPerAnimation + frameIndex),
  };
}

function createSkeletonAnimations(): NpcAnimationRow[] {
  return [
    createRow(NpcAnimation.IdleDown, ['down', 'down', 'down', 'down'], [0, 1, 0, -1]),
    createRow(NpcAnimation.WalkUp, ['up', 'up', 'up', 'up'], [0, 1, 0, -1]),
    createRow(NpcAnimation.WalkLeft, ['left', 'left', 'left', 'left'], [0, 1, 0, -1]),
    createRow(NpcAnimation.WalkDown, ['down', 'down', 'down', 'down'], [0, 1, 0, -1]),
    createRow(NpcAnimation.WalkRight, ['right', 'right', 'right', 'right'], [0, 1, 0, -1]),
  ];
}

function createRow(id: NpcAnimation, directions: Direction[], steps: number[]): NpcAnimationRow {
  return { id, frames: directions.map((direction, index) => createSkeleton(direction, steps[index] ?? 0)) };
}

type Direction = 'up' | 'left' | 'down' | 'right';

function createSkeleton(direction: Direction, step: number): PixelRect[] {
  return [
    ...createShadow(),
    ...createSkull(direction, step),
    ...createRibCage(step),
    ...createArms(direction, step),
    ...createLegs(step),
  ];
}

function createShadow(): PixelRect[] {
  return [rect(10, 28, 12, 2, shadow), rect(12, 27, 8, 1, shadow)];
}

function createSkull(direction: Direction, step: number): PixelRect[] {
  const y = 4 + (step === 0 ? 0 : 1);
  return [
    rect(11, y, 10, 8, outline), rect(12, y - 1, 8, 1, outline),
    rect(12, y + 1, 8, 6, bone), rect(13, y, 6, 1, boneLight),
    ...createFace(direction, y),
  ];
}

function createFace(direction: Direction, y: number): PixelRect[] {
  if (direction === 'up') return [rect(14, y + 3, 4, 1, boneDark)];
  if (direction === 'left') return [rect(13, y + 3, 2, 2, eye), rect(12, y + 5, 3, 1, boneDark)];
  if (direction === 'right') return [rect(17, y + 3, 2, 2, eye), rect(17, y + 5, 3, 1, boneDark)];
  return [rect(13, y + 3, 2, 2, eye), rect(17, y + 3, 2, 2, eye), rect(14, y + 6, 4, 1, boneDark)];
}

function createRibCage(step: number): PixelRect[] {
  const y = 14 + Math.abs(step);
  return [
    rect(14, y - 1, 4, 2, bone), rect(13, y + 1, 6, 1, outline),
    rect(12, y + 2, 8, 5, bone), rect(14, y + 2, 1, 5, outline),
    rect(17, y + 2, 1, 5, outline), rect(12, y + 4, 8, 1, outline),
  ];
}

function createArms(direction: Direction, step: number): PixelRect[] {
  if (direction === 'left') return createLeftSideArms(step);
  if (direction === 'right') return createRightSideArms(step);
  return [...createArm(10, 17, step), ...createArm(20, 17, -step)];
}

function createLeftSideArms(step: number): PixelRect[] {
  const swing = step > 0 ? 1 : 0;
  return [
    rect(11 - swing, 16, 2, 5, boneDark),
    rect(9 - swing, 20, 4, 2, bone),
  ];
}

function createRightSideArms(step: number): PixelRect[] {
  const swing = step > 0 ? 1 : 0;
  return [
    rect(19 + swing, 16, 2, 5, boneDark),
    rect(19 + swing, 20, 4, 2, bone),
  ];
}

function createArm(x: number, y: number, step: number): PixelRect[] {
  const swing = step > 0 ? 1 : 0;
  return [rect(x, y + swing, 2, 7, bone), rect(x, y + 6 + swing, 2, 2, boneDark)];
}

function createLegs(step: number): PixelRect[] {
  const leftStep = step > 0 ? 1 : 0;
  const rightStep = step < 0 ? 1 : 0;
  return [
    ...createLeg(13, 21, leftStep),
    ...createLeg(17, 21, rightStep),
  ];
}

function createLeg(x: number, y: number, step: number): PixelRect[] {
  return [rect(x, y, 2, 7 + step, bone), rect(x - step, y + 7 + step, 4, 2, boneDark)];
}

function rect(x: number, y: number, width: number, height: number, fill: string): PixelRect {
  return { x, y, width, height, fill };
}
