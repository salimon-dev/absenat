import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const defaultTransform: TransformState = {
  flipX: false,
  flipY: false,
  rotation: 0,
  zoom: 4,
};

function getNaturalSize(asset: HTMLImageElement): [number, number] {
  return [asset.naturalWidth || asset.width, asset.naturalHeight || asset.height];
}

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

function drawTransformedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  transform: TransformState,
) {
  const [width, height] = getNaturalSize(image);
  const [canvasWidth, canvasHeight] = getCanvasSize(width, height, transform.rotation);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${canvasWidth * transform.zoom}px`;
  canvas.style.height = `${canvasHeight * transform.zoom}px`;
  renderTransformedImage(canvas, image, width, height, transform);
}

function renderTransformedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  width: number,
  height: number,
  transform: TransformState,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
  ctx.drawImage(image, -width / 2, -height / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export default function AssetsEditPage() {
  const { filename } = useParams();
  const folderHandle = useAtomValue(folderHandleAtom);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [background, setBackground] = useState(AssetPreviewBackground.Dark);
  const [assetUrl, setAssetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transform, setTransform] = useState(defaultTransform);

  const drawAsset = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    drawTransformedImage(canvas, image, transform);
  }, [transform]);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    async function loadAsset() {
      if (!folderHandle || !filename) return;
      setLoading(true);
      setError('');
      const file = await readPublicAssetImageFile(folderHandle, filename);
      if (!file) {
        if (active) setError('Asset file was not found.');
        if (active) setLoading(false);
        return;
      }
      objectUrl = URL.createObjectURL(file);
      if (active) setAssetUrl(objectUrl);
      if (active) setLoading(false);
    }

    loadAsset();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filename, folderHandle]);

  useEffect(() => {
    if (!assetUrl) return;
    let active = true;
    const image = new Image();
    image.src = assetUrl;
    image.onload = () => {
      if (!active) return;
      imageRef.current = image;
      drawAsset();
    };
    return () => { active = false; };
  }, [assetUrl, drawAsset]);

  useEffect(() => {
    drawAsset();
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
      const blob = await canvasToPngBlob(canvasRef.current);
      await writePublicAssetImageBlob(folderHandle, filename, blob);
      navigate('/assets');
    } catch {
      setError('Unable to save asset file.');
    } finally {
      setSaving(false);
    }
  }

  function downloadAsset() {
    if (!filename) return;
    const link = document.createElement('a');
    link.download = getDownloadName(filename);
    link.href = canvasRef.current?.toDataURL('image/png') ?? assetUrl;
    link.click();
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
            <canvas ref={canvasRef} className={s.canvas} />
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
            <span>Rotation: {transform.rotation}deg</span>
            <span>Horizontal flip: {transform.flipX ? 'on' : 'off'}</span>
            <span>Vertical flip: {transform.flipY ? 'on' : 'off'}</span>
          </div>
        </aside>
      </main>
    </section>
  );
}
