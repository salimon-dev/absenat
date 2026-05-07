import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { folderHandleAtom } from '../../store';
import { EmptyState } from '../common/EmptyState/EmptyState';
import { ModeModal } from './ModeModal';
import { TilesPanel } from './TilesPanel/TilesPanel';
import { StagingPanel } from './StagingPanel/StagingPanel';
import type { TileRecord, StagingTile } from './types';
import s from './TilesView.module.css';

const TILE_SIZE = 16;
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const randId = () => Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

async function readFile(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<File | null> {
  try {
    const fh = await dir.getFileHandle(name);
    return fh.getFile();
  } catch {
    return null;
  }
}

async function extractFrames(
  imageFile: File,
  tiles: TileRecord[],
): Promise<Map<number, string>> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      const cols = Math.max(1, Math.floor(img.width / TILE_SIZE));
      const result = new Map<number, string>();
      for (const tile of tiles) {
        const col = tile.frame % cols;
        const row = Math.floor(tile.frame / cols);
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(
          img,
          col * TILE_SIZE,
          row * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
          0,
          0,
          TILE_SIZE,
          TILE_SIZE,
        );
        result.set(tile.frame, canvas.toDataURL());
      }
      URL.revokeObjectURL(url);
      resolve(result);
    };
    img.src = url;
  });
}

function isBlankTile(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) {
          resolve(false);
          return;
        }
      }
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
}

async function slicePng(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cols = Math.max(1, Math.floor(img.width / TILE_SIZE));
      const rows = Math.max(1, Math.floor(img.height / TILE_SIZE));
      const results: string[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = TILE_SIZE;
          canvas.height = TILE_SIZE;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(
            img,
            c * TILE_SIZE,
            r * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
            0,
            0,
            TILE_SIZE,
            TILE_SIZE,
          );
          results.push(canvas.toDataURL());
        }
      }
      URL.revokeObjectURL(url);
      resolve(results);
    };
    img.src = url;
  });
}

function pixelKey(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = TILE_SIZE;
      canvas.height = TILE_SIZE;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
      let key = '';
      for (let i = 0; i < data.length; i++) key += data[i].toString(16).padStart(2, '0');
      resolve(key);
    };
    img.src = dataUrl;
  });
}

async function buildTilemapPng(orderedCrops: string[]): Promise<Blob> {
  const n = orderedCrops.length;
  const canvas = document.createElement('canvas');
  if (n === 0) {
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
  } else {
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    canvas.width = cols * TILE_SIZE;
    canvas.height = rows * TILE_SIZE;
    const ctx = canvas.getContext('2d')!;
    await Promise.all(
      orderedCrops.map((dataUrl, i) => {
        if (!dataUrl) return Promise.resolve();
        return new Promise<void>((res) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(
              img,
              (i % cols) * TILE_SIZE,
              Math.floor(i / cols) * TILE_SIZE,
            );
            res();
          };
          img.onerror = () => res();
          img.src = dataUrl;
        });
      }),
    );
  }
  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/png'),
  );
}

export function TilesView() {
  const folderHandle = useAtomValue(folderHandleAtom);
  const [tiles, setTiles] = useState<TileRecord[]>([]);
  const [tileCrops, setTileCrops] = useState<Map<number, string>>(new Map());
  const [stagingTiles, setStagingTiles] = useState<StagingTile[]>([]);
  const [modalTile, setModalTile] = useState<StagingTile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const stagingIdRef = useRef(0);

  useEffect(() => {
    if (!folderHandle) return;
    const handle = folderHandle;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [jsonFile, imgFile] = await Promise.all([
          readFile(handle, 'tilemap.json'),
          readFile(handle, 'tilemap.png'),
        ]);
        if (!jsonFile) {
          if (!cancelled) {
            setTiles([]);
            setLoading(false);
          }
          return;
        }
        const parsed: TileRecord[] = JSON.parse(await jsonFile.text());
        const frameCrops = imgFile
          ? await extractFrames(imgFile, parsed)
          : new Map<number, string>();
        if (!cancelled) {
          setTiles(parsed);
          setTileCrops(frameCrops);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load tilemap',
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [folderHandle]);

  async function handleUpload(files: File[]) {
    const allSlices = (await Promise.all(files.map(slicePng))).flat();
    setStagingTiles((prev) => [
      ...prev,
      ...allSlices.map((dataUrl) => ({ id: stagingIdRef.current++, dataUrl })),
    ]);
  }

  function handleModalSave(mode: string) {
    if (!modalTile) return;
    const nextFrame =
      tiles.length === 0 ? 0 : Math.max(...tiles.map((t) => t.frame)) + 1;
    setTiles((prev) => [...prev, { id: randId(), frame: nextFrame, mode }]);
    setTileCrops((prev) => {
      const next = new Map(prev);
      next.set(nextFrame, modalTile.dataUrl);
      return next;
    });
    setStagingTiles((prev) => prev.filter((t) => t.id !== modalTile.id));
    setModalTile(null);
  }

  async function handleSave() {
    if (!folderHandle || saving) return;
    setSaving(true);
    try {
      const sorted = [...tiles].sort((a, b) => a.frame - b.frame);
      const reindexed: TileRecord[] = sorted.map((t, i) => ({
        id: t.id ?? randId(),
        frame: i,
        mode: t.mode,
      }));
      const orderedCrops = sorted.map((t) => tileCrops.get(t.frame) ?? '');

      const jsonFh = await folderHandle.getFileHandle('tilemap.json', {
        create: true,
      });
      const jsonW = await (jsonFh as any).createWritable();
      await jsonW.write(JSON.stringify(reindexed, null, 2));
      await jsonW.close();

      const blob = await buildTilemapPng(orderedCrops);
      const pngFh = await folderHandle.getFileHandle('tilemap.png', {
        create: true,
      });
      const pngW = await (pngFh as any).createWritable();
      await pngW.write(blob);
      await pngW.close();

      const newCrops = new Map<number, string>();
      reindexed.forEach((t, i) => newCrops.set(t.frame, orderedCrops[i]));
      setTiles(reindexed);
      setTileCrops(newCrops);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveBlank() {
    const blanks = new Set(
      (
        await Promise.all(
          stagingTiles.map(async (t) =>
            (await isBlankTile(t.dataUrl)) ? t.id : null,
          ),
        )
      ).filter((id): id is number => id !== null),
    );
    setStagingTiles((prev) => prev.filter((t) => !blanks.has(t.id)));
  }

  async function handleDeduplicateStaging() {
    if (deduplicating) return;
    setDeduplicating(true);
    try {
      const savedKeys = new Set(
        await Promise.all([...tileCrops.values()].map(pixelKey)),
      );
      const stagingKeys = await Promise.all(
        stagingTiles.map(async (t) => ({ id: t.id, key: await pixelKey(t.dataUrl) })),
      );
      const toRemove = new Set(
        stagingKeys.filter(({ key }) => savedKeys.has(key)).map(({ id }) => id),
      );
      setStagingTiles((prev) => prev.filter((t) => !toRemove.has(t.id)));
    } finally {
      setDeduplicating(false);
    }
  }

  function handleDelete(frame: number) {
    setTiles((prev) => prev.filter((t) => t.frame !== frame));
    setTileCrops((prev) => {
      const next = new Map(prev);
      next.delete(frame);
      return next;
    });
  }

  if (loading)
    return (
      <EmptyState icon="⏳" label="Loading" sub="Reading tilemap files…" />
    );
  if (error) return <EmptyState icon="⚠️" label="Error" sub={error} />;

  return (
    <>
      <div className={s.root}>
        <TilesPanel
          tiles={tiles}
          tileCrops={tileCrops}
          saving={saving}
          onSave={handleSave}
          onDelete={handleDelete}
        />
        <StagingPanel
          stagingTiles={stagingTiles}
          deduplicating={deduplicating}
          onUpload={handleUpload}
          onRemoveBlank={handleRemoveBlank}
          onDeduplicate={handleDeduplicateStaging}
          onTileClick={setModalTile}
          onRemoveTile={(id) =>
            setStagingTiles((prev) => prev.filter((t) => t.id !== id))
          }
        />
      </div>

      {modalTile && (
        <ModeModal
          dataUrl={modalTile.dataUrl}
          tiles={tiles}
          tileCrops={tileCrops}
          onSave={handleModalSave}
          onClose={() => setModalTile(null)}
          onDelete={handleDelete}
          onDeleteSelf={() => {
            setStagingTiles((prev) =>
              prev.filter((t) => t.id !== modalTile.id),
            );
            setModalTile(null);
          }}
        />
      )}
    </>
  );
}
