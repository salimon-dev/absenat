import { Scene } from 'phaser';

const TILE_SIZE = 16;
const GRID_COLS = 20;
const GRID_ROWS = 20;

const COLOR_GRID = 0x444444;
const COLOR_SELECTED = 0x4a9eff;
const COLOR_HOVER = 0x2a5a8a;

export class MapModuleScene extends Scene {
  onSelectionChange?: (count: number) => void;

  private selectedTiles = new Set<number>();
  private assignedTiles = new Map<number, number>(); // cellKey → frame
  private assignedTileIds = new Map<number, string>(); // cellKey → tileId
  private cellImages = new Map<number, Phaser.GameObjects.Image>(); // cellKey → image
  // anchorCellKey → { entityId, frameCells[] }
  private entityAnchorData = new Map<number, { entityId: string; frameCells: number[] }>();
  // cellKey → image (individual frame images)
  private entityFrameImages = new Map<number, Phaser.GameObjects.Image>();
  private tilesGraphics!: Phaser.GameObjects.Graphics;
  private overlayGraphics!: Phaser.GameObjects.Graphics;
  private isDragging = false;
  private dragStartCol = -1;
  private dragStartRow = -1;
  private dragEndCol = -1;
  private dragEndRow = -1;

  constructor() {
    super({ key: 'MapModuleScene' });
  }

  create(): void {
    this.tilesGraphics = this.add.graphics().setDepth(10);
    this.overlayGraphics = this.add.graphics().setDepth(11);
    this.drawGrid();

    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('wheel', this.onWheel, this);
  }

  getSelectedCount(): number {
    return this.selectedTiles.size;
  }

  getUnassignedCount(): number {
    return GRID_COLS * GRID_ROWS - this.assignedTiles.size;
  }

  getModuleData(): { tiles: string[]; entities: { id: string; row: number; col: number }[] } {
    const tiles: string[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        tiles.push(this.assignedTileIds.get(this.tileKey(col, row)) ?? '');
      }
    }

    const entities: { id: string; row: number; col: number }[] = [];
    for (const [anchorKey, { entityId }] of this.entityAnchorData) {
      entities.push({ id: entityId, col: anchorKey % GRID_COLS, row: Math.floor(anchorKey / GRID_COLS) });
    }

    return { tiles, entities };
  }

  loadModule(
    tiles: string[],
    entities: { id: string; row: number; col: number }[],
    tileRecords: Array<{ frame: number; id?: string }>,
    tileCrops: Map<number, string>,
    entityFrameCrops: Map<string, Array<{ position: { x: number; y: number }; dataUrl: string }>>,
  ): void {
    this.selectedTiles.clear();
    this.assignedTiles.clear();
    this.assignedTileIds.clear();
    for (const img of this.cellImages.values()) img.destroy();
    this.cellImages.clear();
    for (const img of this.entityFrameImages.values()) img.destroy();
    this.entityFrameImages.clear();
    this.entityAnchorData.clear();
    this.onSelectionChange?.(0);

    const tileIdToFrame = new Map<string, number>();
    for (const t of tileRecords) {
      if (t.id) tileIdToFrame.set(t.id, t.frame);
    }

    const placeTile = (key: number, frame: number, tileId: string) => {
      const col = key % GRID_COLS;
      const row = Math.floor(key / GRID_COLS);
      const cx = col * TILE_SIZE + TILE_SIZE / 2;
      const cy = row * TILE_SIZE + TILE_SIZE / 2;
      const img = this.add.image(cx, cy, `tile_${frame}`).setDepth(5).setDisplaySize(TILE_SIZE, TILE_SIZE);
      this.cellImages.set(key, img);
      this.assignedTiles.set(key, frame);
      this.assignedTileIds.set(key, tileId);
      this.redraw();
    };

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const tileId = tiles[row * GRID_COLS + col];
        if (!tileId) continue;
        const frame = tileIdToFrame.get(tileId);
        if (frame === undefined) continue;
        const dataUrl = tileCrops.get(frame);
        if (!dataUrl) continue;
        const key = this.tileKey(col, row);
        const texKey = `tile_${frame}`;
        if (this.textures.exists(texKey)) {
          placeTile(key, frame, tileId);
        } else {
          const capturedKey = key;
          const capturedFrame = frame;
          const capturedTileId = tileId;
          this.textures.once(`addtexture-${texKey}`, () => placeTile(capturedKey, capturedFrame, capturedTileId));
          this.textures.addBase64(texKey, dataUrl);
        }
      }
    }

    for (const { id: entityId, row: anchorRow, col: anchorCol } of entities) {
      const frames = entityFrameCrops.get(entityId);
      if (!frames || frames.length === 0) continue;

      const toLoad = frames
        .map((f) => ({ texKey: `entity_${entityId}_${f.position.x}_${f.position.y}`, dataUrl: f.dataUrl, position: f.position }))
        .filter(({ texKey }) => !this.textures.exists(texKey));

      const placeEntity = () => {
        const frameCells: number[] = [];
        for (const { position } of frames) {
          const cellCol = anchorCol + position.x;
          const cellRow = anchorRow + position.y;
          if (cellCol < 0 || cellCol >= GRID_COLS || cellRow < 0 || cellRow >= GRID_ROWS) continue;
          const cellKey = this.tileKey(cellCol, cellRow);
          this.entityFrameImages.get(cellKey)?.destroy();
          const texKey = `entity_${entityId}_${position.x}_${position.y}`;
          const cx = cellCol * TILE_SIZE + TILE_SIZE / 2;
          const cy = cellRow * TILE_SIZE + TILE_SIZE / 2;
          const img = this.add.image(cx, cy, texKey).setDepth(6).setDisplaySize(TILE_SIZE, TILE_SIZE);
          this.entityFrameImages.set(cellKey, img);
          frameCells.push(cellKey);
        }
        this.entityAnchorData.set(this.tileKey(anchorCol, anchorRow), { entityId, frameCells });
        this.redraw();
      };

      if (toLoad.length === 0) {
        placeEntity();
      } else {
        let loaded = 0;
        for (const { texKey, dataUrl } of toLoad) {
          this.textures.once(`addtexture-${texKey}`, () => {
            loaded++;
            if (loaded === toLoad.length) placeEntity();
          });
          this.textures.addBase64(texKey, dataUrl);
        }
      }
    }

    this.redraw();
  }

  assignEntityToSelected(
    entityId: string,
    frames: Array<{ position: { x: number; y: number }; dataUrl: string }>,
  ): void {
    const toLoad = frames
      .map((f) => ({ texKey: `entity_${entityId}_${f.position.x}_${f.position.y}`, dataUrl: f.dataUrl, position: f.position }))
      .filter(({ texKey }) => !this.textures.exists(texKey));

    const doPlace = () => {
      for (const anchorKey of this.selectedTiles) {
        const anchorCol = anchorKey % GRID_COLS;
        const anchorRow = Math.floor(anchorKey / GRID_COLS);

        const prev = this.entityAnchorData.get(anchorKey);
        if (prev) {
          for (const cellKey of prev.frameCells) {
            this.entityFrameImages.get(cellKey)?.destroy();
            this.entityFrameImages.delete(cellKey);
          }
        }

        const frameCells: number[] = [];
        for (const { position } of frames) {
          const cellCol = anchorCol + position.x;
          const cellRow = anchorRow + position.y;
          if (cellCol < 0 || cellCol >= GRID_COLS || cellRow < 0 || cellRow >= GRID_ROWS) continue;
          const cellKey = this.tileKey(cellCol, cellRow);
          this.entityFrameImages.get(cellKey)?.destroy();

          const texKey = `entity_${entityId}_${position.x}_${position.y}`;
          const cx = cellCol * TILE_SIZE + TILE_SIZE / 2;
          const cy = cellRow * TILE_SIZE + TILE_SIZE / 2;
          const img = this.add.image(cx, cy, texKey).setDepth(6).setDisplaySize(TILE_SIZE, TILE_SIZE);
          this.entityFrameImages.set(cellKey, img);
          frameCells.push(cellKey);
        }

        this.entityAnchorData.set(anchorKey, { entityId, frameCells });
      }
      this.redraw();
    };

    if (toLoad.length === 0) {
      doPlace();
    } else {
      let loaded = 0;
      for (const { texKey, dataUrl } of toLoad) {
        this.textures.once(`addtexture-${texKey}`, () => {
          loaded++;
          if (loaded === toLoad.length) doPlace();
        });
        this.textures.addBase64(texKey, dataUrl);
      }
    }
  }

  assignFrameToSelected(frame: number, dataUrl: string, tileId: string): void {
    const texKey = `tile_${frame}`;
    const doPlace = () => {
      for (const key of this.selectedTiles) {
        const existing = this.cellImages.get(key);
        if (existing) existing.destroy();
        const col = key % GRID_COLS;
        const row = Math.floor(key / GRID_COLS);
        const cx = col * TILE_SIZE + TILE_SIZE / 2;
        const cy = row * TILE_SIZE + TILE_SIZE / 2;
        const img = this.add.image(cx, cy, texKey).setDepth(5).setDisplaySize(TILE_SIZE, TILE_SIZE);
        this.cellImages.set(key, img);
        this.assignedTiles.set(key, frame);
        this.assignedTileIds.set(key, tileId);
      }
      this.redraw();
    };

    if (this.textures.exists(texKey)) {
      doPlace();
    } else {
      this.textures.once(`addtexture-${texKey}`, doPlace);
      this.textures.addBase64(texKey, dataUrl);
    }
  }

  private tileKey(col: number, row: number): number {
    return row * GRID_COLS + col;
  }

  private onWheel(_pointer: Phaser.Input.Pointer, _objs: unknown[], _dx: number, dy: number): void {
    const cam = this.cameras.main;
    const factor = dy < 0 ? 1.15 : 1 / 1.15;
    const newZoom = Phaser.Math.Clamp(cam.zoom * factor, 0.25, 8);
    const wx = _pointer.worldX;
    const wy = _pointer.worldY;
    cam.zoom = newZoom;
    cam.scrollX = wx - _pointer.x / newZoom;
    cam.scrollY = wy - _pointer.y / newZoom;
  }

  private pointerToTile(x: number, y: number): { col: number; row: number } | null {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
    return { col, row };
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    const tile = this.pointerToTile(pointer.worldX, pointer.worldY);
    if (!tile) return;

    this.isDragging = true;
    this.dragStartCol = tile.col;
    this.dragStartRow = tile.row;
    this.dragEndCol = tile.col;
    this.dragEndRow = tile.row;

    if (!pointer.event.shiftKey) {
      this.selectedTiles.clear();
      this.onSelectionChange?.(0);
    }

    this.redraw();
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !pointer.isDown) return;

    const tile = this.pointerToTile(pointer.worldX, pointer.worldY);
    if (!tile) return;

    this.dragEndCol = tile.col;
    this.dragEndRow = tile.row;
    this.redraw();
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging) return;

    const tile = this.pointerToTile(pointer.worldX, pointer.worldY);
    if (tile) {
      this.dragEndCol = tile.col;
      this.dragEndRow = tile.row;
    }

    const minCol = Math.min(this.dragStartCol, this.dragEndCol);
    const maxCol = Math.max(this.dragStartCol, this.dragEndCol);
    const minRow = Math.min(this.dragStartRow, this.dragEndRow);
    const maxRow = Math.max(this.dragStartRow, this.dragEndRow);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        this.selectedTiles.add(this.tileKey(c, r));
      }
    }

    this.isDragging = false;
    this.dragStartCol = -1;
    this.dragStartRow = -1;
    this.dragEndCol = -1;
    this.dragEndRow = -1;
    this.redraw();
    this.onSelectionChange?.(this.selectedTiles.size);
  }

  private getDragRect(): { minCol: number; maxCol: number; minRow: number; maxRow: number } | null {
    if (!this.isDragging || this.dragStartCol < 0) return null;
    return {
      minCol: Math.min(this.dragStartCol, this.dragEndCol),
      maxCol: Math.max(this.dragStartCol, this.dragEndCol),
      minRow: Math.min(this.dragStartRow, this.dragEndRow),
      maxRow: Math.max(this.dragStartRow, this.dragEndRow),
    };
  }

  private redraw(): void {
    this.tilesGraphics.clear();
    this.overlayGraphics.clear();

    const drag = this.getDragRect();

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        const key = this.tileKey(col, row);

        const inDrag =
          drag !== null &&
          col >= drag.minCol && col <= drag.maxCol &&
          row >= drag.minRow && row <= drag.maxRow;

        const isSelected = this.selectedTiles.has(key);
        const isAssigned = this.assignedTiles.has(key);

        if (!isAssigned) {
          if (isSelected) {
            this.tilesGraphics.fillStyle(COLOR_SELECTED, 0.85);
            this.tilesGraphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          } else if (inDrag) {
            this.tilesGraphics.fillStyle(COLOR_HOVER, 0.6);
            this.tilesGraphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          } else {
            this.tilesGraphics.lineStyle(1, COLOR_GRID, 1);
            this.tilesGraphics.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    for (const key of this.selectedTiles) {
      const col = key % GRID_COLS;
      const row = Math.floor(key / GRID_COLS);
      this.overlayGraphics.lineStyle(2, COLOR_SELECTED, 1);
      this.overlayGraphics.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    if (drag) {
      const rx = drag.minCol * TILE_SIZE;
      const ry = drag.minRow * TILE_SIZE;
      const rw = (drag.maxCol - drag.minCol + 1) * TILE_SIZE;
      const rh = (drag.maxRow - drag.minRow + 1) * TILE_SIZE;
      this.overlayGraphics.lineStyle(1, COLOR_SELECTED, 0.8);
      this.overlayGraphics.strokeRect(rx, ry, rw, rh);
    }
  }

  private drawGrid(): void {
    this.tilesGraphics.lineStyle(1, COLOR_GRID, 1);
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        this.tilesGraphics.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}
