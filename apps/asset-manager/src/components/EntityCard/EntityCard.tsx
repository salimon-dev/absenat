import type { Entity } from '@absenat/specs';
import s from './EntityCard.module.css';

interface Props {
  entity: Entity;
}

export function EntityCard({ entity }: Props) {
  return (
    <div className={s.card}>
      <div className={s.name}>{entity.name}</div>
      <div className={s.meta}>
        <span className={s.type}>{entity.type}</span>
        <span className={s.size}>{entity.size.w}×{entity.size.h}</span>
      </div>
      <div className={s.details}>
        <span className={s.detail}>{entity.frames.length} frame{entity.frames.length !== 1 ? 's' : ''}</span>
        {entity.animateSpeed > 0 && <span className={s.detail}>{entity.animateSpeed}fps</span>}
      </div>
      {entity.biomes.length > 0 && (
        <div className={s.biomes}>
          {entity.biomes.map(b => <span key={b} className={s.biome}>{b}</span>)}
        </div>
      )}
    </div>
  );
}
