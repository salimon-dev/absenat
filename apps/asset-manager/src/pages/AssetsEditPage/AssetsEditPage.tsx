import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  readPublicAssetImageFile,
  writePublicAssetImageBlob,
} from '../../lib/assetsDb';
import { folderHandleAtom } from '../../store';
import s from './AssetsEditPage.module.css';
import { AssetPreviewBackground } from './types';

interface TransformState {
  flipX: boolean;
  flipY: boolean;
  rotation: number;
  zoom: number;
}

interface FrameTile {
  col: number;
  dataUrl: string;
  frame: number;
  row: number;
}

interface FrameGridState {
  cols: number;
  frames: FrameTile[];
  height: number;
  rows: number;
  width: number;
}

const defaultTransform: TransformState = {
  flipX: false,
  flipY: false,
  rotation: 0,
  zoom: 4,
};

const TILE_SIZE = 16;

function isSideways(rotation: number): boolean {
  return rotation % 180 !== 0;
}

function getCanvasSize(width: number, height: number, rotation: number): [number, number] {
  return isSideways(rotation) ? [height, width] : [width, height];
}

function getDownloadName(filename: string): string {
  return filename.replace(/\.png$/i, '-edited.png');
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to create PNG blob.'));
    }, 'image/png');
  });
}

function loadDataUrlImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load frame image.'));
    image.src = dataUrl;
  });
}

function getFrameIndex(col: number, row: number, rows: number): number {
  return col * rows + row;
}

function getGridCellSize(zoom: number): number {
  return TILE_SIZE * zoom;
}

function getGridStyle(cols: number, zoom: number): CSSProperties {
  return {
    '--tile-preview-size': `${getGridCellSize(zoom)}px`,
    gridTemplateColumns: `repeat(${cols}, var(--tile-preview-size))`,
  } as CSSProperties;
}

async function createFrameGrid(file: File): Promise<FrameGridState> {
  const bitmap = await createImageBitmap(file);
  const cols = Math.floor(bitmap.width / TILE_SIZE);
  const rows = Math.floor(bitmap.height / TILE_SIZE);
  const frames = createFrameTiles(bitmap, cols, rows);
  const result = { cols, frames, height: bitmap.height, rows, width: bitmap.width };
  bitmap.close();
  return result;
}

function createFrameTiles(bitmap: ImageBitmap, cols: number, rows: number): FrameTile[] {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.imageSmoothingEnabled = false;
  return collectFrameTiles(bitmap, canvas, ctx, cols, rows);
}

function collectFrameTiles(
  bitmap: ImageBitmap,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
): FrameTile[] {
  const frames: FrameTile[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      frames.push(createFrameTile(bitmap, canvas, ctx, col, row, rows));
    }
  }
  return frames;
}

function createFrameTile(
  bitmap: ImageBitmap,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  rows: number,
): FrameTile {
  ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
  ctx.drawImage(
    bitmap,
    col * TILE_SIZE,
    row * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    0,
    0,
    TILE_SIZE,
    TILE_SIZE,
  );
  return { col, dataUrl: canvas.toDataURL('image/png'), frame: getFrameIndex(col, row, rows), row };
}

function replaceFrameTile(grid: FrameGridState, frame: number, dataUrl: string): FrameGridState {
  return {
    ...grid,
    frames: grid.frames.map(tile => (tile.frame === frame ? { ...tile, dataUrl } : tile)),
  };
}

async function drawFrameGridCanvas(
  canvas: HTMLCanvasElement,
  grid: FrameGridState,
  transform: TransformState,
) {
  const source = await createSourceCanvas(grid);
  drawTransformedCanvas(canvas, source, transform);
}

async function createSourceCanvas(grid: FrameGridState): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = grid.width;
  canvas.height = grid.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  await drawFrames(ctx, grid.frames);
  return canvas;
}

async function drawFrames(ctx: CanvasRenderingContext2D, frames: FrameTile[]) {
  await Promise.all(frames.map(tile => drawFrame(ctx, tile)));
}

async function drawFrame(ctx: CanvasRenderingContext2D, tile: FrameTile) {
  const image = await loadDataUrlImage(tile.dataUrl);
  ctx.drawImage(image, tile.col * TILE_SIZE, tile.row * TILE_SIZE);
}

function drawTransformedCanvas(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  transform: TransformState,
) {
  const [canvasWidth, canvasHeight] = getCanvasSize(source.width, source.height, transform.rotation);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  renderTransformedCanvas(canvas, source, transform);
}

function renderTransformedCanvas(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  transform: TransformState,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export default function AssetsEditPage() {
  const { filename } = useParams();
  const folderHandle = useAtomValue(folderHandleAtom);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [background, setBackground] = useState(AssetPreviewBackground.Dark);
  const [error, setError] = useState('');
  const [frameGrid, setFrameGrid] = useState<FrameGridState | null>(null);
  const [loading, setLoading] = useState(true);
  const [replacementError, setReplacementError] = useState('');
  const [replacementGrid, setReplacementGrid] = useState<FrameGridState | null>(null);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameTile | null>(null);
  const [saving, setSaving] = useState(false);
  const [transform, setTransform] = useState(defaultTransform);

  const drawAsset = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !frameGrid) return;
    await drawFrameGridCanvas(canvas, frameGrid, transform);
  }, [frameGrid, transform]);

  useEffect(() => {
    let active = true;
    async function loadAsset() {
      if (!folderHandle || !filename) return;
      setLoading(true);
      setError('');
      setFrameGrid(null);
      try {
        const file = await readPublicAssetImageFile(folderHandle, filename);
        if (!file) {
          if (active) setError('Asset file was not found.');
          if (active) setLoading(false);
          return;
        }
        const grid = await createFrameGrid(file);
        if (!active) return;
        setFrameGrid(grid);
      } catch {
        if (active) setError('Unable to read asset image.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAsset();
    return () => {
      active = false;
    };
  }, [filename, folderHandle]);

  useEffect(() => {
    let active = true;
    async function draw() {
      try {
        await drawAsset();
      } catch {
        if (active) setError('Unable to render asset image.');
      }
    };
    draw();
    return () => { active = false; };
  }, [drawAsset]);

  function rotateClockwise() {
    setTransform(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  }

  function flipHorizontal() {
    setTransform(prev => ({ ...prev, flipX: !prev.flipX }));
  }

  function flipVertical() {
    setTransform(prev => ({ ...prev, flipY: !prev.flipY }));
  }

  function resetTransform() {
    setTransform(defaultTransform);
  }

  function setZoom(zoom: number) {
    setTransform(prev => ({ ...prev, zoom }));
  }

  async function saveAsset() {
    if (!folderHandle || !filename || !canvasRef.current || saving) return;
    setSaving(true);
    setError('');
    try {
      if (frameGrid) await drawFrameGridCanvas(canvasRef.current, frameGrid, transform);
      const blob = await canvasToPngBlob(canvasRef.current);
      await writePublicAssetImageBlob(folderHandle, filename, blob);
      navigate('/assets');
    } catch {
      setError('Unable to save asset file.');
    } finally {
      setSaving(false);
    }
  }

  async function downloadAsset() {
    if (!filename || !canvasRef.current) return;
    if (frameGrid) await drawFrameGridCanvas(canvasRef.current, frameGrid, transform);
    const link = document.createElement('a');
    link.download = getDownloadName(filename);
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  function openReplacementDialog(tile: FrameTile) {
    setSelectedFrame(tile);
    setReplacementGrid(null);
    setReplacementError('');
  }

  function closeReplacementDialog() {
    setSelectedFrame(null);
    setReplacementGrid(null);
    setReplacementError('');
  }

  async function handleReplacementFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await loadReplacementFile(file);
  }

  async function loadReplacementFile(file: File) {
    setReplacementLoading(true);
    setReplacementError('');
    try {
      setReplacementGrid(await createFrameGrid(file));
    } catch {
      setReplacementError('Unable to read replacement PNG.');
    } finally {
      setReplacementLoading(false);
    }
  }

  function replaceSelectedFrame(tile: FrameTile) {
    if (!selectedFrame) return;
    setFrameGrid(prev => (prev ? replaceFrameTile(prev, selectedFrame.frame, tile.dataUrl) : prev));
    closeReplacementDialog();
  }

  if (!filename) return <Navigate to="/assets" replace />;

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div className={s.headerText}>
          <button className={s.backBtn} onClick={() => navigate('/assets')} type="button">
            Back to assets
          </button>
          <h1 className={s.title}>{filename}</h1>
          <p className={s.subtitle}>Edit PNG in the selected folder</p>
        </div>
        <div className={s.actions}>
          <button className={s.toolBtn} onClick={flipHorizontal} type="button">Flip H</button>
          <button className={s.toolBtn} onClick={flipVertical} type="button">Flip V</button>
          <button className={s.toolBtn} onClick={rotateClockwise} type="button">Rotate</button>
          <button className={s.toolBtn} onClick={resetTransform} type="button">Reset</button>
          <button className={s.downloadBtn} onClick={downloadAsset} type="button">Download PNG</button>
          <button className={s.downloadBtn} disabled={saving} onClick={saveAsset} type="button">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {error && <p className={s.error}>{error}</p>}

      <main className={s.layout}>
        <section className={s.previewPanel}>
          <div className={s.previewStage} data-bg={background}>
            {loading && <span className={s.loading}>Loading...</span>}
            {!loading && frameGrid && (
              <div className={s.frameGridWrap}>
                <div className={s.frameGrid} style={getGridStyle(frameGrid.cols, transform.zoom)}>
                  {frameGrid.frames.map(tile => (
                    <button
                      className={s.frameTile}
                      key={tile.frame}
                      onClick={() => openReplacementDialog(tile)}
                      type="button"
                    >
                      <img
                        alt={`frame ${tile.frame}`}
                        className={s.frameImage}
                        draggable={false}
                        src={tile.dataUrl}
                      />
                      <span className={s.frameLabel}>f{tile.frame}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className={s.exportCanvas} />
          </div>
        </section>

        <aside className={s.controlsPanel}>
          <label className={s.controlGroup}>
            <span className={s.label}>Zoom</span>
            <span className={s.rangeRow}>
              <input
                className={s.range}
                max="12"
                min="1"
                onChange={event => setZoom(Number(event.target.value))}
                type="range"
                value={transform.zoom}
              />
              <span className={s.value}>{transform.zoom}x</span>
            </span>
          </label>

          <label className={s.controlGroup}>
            <span className={s.label}>Background</span>
            <select
              className={s.select}
              onChange={event => setBackground(event.target.value as AssetPreviewBackground)}
              value={background}
            >
              <option value={AssetPreviewBackground.Dark}>Dark</option>
              <option value={AssetPreviewBackground.Light}>Light</option>
              <option value={AssetPreviewBackground.Grid}>Grid</option>
            </select>
          </label>

          <div className={s.meta}>
            <span>File: {filename}</span>
            {frameGrid && (
              <>
                <span>Image: {frameGrid.width}x{frameGrid.height}px</span>
                <span>Grid: {frameGrid.cols} cols x {frameGrid.rows} rows</span>
                <span>Frames: {frameGrid.frames.length}</span>
              </>
            )}
            <span>Rotation: {transform.rotation}deg</span>
            <span>Horizontal flip: {transform.flipX ? 'on' : 'off'}</span>
            <span>Vertical flip: {transform.flipY ? 'on' : 'off'}</span>
          </div>
        </aside>
      </main>

      {selectedFrame && (
        <div className={s.dialogOverlay} onClick={closeReplacementDialog}>
          <div className={s.dialog} onClick={event => event.stopPropagation()}>
            <div className={s.dialogHeader}>
              <div>
                <h2 className={s.dialogTitle}>Replace frame {selectedFrame.frame}</h2>
                <p className={s.dialogSubtitle}>Choose a 16x16 frame from a PNG file.</p>
              </div>
              <button className={s.closeBtn} onClick={closeReplacementDialog} type="button">
                Close
              </button>
            </div>

            <div className={s.currentFrame}>
              <img
                alt={`current frame ${selectedFrame.frame}`}
                className={s.currentFrameImage}
                draggable={false}
                src={selectedFrame.dataUrl}
              />
              <button className={s.uploadBtn} onClick={() => inputRef.current?.click()} type="button">
                Upload PNG
              </button>
              <input
                ref={inputRef}
                accept="image/png"
                className={s.hiddenInput}
                onChange={handleReplacementFile}
                type="file"
              />
            </div>

            {replacementError && <p className={s.error}>{replacementError}</p>}
            {replacementLoading && <p className={s.loading}>Loading replacement frames...</p>}

            {replacementGrid && (
              <div className={s.replacementGridWrap}>
                <div className={s.replacementGrid} style={getGridStyle(replacementGrid.cols, 3)}>
                  {replacementGrid.frames.map(tile => (
                    <button
                      className={s.replacementTile}
                      key={tile.frame}
                      onClick={() => replaceSelectedFrame(tile)}
                      type="button"
                    >
                      <img
                        alt={`replacement frame ${tile.frame}`}
                        className={s.frameImage}
                        draggable={false}
                        src={tile.dataUrl}
                      />
                      <span className={s.frameLabel}>f{tile.frame}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
