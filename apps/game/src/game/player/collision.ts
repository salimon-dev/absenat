import type { World } from '../world';

export function canMove(world: World, nextX: number, nextY: number): boolean {
  const radius = 6;
  const points = [
    { x: nextX, y: nextY + 8 }, // Check feet for better collision
    { x: nextX - radius, y: nextY + 8 },
    { x: nextX + radius, y: nextY + 8 },
    { x: nextX, y: nextY + 4 },
    { x: nextX, y: nextY + 12 },
  ];

  for (const point of points) {
    const tile = world.tilemap.getTileAtWorldXY(point.x, point.y);
    if (!tile || world.nonWalkableIds.has(tile.index)) {
      return false;
    }
  }

  const playerLeft = nextX - radius;
  const playerRight = nextX + radius;
  const playerTop = nextY + 4;
  const playerBottom = nextY + 12;

  for (const tree of world.entities) {
    const rootLeft = tree.x - 8;
    const rootRight = tree.x + 8;
    const rootTop = tree.y - 16;
    const rootBottom = tree.y;

    if (playerRight > rootLeft && playerLeft < rootRight &&
        playerBottom > rootTop && playerTop < rootBottom) {
      return false;
    }
  }

  return true;
}
