import type { AssetEntry } from '../types';
import s from './TileCard.module.css';

interface Props {
  asset: AssetEntry;
  frame: number;
  onClick: () => void;
}

export function TileCard({ asset, frame, onClick }: Props) {
  const hasId = asset.id.trim().length > 0;
  return (
    <button className={s.card} onClick={onClick} title={`Frame ${frame}`}>
      <img src={asset.dataUrl} alt={`tile ${frame}`} className={s.img} />
      <span className={hasId ? s.id : s.idMissing}>
        {hasId ? asset.id : 'N.A'}
      </span>
    </button>
  );
}
