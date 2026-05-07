import { useState } from 'react';
import type { Entity } from '@absenat/specs';
import s from './Library.module.css';

interface LibraryProps {
  objects: Entity[];
  isLoading: boolean;
  spriteUrl?: string;
  selectedId?: string;
  onSelect: (entity: Entity) => void;
}

export function Library({ objects, isLoading, spriteUrl, selectedId, onSelect }: LibraryProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? objects.filter((obj) => {
        const q = query.toLowerCase();
        return (
          obj.id.toLowerCase().includes(q) ||
          obj.name.toLowerCase().includes(q) ||
          obj.type.toLowerCase().includes(q) ||
          obj.biomes.some((b) => b.toLowerCase().includes(q))
        );
      })
    : objects;

  return (
    <div className={s.container}>
      <div className={s.header}>
        <h2 className={s.title}>Library</h2>
        <input
          className={s.search}
          type="text"
          placeholder="Search by id, name, type, biome…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className={s.content}>
        {isLoading ? (
          <div className={s.loading}>
            <div className={s.spinner}></div>
          </div>
        ) : filtered.length > 0 ? (
          <div className={s.list}>
            {filtered.map((obj, i) => (
              <div
                key={`${obj.name}-${i}`}
                className={`${s.item} ${selectedId === obj.id ? s.selected : ''}`}
                onClick={() => onSelect(obj)}
              >
                <div className={s.preview}>
                  {spriteUrl && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${obj.size.w}, 16px)`,
                        gridTemplateRows: `repeat(${obj.size.h}, 16px)`,
                      }}
                    >
                      {Array.from({ length: obj.size.h }, (_, row) =>
                        Array.from({ length: obj.size.w }, (_, col) => {
                          const f = obj.frames.find(
                            (fr) => fr.position.x === col && fr.position.y === row,
                          );
                          return (
                            <div
                              key={`${row}-${col}`}
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundImage: f ? `url(${spriteUrl})` : undefined,
                                backgroundPosition: f
                                  ? `-${(f.frame % 16) * 16}px -${Math.floor(f.frame / 16) * 16}px`
                                  : undefined,
                                backgroundSize: '256px auto',
                              }}
                            />
                          );
                        }),
                      )}
                    </div>
                  )}
                </div>
                <div className={s.info}>
                  <span className={s.name}>{obj.name}</span>
                  <span className={s.meta}>{obj.id}</span>
                  <span className={s.meta}>{obj.frames.length} frames</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.empty}>No stored objects found</div>
        )}
      </div>
    </div>
  );
}
