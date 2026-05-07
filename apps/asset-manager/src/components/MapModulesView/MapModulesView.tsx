import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import Phaser, { Game, AUTO } from 'phaser';
import { MapModuleScene } from './MapModuleScene';
import { TilePickerDialog } from './TilePickerDialog';
import { EntityPickerDialog } from './EntityPickerDialog';
import { SaveModuleDialog } from './SaveModuleDialog';
import { folderHandleAtom } from '../../store';
import type { TileRecord } from '../TilesView/types';
import type { Entity, MapModule, MapModuleType } from '@absenat/specs';
import s from './MapModulesView.module.css';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function genId() {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

const TILE_SIZE = 16;
const SCALE = 3;
const GRID_COLS = 20;
const GRID_ROWS = 20;
const CANVAS_W = TILE_SIZE * GRID_COLS;
const CANVAS_H = TILE_SIZE * GRID_ROWS;

type EntityFrameCrop = { position: { x: number; y: number }; dataUrl: string };

async function loadEntities(dir: FileSystemDirectoryHandle): Promise<{
  entities: Entity[];
  previews: Map<string, string>;
  frameCrops: Map<string, EntityFrameCrop[]>;
}> {
  try {
    const fh = await dir.getFileHandle('entities.json');
    const file = await fh.getFile();
    const entities: Entity[] = JSON.parse(await file.text());

    // Collect unique resourceIds across all entity frames
    const resourceIds = new Set<string>();
    for (const entity of entities) {
      for (const frame of entity.frames) {
        if (frame.resourceId) resourceIds.add(frame.resourceId);
      }
    }

    if (resourceIds.size === 0) return { entities, previews: new Map(), frameCrops: new Map() };

    // Load each resource PNG
    const resourceImgs = new Map<string, HTMLImageElement>();
    await Promise.all(
      Array.from(resourceIds).map(
        (resourceId) =>
          new Promise<void>((res) => {
            dir.getFileHandle(resourceId).then(
              (rfh) =>
                rfh.getFile().then((f) => {
                  const url = URL.createObjectURL(f);
                  const img = new Image();
                  img.onload = () => {
                    resourceImgs.set(resourceId, img);
                    URL.revokeObjectURL(url);
                    res();
                  };
                  img.onerror = () => { URL.revokeObjectURL(url); res(); };
                  img.src = url;
                }),
              () => res(),
            );
          }),
      ),
    );

    const previews = new Map<string, string>();
    const frameCrops = new Map<string, EntityFrameCrop[]>();
    const scratch = document.createElement('canvas');
    scratch.width = TILE_SIZE;
    scratch.height = TILE_SIZE;
    const ctx = scratch.getContext('2d')!;

    for (const entity of entities) {
      if (entity.frames.length === 0) continue;
      const crops: EntityFrameCrop[] = [];
      for (const frame of entity.frames) {
        const img = resourceImgs.get(frame.resourceId);
        if (!img) continue;
        const cols = Math.max(1, Math.floor(img.width / TILE_SIZE));
        const srcCol = frame.frame % cols;
        const srcRow = Math.floor(frame.frame / cols);
        ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.drawImage(img, srcCol * TILE_SIZE, srcRow * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
        crops.push({ position: frame.position, dataUrl: scratch.toDataURL() });
      }
      if (crops.length === 0) continue;
      frameCrops.set(entity.id, crops);
      previews.set(entity.id, crops[0].dataUrl);
    }

    return { entities, previews, frameCrops };
  } catch {
    return { entities: [], previews: new Map(), frameCrops: new Map() };
  }
}

async function loadTiles(
  dir: FileSystemDirectoryHandle,
): Promise<{ tiles: TileRecord[]; crops: Map<number, string> }> {
  try {
    const fh = await dir.getFileHandle('tilemap.json');
    const file = await fh.getFile();
    const tiles: TileRecord[] = JSON.parse(await file.text());

    let imgFile: File | null = null;
    try {
      imgFile = await (await dir.getFileHandle('tilemap.png')).getFile();
    } catch {
      // no image
    }

    if (!imgFile) return { tiles, crops: new Map() };

    return new Promise((resolve) => {
      const url = URL.createObjectURL(imgFile!);
      const img = new Image();
      img.onload = () => {
        const cols = Math.max(1, Math.floor(img.width / TILE_SIZE));
        const crops = new Map<number, string>();
        for (const tile of tiles) {
          const col = tile.frame % cols;
          const row = Math.floor(tile.frame / cols);
          const canvas = document.createElement('canvas');
          canvas.width = TILE_SIZE;
          canvas.height = TILE_SIZE;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
          crops.set(tile.frame, canvas.toDataURL());
        }
        URL.revokeObjectURL(url);
        resolve({ tiles, crops });
      };
      img.onerror = () => resolve({ tiles, crops: new Map() });
      img.src = url;
    });
  } catch {
    return { tiles: [], crops: new Map() };
  }
}

export function MapModulesView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const folderHandle = useAtomValue(folderHandleAtom);

  const [tiles, setTiles] = useState<TileRecord[]>([]);
  const [tileCrops, setTileCrops] = useState<Map<number, string>>(new Map());
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityFrameCrops, setEntityFrameCrops] = useState<Map<string, { position: { x: number; y: number }; dataUrl: string }[]>>(new Map());
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [modules, setModules] = useState<MapModule[]>([]);
  const [editingModule, setEditingModule] = useState<{ module: MapModule; index: number } | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Game({
      type: AUTO,
      width: CANVAS_W,
      height: CANVAS_H,
      zoom: SCALE,
      parent: containerRef.current,
      scene: [MapModuleScene],
      backgroundColor: '#1a1a2e',
      pixelArt: true,
      render: { antialias: false, roundPixels: true },
    });

    game.events.once(Phaser.Core.Events.READY, () => {
      const scene = game.scene.getScene('MapModuleScene') as MapModuleScene;
      scene.onSelectionChange = setSelectedCount;
    });

    gameRef.current = game;

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!folderHandle) return;
    loadTiles(folderHandle).then(({ tiles: t, crops }) => {
      setTiles(t);
      setTileCrops(crops);
    });
    loadEntities(folderHandle).then(({ entities: e, frameCrops }) => {
      setEntities(e);
      setEntityFrameCrops(frameCrops);
    });
    loadModulesFromFolder(folderHandle).then(setModules);
  }, [folderHandle]);

  async function loadModulesFromFolder(dir: FileSystemDirectoryHandle): Promise<MapModule[]> {
    try {
      const fh = await dir.getFileHandle('modules.data');
      const text = await (await fh.getFile()).text();
      return text
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [id, name, type, tilesStr, entitiesStr] = line.split('#');
          const tiles = tilesStr ? tilesStr.split(':') : [];
          const entities = entitiesStr
            ? entitiesStr.split(':').filter(Boolean).map((e) => {
                const [eid, col, row] = e.split(',');
                return { id: eid, col: Number(col), row: Number(row) };
              })
            : [];
          return { id, name, type: type as MapModuleType, tiles, entities };
        });
    } catch {
      return [];
    }
  }

  async function writeModules(updated: MapModule[]) {
    if (!folderHandle) return;
    const withIds = updated.map((m) => (m.id ? m : { ...m, id: genId() }));
    const lines = withIds.map((m) => {
      const tiles = m.tiles.join(':');
      const entities = (m.entities || []).map((e) => `${e.id},${e.col},${e.row}`).join(':');
      return `${m.id}#${m.name}#${m.type}#${tiles}#${entities}`;
    });
    const fh = await folderHandle.getFileHandle('modules.data', { create: true });
    const w = await (fh as any).createWritable();
    await w.write(lines.join('\n'));
    await w.close();
    setModules(withIds);
  }

  function handleLoadModule(index: number) {
    const scene = gameRef.current?.scene.getScene('MapModuleScene') as MapModuleScene | undefined;
    if (!scene) return;
    const mod = modules[index];
    scene.loadModule(mod.tiles, mod.entities, tiles, tileCrops, entityFrameCrops);
    setActiveModuleIndex(index);
    setSaveError(null);
  }

  async function handleDeleteModule(index: number) {
    if (activeModuleIndex === index) setActiveModuleIndex(null);
    const updated = modules.filter((_, i) => i !== index);
    await writeModules(updated);
  }

  async function handleEditModule(name: string, type: MapModuleType) {
    if (!editingModule) return;
    const updated = modules.map((m, i) =>
      i === editingModule.index ? { ...m, name, type } : m,
    );
    await writeModules(updated);
    setEditingModule(null);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    const scene = gameRef.current?.scene.getScene('MapModuleScene') as MapModuleScene | undefined;
    if (!scene || scene.getSelectedCount() === 0) return;
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }

  function openSaveDialog(asNew: boolean) {
    setSaveError(null);
    const scene = gameRef.current?.scene.getScene('MapModuleScene') as MapModuleScene | undefined;
    if (!scene) return;
    const unassigned = scene.getUnassignedCount();
    if (unassigned > 0) {
      setSaveError(`${unassigned} tile${unassigned === 1 ? '' : 's'} not drawn`);
      return;
    }
    setSaveAsNew(asNew);
    setShowSaveDialog(true);
  }

  function handleSave() { openSaveDialog(false); }
  function handleSaveAsNew() { openSaveDialog(true); }

  async function handleSaveModule(name: string, type: MapModuleType) {
    setShowSaveDialog(false);
    const scene = gameRef.current?.scene.getScene('MapModuleScene') as MapModuleScene | undefined;
    if (!scene) return;

    const { tiles: modTiles, entities: modEntities } = scene.getModuleData();

    if (activeModuleIndex !== null && !saveAsNew) {
      const updated = modules.map((m, i) =>
        i === activeModuleIndex ? { ...m, name, type, tiles: modTiles, entities: modEntities } : m,
      );
      await writeModules(updated);
    } else {
      const newModule: MapModule = { id: genId(), name, type, tiles: modTiles, entities: modEntities };
      await writeModules([...modules, newModule]);
    }
  }

  function handleSetTiles() {
    setCtxMenu(null);
    setShowPicker(true);
  }

  function handleSetObjects() {
    setCtxMenu(null);
    setShowEntityPicker(true);
  }

  function handleTileSelected(tile: TileRecord) {
    setShowPicker(false);
    const scene = gameRef.current?.scene.getScene('MapModuleScene') as MapModuleScene | undefined;
    if (!scene) return;
    const dataUrl = tileCrops.get(tile.frame);
    if (!dataUrl) return;
    scene.assignFrameToSelected(tile.frame, dataUrl, tile.id ?? String(tile.frame));
  }

  function handleEntitySelected(entity: Entity) {
    setShowEntityPicker(false);
    const scene = gameRef.current?.scene.getScene('MapModuleScene') as MapModuleScene | undefined;
    if (!scene) return;
    const frames = entityFrameCrops.get(entity.id);
    if (!frames || frames.length === 0) return;
    scene.assignEntityToSelected(entity.id, frames);
  }

  return (
    <div className={s.root}>
      <header className={s.toolbar}>
        <button
          className={s.toolbarBtn}
          disabled={selectedCount === 0}
          onClick={handleSetTiles}
        >
          Set Tiles
        </button>
        <button
          className={s.toolbarBtn}
          disabled={selectedCount === 0}
          onClick={handleSetObjects}
        >
          Set Objects
        </button>
        <button className={s.toolbarBtn} onClick={handleSave}>
          Save
        </button>
        {activeModuleIndex !== null && (
          <button className={s.toolbarBtn} onClick={handleSaveAsNew}>
            Save as New
          </button>
        )}
        {saveError && <span className={s.toolbarError}>{saveError}</span>}
      </header>

      <div className={s.body}>
        <aside className={s.sidebar}>
          <div className={s.sidebarTitle}>Modules</div>
          {modules.length === 0 && (
            <div className={s.sidebarEmpty}>No modules saved</div>
          )}
          {modules.map((mod, i) => (
            <div key={mod.id || i} className={`${s.moduleRow}${activeModuleIndex === i ? ` ${s.moduleRowActive}` : ''}`}>
              <div className={s.moduleInfo}>
                <span className={s.moduleName}>{mod.name}</span>
                <span className={s.moduleType}>{mod.type}</span>
              </div>
              <div className={s.moduleActions}>
                <button
                  className={s.moduleBtn}
                  title="Load"
                  onClick={() => handleLoadModule(i)}
                >
                  ▶
                </button>
                <button
                  className={s.moduleBtn}
                  title="Edit"
                  onClick={() => setEditingModule({ module: mod, index: i })}
                >
                  ✎
                </button>
                <button
                  className={`${s.moduleBtn} ${s.moduleBtnDelete}`}
                  title="Delete"
                  onClick={() => handleDeleteModule(i)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </aside>

        <div
          ref={containerRef}
          className={s.canvas}
          onContextMenu={handleContextMenu}
          onClick={() => setCtxMenu(null)}
          onWheel={(e) => e.preventDefault()}
        />
      </div>

      {ctxMenu && (
        <ul
          className={s.ctxMenu}
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <li className={s.ctxItem} onClick={handleSetTiles}>
            Set Tiles…
          </li>
          <li className={s.ctxItem} onClick={handleSetObjects}>
            Set Objects…
          </li>
        </ul>
      )}

      {showPicker && (
        <TilePickerDialog
          tiles={tiles}
          tileCrops={tileCrops}
          onSelect={handleTileSelected}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showEntityPicker && (
        <EntityPickerDialog
          entities={entities}
          entityFrameCrops={entityFrameCrops}
          onSelect={handleEntitySelected}
          onClose={() => setShowEntityPicker(false)}
        />
      )}

      {showSaveDialog && (
        <SaveModuleDialog
          initialName={activeModuleIndex !== null && !saveAsNew ? modules[activeModuleIndex]?.name : undefined}
          initialType={activeModuleIndex !== null && !saveAsNew ? modules[activeModuleIndex]?.type : undefined}
          onSave={handleSaveModule}
          onClose={() => setShowSaveDialog(false)}
        />
      )}

      {editingModule && (
        <SaveModuleDialog
          initialName={editingModule.module.name}
          initialType={editingModule.module.type}
          onSave={handleEditModule}
          onClose={() => setEditingModule(null)}
        />
      )}
    </div>
  );
}
