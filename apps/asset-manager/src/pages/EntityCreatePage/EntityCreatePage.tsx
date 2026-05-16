import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { EntityTypeEnum, Biome } from '@absenat/specs';
import type { AssetSchema, Entity, EntityFrame } from '@absenat/specs';
import { folderHandleAtom } from '../../store';
import { readAssets } from '../../lib/assetsDb';
import { AssetPickerDialog } from '../../components/AssetPickerDialog/AssetPickerDialog';
import { AssetPreview } from '../../components/AssetPreview/AssetPreview';
import s from './EntityCreatePage.module.css';

type TileSelection = {
  frame: number;
  row: number;
  col: number;
};

type TileAssetMap = Record<string, string>;

function getTileKey(frame: number, col: number, row: number): string {
  return `${frame}:${col}:${row}`;
}

function buildFrames(count: number, w: number, h: number, tileAssets: TileAssetMap): EntityFrame[] {
  return Array.from({ length: count }, (_, i) => ({
    order: i,
    tiles: Array.from({ length: h }, (_, row) =>
      Array.from({ length: w }, (_, col) => ({
        id: crypto.randomUUID(),
        assetId: tileAssets[getTileKey(i, col, row)],
        position: { x: col, y: row },
        attributes: { walkable: true, zIndex: 0, effect: {} },
      }))
    ).flat(),
  }));
}

async function saveEntity(root: FileSystemDirectoryHandle, entity: Entity): Promise<void> {
  let entities: Entity[];
  try {
    const fh = await root.getFileHandle('entities.json');
    entities = JSON.parse(await (await fh.getFile()).text());
  } catch {
    entities = [];
  }
  entities.push(entity);
  const fh = await root.getFileHandle('entities.json', { create: true });
  const w = await fh.createWritable();
  await w.write(JSON.stringify(entities, null, 2));
  await w.close();
}

export function EntityCreatePage() {
  const navigate = useNavigate();
  const folderHandle = useAtomValue(folderHandleAtom)!;

  const [name, setName] = useState('');
  const [id, setId] = useState<string>(() => crypto.randomUUID());
  const [type, setType] = useState<string>(EntityTypeEnum.Tree);
  const [biomes, setBiomes] = useState<string[]>([]);
  const [sizeW, setSizeW] = useState(1);
  const [sizeH, setSizeH] = useState(1);
  const [animateSpeed, setAnimateSpeed] = useState(0);
  const [frameCount, setFrameCount] = useState(1);
  const [activeFrame, setActiveFrame] = useState(0);
  const [assets, setAssets] = useState<AssetSchema[]>([]);
  const [tileAssets, setTileAssets] = useState<TileAssetMap>({});
  const [pickerTile, setPickerTile] = useState<TileSelection | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readAssets(folderHandle).then(setAssets);
  }, [folderHandle]);

  function toggleBiome(biome: string) {
    setBiomes(prev => prev.includes(biome) ? prev.filter(b => b !== biome) : [...prev, biome]);
  }

  function addFrame() {
    setFrameCount(prev => prev + 1);
    setActiveFrame(frameCount);
  }

  function removeFrame(fi: number) {
    if (frameCount === 1) return;
    setTileAssets(prev => removeFrameSelections(prev, fi));
    setFrameCount(prev => prev - 1);
    setActiveFrame(prev => (prev >= fi && prev > 0) ? prev - 1 : prev);
    setPickerTile(null);
  }

  function handleAssetSelect(asset: AssetSchema) {
    if (!pickerTile) return;
    const key = getTileKey(pickerTile.frame, pickerTile.col, pickerTile.row);
    setTileAssets(prev => ({ ...prev, [key]: asset.id }));
    setPickerTile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const entity: Entity = {
        id,
        name,
        type: type as Entity['type'],
        biomes: biomes as Entity['biomes'],
        size: { w: sizeW, h: sizeH },
        animateSpeed,
        frames: buildFrames(frameCount, sizeW, sizeH, tileAssets),
      };
      await saveEntity(folderHandle, entity);
      navigate('/entities');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setSaving(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <button type="button" className={s.back} onClick={() => navigate('/entities')}>← Back</button>
        <h1 className={s.title}>Create Entity</h1>
      </div>

      <form className={s.form} onSubmit={handleSubmit}>
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Basic Info</h2>
          <div className={s.fieldsGrid}>
            <div className={s.row}>
              <label className={s.label}>Name</label>
              <input className={s.input} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className={s.row}>
              <label className={s.label}>ID</label>
              <input className={s.input} value={id} onChange={e => setId(e.target.value)} required />
            </div>
            <div className={s.row}>
              <label className={s.label}>Type</label>
              <select className={s.select} value={type} onChange={e => setType(e.target.value)}>
                {Object.values(EntityTypeEnum).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={s.label} style={{ marginBottom: 8, display: 'block' }}>Biomes</label>
            <div className={s.checkGrid}>
              {Object.values(Biome).map(b => (
                <label key={b} className={s.checkLabel}>
                  <input type="checkbox" checked={biomes.includes(b)} onChange={() => toggleBiome(b)} />
                  {b}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Frames</h2>

          <div className={s.framesMeta}>
            <div className={s.row}>
              <label className={s.label}>Size (tiles)</label>
              <div className={s.inlineRow}>
                <input className={s.inputSmall} type="number" min={1} value={sizeW} onChange={e => setSizeW(Number(e.target.value))} placeholder="W" />
                <input className={s.inputSmall} type="number" min={1} value={sizeH} onChange={e => setSizeH(Number(e.target.value))} placeholder="H" />
              </div>
            </div>
            <div className={s.row}>
              <label className={s.label}>Animate Speed (fps)</label>
              <input className={s.inputSmall} type="number" min={0} value={animateSpeed} onChange={e => setAnimateSpeed(Number(e.target.value))} />
            </div>
          </div>

          <div className={s.frameTabs}>
            {Array.from({ length: frameCount }, (_, i) => (
              <div key={i} className={s.frameTab}>
                <button
                  type="button"
                  className={`${s.frameTabBtn} ${i === activeFrame ? s.frameTabBtnActive : ''}`}
                  onClick={() => setActiveFrame(i)}
                >
                  {i}
                </button>
                {frameCount > 1 && (
                  <button
                    type="button"
                    className={s.frameTabRemove}
                    onClick={() => removeFrame(i)}
                    title="Remove frame"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className={s.addBtn} onClick={addFrame}>+</button>
          </div>

          <div className={s.frameBody}>
            <div className={s.frameDetails} />
            <div
              className={s.tileGrid}
              style={{ gridTemplateColumns: `repeat(${sizeW}, 64px)`, gridTemplateRows: `repeat(${sizeH}, 64px)` }}
            >
              {Array.from({ length: sizeH }, (_, row) =>
                Array.from({ length: sizeW }, (_, col) => {
                  const selectedAsset = findTileAsset(assets, tileAssets, activeFrame, col, row);

                  return (
                    <button
                      type="button"
                      key={`${row}-${col}`}
                      className={`${s.tileGridCell} ${selectedAsset ? s.tileGridCellFilled : ''}`}
                      title={`(${col}, ${row})`}
                      onClick={() => setPickerTile({ frame: activeFrame, row, col })}
                    >
                      {selectedAsset && (
                        <AssetPreview asset={selectedAsset} folderHandle={folderHandle} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {error && <p className={s.error}>{error}</p>}

        <div className={s.actions}>
          <button type="button" className={s.cancelBtn} onClick={() => navigate('/entities')}>Cancel</button>
          <button type="submit" className={s.saveBtn} disabled={saving}>{saving ? 'Saving…' : 'Save Entity'}</button>
        </div>
      </form>

      {pickerTile && (
        <AssetPickerDialog
          assets={assets}
          selectedAssetId={tileAssets[getTileKey(pickerTile.frame, pickerTile.col, pickerTile.row)]}
          folderHandle={folderHandle}
          onClose={() => setPickerTile(null)}
          onSelect={handleAssetSelect}
        />
      )}
    </div>
  );
}

function findTileAsset(
  assets: AssetSchema[],
  tileAssets: TileAssetMap,
  frame: number,
  col: number,
  row: number,
): AssetSchema | undefined {
  const assetId = tileAssets[getTileKey(frame, col, row)];
  return assets.find(asset => asset.id === assetId);
}

function removeFrameSelections(tileAssets: TileAssetMap, removedFrame: number): TileAssetMap {
  const next: TileAssetMap = {};

  for (const [key, assetId] of Object.entries(tileAssets)) {
    const movedKey = moveFrameKey(key, removedFrame);
    if (movedKey) next[movedKey] = assetId;
  }

  return next;
}

function moveFrameKey(key: string, removedFrame: number): string | null {
  const [framePart, col, row] = key.split(':');
  const frame = Number(framePart);
  if (frame === removedFrame) return null;
  if (frame > removedFrame) return `${frame - 1}:${col}:${row}`;
  return key;
}
