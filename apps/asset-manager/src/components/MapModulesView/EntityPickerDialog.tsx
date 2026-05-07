import { useState } from 'react';
import type { Entity } from '@absenat/specs';
import s from './EntityPickerDialog.module.css';

const FRAME_PX = 32;

interface EntityFrameCrop {
  position: { x: number; y: number };
  dataUrl: string;
}

interface EntityPickerDialogProps {
  entities: Entity[];
  entityFrameCrops: Map<string, EntityFrameCrop[]>;
  onSelect: (entity: Entity) => void;
  onClose: () => void;
}

export function EntityPickerDialog({ entities, entityFrameCrops, onSelect, onClose }: EntityPickerDialogProps) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? entities.filter(
        (e) =>
          e.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          e.type.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : entities;

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div className={s.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <span className={s.title}>Set Object</span>
          <button className={s.closeBtn} onClick={onClose}>×</button>
        </div>
        <input
          className={s.search}
          type="search"
          placeholder="Search by name or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        {filtered.length === 0 ? (
          <p className={s.empty}>No entities match</p>
        ) : (
          <div className={s.list}>
            {filtered.map((entity) => {
              const crops = entityFrameCrops.get(entity.id) ?? [];
              const { w, h } = entity.size;
              return (
                <button
                  key={entity.id}
                  className={s.entityBtn}
                  onClick={() => onSelect(entity)}
                  title={`${entity.name} (${entity.type})`}
                >
                  <div
                    className={s.entityPreview}
                    style={{
                      gridTemplateColumns: `repeat(${w}, ${FRAME_PX}px)`,
                      gridTemplateRows: `repeat(${h}, ${FRAME_PX}px)`,
                      width: w * FRAME_PX,
                      height: h * FRAME_PX,
                    }}
                  >
                    {Array.from({ length: w * h }, (_, i) => {
                      const px = i % w;
                      const py = Math.floor(i / w);
                      const frame = crops.find((f) => f.position.x === px && f.position.y === py);
                      return (
                        <div key={i} style={{ width: FRAME_PX, height: FRAME_PX }}>
                          {frame && (
                            <img
                              src={frame.dataUrl}
                              className={s.entityFrame}
                              alt=""
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className={s.entityInfo}>
                    <span className={s.entityName}>{entity.name}</span>
                    <span className={s.entityMeta}>{entity.type} · {w}×{h}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
