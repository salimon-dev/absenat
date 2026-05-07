import { useState } from 'react';
import type { Biome, EntityType } from '@absenat/specs';
import { EntityTypeEnum } from '@absenat/specs';
import s from './Editor.module.css';

interface TileData {
  id: string;
  url: string;
  x: number;
  y: number;
}

interface FrameAttributes {
  walkable: boolean;
  zindex: number;
  passiveDamage: number;
}

interface EditorProps {
  tiles: (TileData | null)[];
  frameAttributes: (FrameAttributes | null)[];
  name: string;
  objectId: string;
  biomes: Biome[];
  type: EntityType;
  isSaving: boolean;
  isEditing: boolean;
  onNameChange: (name: string) => void;
  onObjectIdChange: (id: string) => void;
  onBiomesChange: (biomes: Biome[]) => void;
  onTypeChange: (type: EntityType) => void;
  onClearTile: (index: number) => void;
  onSwapTiles: (from: number, to: number) => void;
  onFrameAttributeChange: (index: number, attrs: FrameAttributes) => void;
  onCreateObject: () => void;
  onDeleteObject: () => void;
}

const ENTITY_TYPES = Object.values(EntityTypeEnum) as EntityType[];

const BIOMES = [
  'snow',
  'ice',
  'lava',
  'water',
  'grass',
  'marsh',
  'desert',
  'sand',
  'dirt',
  'wood',
] as Biome[];

const DEFAULT_ATTRS: FrameAttributes = {
  walkable: true,
  zindex: 1,
  passiveDamage: 0,
};

export function Editor({
  tiles,
  frameAttributes,
  name,
  objectId,
  biomes,
  type,
  isSaving,
  isEditing,
  onNameChange,
  onObjectIdChange,
  onBiomesChange,
  onTypeChange,
  onClearTile,
  onSwapTiles,
  onFrameAttributeChange,
  onCreateObject,
  onDeleteObject,
}: EditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dialogSlot, setDialogSlot] = useState<number | null>(null);

  const toggleBiome = (biome: Biome) => {
    if (biomes.includes(biome)) {
      onBiomesChange(biomes.filter((b) => b !== biome));
    } else {
      onBiomesChange([...biomes, biome]);
    }
  };

  const dialogAttrs =
    dialogSlot !== null
      ? (frameAttributes[dialogSlot] ?? DEFAULT_ATTRS)
      : DEFAULT_ATTRS;

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2 className={s.title}>
          {isEditing ? 'Edit Object' : 'Object Editor'}
        </h2>
        <div className={s.headerActions}>
          {isEditing && (
            <button
              className={s.deleteButton}
              onClick={onDeleteObject}
              disabled={isSaving}
            >
              Delete
            </button>
          )}
          <button
            className={s.clearButton}
            onClick={() => {
              tiles.forEach((_, i) => onClearTile(i));
              onNameChange('');
              onObjectIdChange('');
              onBiomesChange([]);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className={s.content}>
        <div className={s.field}>
          <label className={s.label}>Object ID</label>
          <input
            type="text"
            className={s.input}
            value={objectId}
            onChange={(e) => onObjectIdChange(e.target.value)}
            placeholder="e.g. tree_oak"
          />
        </div>

        <div className={s.field}>
          <div className={s.labelRow}>
            <label className={s.label}>Object Name</label>
          </div>
          <input
            type="text"
            className={s.input}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Ancient Oak"
          />
        </div>

        <div className={s.field}>
          <label className={s.label}>Object Type</label>
          <div className={s.biomes}>
            {ENTITY_TYPES.map((t) => (
              <button
                key={t}
                className={`${s.biomeButton} ${type === t ? s.active : ''}`}
                onClick={() => onTypeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Compatible Biomes</label>
          <div className={s.biomes}>
            {BIOMES.map((biome) => (
              <button
                key={biome}
                className={`${s.biomeButton} ${biomes.includes(biome) ? s.active : ''}`}
                onClick={() => toggleBiome(biome)}
              >
                {biome}
              </button>
            ))}
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Composition (3x3 Grid)</label>
          <div className={s.gridContainer}>
            <div className={s.grid}>
              {tiles.map((tile, i) => (
                <div
                  key={i}
                  className={[
                    s.slot,
                    dragIndex === i ? s.dragging : '',
                    dragOverIndex === i && dragIndex !== i ? s.dragOver : '',
                  ].join(' ')}
                  draggable={!!tile}
                  onClick={() => {
                    if (tile && dragIndex === null) setDialogSlot(i);
                  }}
                  title={
                    tile
                      ? 'Click to edit attributes · Drag to swap'
                      : 'Select a tile from Resources'
                  }
                  onDragStart={() => setDragIndex(i)}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIndex(i);
                  }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== i)
                      onSwapTiles(dragIndex, i);
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                >
                  {tile ? (
                    <img src={tile.url} alt={`Frame ${i}`} draggable={false} />
                  ) : (
                    <span className={s.slotIndex}>{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button
            className={s.saveButton}
            disabled={isSaving || !name || !objectId || tiles.every((t) => t === null)}
            onClick={onCreateObject}
          >
            {isSaving
              ? 'Saving…'
              : isEditing
                ? 'Update Asset Object'
                : 'Create Asset Object'}
          </button>
        </div>
      </div>

      {dialogSlot !== null && tiles[dialogSlot] && (
        <div className={s.dialogOverlay} onClick={() => setDialogSlot(null)}>
          <div className={s.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={s.dialogHeader}>
              <span className={s.dialogTitle}>
                Frame {dialogSlot + 1} Attributes
              </span>
              <button
                className={s.dialogClose}
                onClick={() => setDialogSlot(null)}
              >
                ×
              </button>
            </div>
            <div className={s.dialogBody}>
              <label className={s.dialogField}>
                <span className={s.dialogLabel}>Z-Index</span>
                <input
                  type="number"
                  className={s.dialogInput}
                  value={dialogAttrs.zindex}
                  onChange={(e) =>
                    onFrameAttributeChange(dialogSlot, {
                      ...dialogAttrs,
                      zindex: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </label>
              <label className={s.dialogCheckboxField}>
                <input
                  type="checkbox"
                  className={s.dialogCheckbox}
                  checked={dialogAttrs.walkable}
                  onChange={(e) =>
                    onFrameAttributeChange(dialogSlot, {
                      ...dialogAttrs,
                      walkable: e.target.checked,
                    })
                  }
                />
                <span className={s.dialogLabel}>Walkable</span>
              </label>
            </div>
            <div className={s.dialogFooter}>
              <button
                className={s.dialogRemove}
                onClick={() => {
                  onClearTile(dialogSlot);
                  setDialogSlot(null);
                }}
              >
                Remove Frame
              </button>
              <button
                className={s.dialogDone}
                onClick={() => setDialogSlot(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
