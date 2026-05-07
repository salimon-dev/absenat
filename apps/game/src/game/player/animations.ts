import type * as Phaser from 'phaser';

export function setupPlayerAnimations(anims: Phaser.Animations.AnimationManager) {
  if (!anims.exists('idle-down')) {
    anims.create({
      key: 'idle-down',
      frames: anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });
  }

  if (!anims.exists('idle-up')) {
    anims.create({
      key: 'idle-up',
      frames: anims.generateFrameNumbers('player', { start: 12, end: 17 }),
      frameRate: 6,
      repeat: -1
    });
  }

  if (!anims.exists('walk-down')) {
    anims.create({
      key: 'walk-down',
      frames: anims.generateFrameNumbers('player', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!anims.exists('walk-right')) {
    anims.create({
      key: 'walk-right',
      frames: anims.generateFrameNumbers('player', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!anims.exists('walk-up')) {
    anims.create({
      key: 'walk-up',
      frames: anims.generateFrameNumbers('player', { start: 30, end: 35 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!anims.exists('walk-left')) {
    anims.create({
      key: 'walk-left',
      frames: anims.generateFrameNumbers('player', { start: 36, end: 41 }),
      frameRate: 10,
      repeat: -1
    });
  }
}
