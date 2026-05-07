import { useState, useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import type { Entity, Biome, EntityType } from '@absenat/specs';
import { EntityTypeEnum } from '@absenat/specs';
import { folderHandleAtom } from '../../store';
import s from './ObjectsView.module.css';
import { Library } from './Library';
import { Editor } from './Editor';
import { Resources } from './Resources';

interface TileData {
  id: string;
  url: string;
  x: number;
  y: number;
}

type EntityFrame = Entity['frames'][number];

interface FrameAttributes {
  walkable: boolean;
  zindex: number;
  passiveDamage: number;
}

interface EntityMeta {
  id: string;
  name: string;
  biomes: Biome[];
  type: EntityType;
  size: { w: number; h: number };
}

async function readFileFromFolder(
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const SPRITE_COLS = 16;
const TILE_SIZE = 16;

const DEFAULT_FRAME_ATTRS: FrameAttributes = { walkable: false, zindex: 0, passiveDamage: 0 };

async function repackSprite(
  entityMetas: EntityMeta[],
  editorEntityId: string | null,
  editorSlots: Array<{ tile: TileData; i: number; attributes: FrameAttributes }>,
  existingEntities: Entity[],
  existingImg: HTMLImageElement | null,
): Promise<{ updatedEntities: Entity[]; canvas: HTMLCanvasElement }> {
  const totalFrames = entityMetas.reduce((sum, e) => {
    if (e.id === editorEntityId) return sum + editorSlots.length;
    return sum + (existingEntities.find((s) => s.id === e.id)?.frames.length ?? 0);
  }, 0);

  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_COLS * TILE_SIZE;
  canvas.height = Math.max(TILE_SIZE, Math.ceil(totalFrames / SPRITE_COLS) * TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  let frameIdx = 0;
  const updatedEntities: Entity[] = [];

  for (const meta of entityMetas) {
    const frames: EntityFrame[] = [];

    if (meta.id === editorEntityId) {
      for (const { tile, i, attributes } of editorSlots) {
        const img = await loadImage(tile.url);
        ctx.drawImage(
          img, 0, 0, TILE_SIZE, TILE_SIZE,
          (frameIdx % SPRITE_COLS) * TILE_SIZE,
          Math.floor(frameIdx / SPRITE_COLS) * TILE_SIZE,
          TILE_SIZE, TILE_SIZE,
        );
        frames.push({
          resourceId: 'entities.png',
          frame: frameIdx,
          position: { x: i % 3, y: Math.floor(i / 3) },
          attributes,
        });
        frameIdx++;
      }
    } else if (existingImg) {
      const existing = existingEntities.find((e) => e.id === meta.id);
      if (existing) {
        for (const ef of existing.frames) {
          ctx.drawImage(
            existingImg,
            (ef.frame % SPRITE_COLS) * TILE_SIZE,
            Math.floor(ef.frame / SPRITE_COLS) * TILE_SIZE,
            TILE_SIZE, TILE_SIZE,
            (frameIdx % SPRITE_COLS) * TILE_SIZE,
            Math.floor(frameIdx / SPRITE_COLS) * TILE_SIZE,
            TILE_SIZE, TILE_SIZE,
          );
          frames.push({ ...ef, frame: frameIdx });
          frameIdx++;
        }
      }
    }

    updatedEntities.push({ ...meta, frames } as Entity);
  }

  return { updatedEntities, canvas };
}

async function writeFiles(
  folderHandle: FileSystemDirectoryHandle,
  entities: Entity[],
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );

  const jsonFH = await folderHandle.getFileHandle('entities.json', { create: true });
  const jsonWr = await jsonFH.createWritable();
  await jsonWr.write(JSON.stringify(entities, null, 2));
  await jsonWr.close();

  const pngFH = await folderHandle.getFileHandle('entities.png', { create: true });
  const pngWr = await pngFH.createWritable();
  await pngWr.write(blob);
  await pngWr.close();

  return blob;
}

export function ObjectsView() {
  const folderHandle = useAtomValue(folderHandleAtom);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storedObjects, setEntitys] = useState<Entity[]>([]);
  const [isLoadingStored, setIsLoadingStored] = useState(true);
  const [entitySpriteUrl, setEntitySpriteUrl] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!folderHandle) return;
    const handle = folderHandle;
    let cancelled = false;
    let blobUrl: string | undefined;

    async function loadEntities() {
      try {
        const [jsonFile, pngFile] = await Promise.all([
          readFileFromFolder(handle, 'entities.json'),
          readFileFromFolder(handle, 'entities.png'),
        ]);
        if (!cancelled) {
          if (jsonFile) {
            const data = JSON.parse(await jsonFile.text());
            setEntitys(data);
          }
          if (pngFile) {
            blobUrl = URL.createObjectURL(pngFile);
            setEntitySpriteUrl(blobUrl);
          }
        }
      } catch (err) {
        console.warn('Could not load entities:', err);
      } finally {
        if (!cancelled) setIsLoadingStored(false);
      }
    }
    loadEntities();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [folderHandle]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const cols = Math.floor(img.width / TILE_SIZE);
        const rows = Math.floor(img.height / TILE_SIZE);
        const newTiles: TileData[] = [];

        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
              ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
              newTiles.push({
                id: `${x}-${y}-${Date.now()}-${Math.random()}`,
                url: canvas.toDataURL('image/png'),
                x,
                y,
              });
            }
          }
        }

        setTiles((prev) => [...prev, ...newTiles]);
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteTile = (id: string) => {
    setTiles((prev) => prev.filter((t) => t.id !== id));
  };

  const [editorTiles, setEditorTiles] = useState<(TileData | null)[]>(Array(9).fill(null));
  const [editorFrameAttributes, setEditorFrameAttributes] = useState<(FrameAttributes | null)[]>(Array(9).fill(null));
  const [objectName, setObjectName] = useState('');
  const [objectId, setObjectId] = useState('');
  const [selectedBiomes, setSelectedBiomes] = useState<Biome[]>([]);
  const [selectedType, setSelectedType] = useState<EntityType>(EntityTypeEnum.Tree);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);

  const resetEditor = () => {
    setEditorTiles(Array(9).fill(null));
    setEditorFrameAttributes(Array(9).fill(null));
    setObjectName('');
    setObjectId('');
    setSelectedBiomes([]);
    setSelectedType(EntityTypeEnum.Tree);
    setEditingEntity(null);
  };

  const handleFrameAttributeChange = (index: number, attrs: FrameAttributes) => {
    setEditorFrameAttributes((prev) => {
      const next = [...prev];
      next[index] = attrs;
      return next;
    });
  };

  const handleSelectEntity = async (entity: Entity) => {
    if (!entitySpriteUrl) return;
    const img = await loadImage(entitySpriteUrl);
    const canvas = document.createElement('canvas');
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const ctx = canvas.getContext('2d')!;
    const newEditorTiles: (TileData | null)[] = Array(9).fill(null);
    const newFrameAttributes: (FrameAttributes | null)[] = Array(9).fill(null);
    for (const frame of entity.frames) {
      ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
      ctx.drawImage(
        img,
        (frame.frame % SPRITE_COLS) * TILE_SIZE,
        Math.floor(frame.frame / SPRITE_COLS) * TILE_SIZE,
        TILE_SIZE, TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE,
      );
      const slotIndex = frame.position.x + frame.position.y * 3;
      newEditorTiles[slotIndex] = {
        id: `entity-frame-${frame.frame}-${Date.now()}`,
        url: canvas.toDataURL('image/png'),
        x: frame.frame % SPRITE_COLS,
        y: Math.floor(frame.frame / SPRITE_COLS),
      };
      newFrameAttributes[slotIndex] = {
        walkable: frame.attributes.walkable,
        zindex: frame.attributes.zindex ?? 0,
        passiveDamage: frame.attributes.passiveDamage,
      };
    }
    setEditorTiles(newEditorTiles);
    setEditorFrameAttributes(newFrameAttributes);
    setObjectName(entity.name);
    setObjectId(entity.id);
    setSelectedBiomes(entity.biomes);
    setSelectedType(entity.type);
    setEditingEntity(entity);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteEntity = async () => {
    if (!folderHandle || !editingEntity) return;

    setIsSaving(true);
    try {
      const remainingMetas: EntityMeta[] = storedObjects
        .filter((e) => e.id !== editingEntity.id)
        .map(({ id, name, biomes, type, size }) => ({ id, name, biomes, type, size }));

      let existingImg: HTMLImageElement | null = null;
      const existingPngFile = await readFileFromFolder(folderHandle, 'entities.png');
      if (existingPngFile) {
        const blobUrl = URL.createObjectURL(existingPngFile);
        existingImg = await loadImage(blobUrl);
        URL.revokeObjectURL(blobUrl);
      }

      const { updatedEntities, canvas } = await repackSprite(
        remainingMetas, null, [], storedObjects, existingImg,
      );

      const blob = await writeFiles(folderHandle, updatedEntities, canvas);
      if (entitySpriteUrl) URL.revokeObjectURL(entitySpriteUrl);
      setEntitySpriteUrl(URL.createObjectURL(blob));
      setEntitys(updatedEntities);
      resetEditor();
    } catch (err) {
      console.error('Failed to delete object:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTileToEditor = (tile: TileData) => {
    setEditorTiles((prev) => {
      const firstEmpty = prev.findIndex((t) => t === null);
      if (firstEmpty === -1) return prev;
      const next = [...prev];
      next[firstEmpty] = tile;
      return next;
    });
  };

  const handleClearEditorTile = (index: number) => {
    setEditorTiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setEditorFrameAttributes((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSwapEditorTiles = (from: number, to: number) => {
    setEditorTiles((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const handleCreateObject = async () => {
    if (!folderHandle || !objectName) return;

    const filledSlots = editorTiles
      .map((tile, i) => tile ? { tile, i, attributes: editorFrameAttributes[i] ?? DEFAULT_FRAME_ATTRS } : null)
      .filter((x): x is { tile: TileData; i: number; attributes: FrameAttributes } => x !== null);

    if (filledSlots.length === 0) return;

    setIsSaving(true);
    try {
      let existingImg: HTMLImageElement | null = null;
      const existingPngFile = await readFileFromFolder(folderHandle, 'entities.png');
      if (existingPngFile) {
        const blobUrl = URL.createObjectURL(existingPngFile);
        existingImg = await loadImage(blobUrl);
        URL.revokeObjectURL(blobUrl);
      }

      const positions = filledSlots.map(({ i }) => ({ x: i % 3, y: Math.floor(i / 3) }));
      const minX = Math.min(...positions.map((p) => p.x));
      const minY = Math.min(...positions.map((p) => p.y));
      const maxX = Math.max(...positions.map((p) => p.x));
      const maxY = Math.max(...positions.map((p) => p.y));

      const newEntityId = objectId;
      const newMeta: EntityMeta = {
        id: newEntityId,
        name: objectName,
        biomes: selectedBiomes,
        type: selectedType,
        size: { w: maxX - minX + 1, h: maxY - minY + 1 },
      };

      const entityList: EntityMeta[] = editingEntity
        ? storedObjects.map((e) =>
            e.id === editingEntity.id
              ? newMeta
              : { id: e.id, name: e.name, biomes: e.biomes, type: e.type, size: e.size },
          )
        : [
            ...storedObjects.map(({ id, name, biomes, type, size }) => ({ id, name, biomes, type, size })),
            newMeta,
          ];

      const { updatedEntities, canvas } = await repackSprite(
        entityList, newEntityId, filledSlots, storedObjects, existingImg,
      );

      const blob = await writeFiles(folderHandle, updatedEntities, canvas);
      if (entitySpriteUrl) URL.revokeObjectURL(entitySpriteUrl);
      setEntitySpriteUrl(URL.createObjectURL(blob));
      setEntitys(updatedEntities);
      resetEditor();
    } catch (err) {
      console.error('Failed to save object:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.title}>Asset Manager</h1>
        </div>

        <button
          className={s.uploadButton}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className={s.btnIcon}>📁</span>
          Upload Sprite Sheet
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png"
        style={{ display: 'none' }}
      />

      <div className={s.mainContent}>
        <Library
          objects={storedObjects}
          isLoading={isLoadingStored}
          spriteUrl={entitySpriteUrl}
          selectedId={editingEntity?.id}
          onSelect={handleSelectEntity}
        />
        <Editor
          tiles={editorTiles}
          frameAttributes={editorFrameAttributes}
          name={objectName}
          biomes={selectedBiomes}
          type={selectedType}
          isSaving={isSaving}
          isEditing={editingEntity !== null}
          objectId={objectId}
          onNameChange={setObjectName}
          onObjectIdChange={setObjectId}
          onBiomesChange={setSelectedBiomes}
          onTypeChange={setSelectedType}
          onClearTile={handleClearEditorTile}
          onSwapTiles={handleSwapEditorTiles}
          onFrameAttributeChange={handleFrameAttributeChange}
          onCreateObject={handleCreateObject}
          onDeleteObject={handleDeleteEntity}
        />
        <Resources
          tiles={tiles}
          isProcessing={isProcessing}
          onDeleteTile={handleDeleteTile}
          onSelectTile={handleAddTileToEditor}
        />
      </div>
    </div>
  );
}
