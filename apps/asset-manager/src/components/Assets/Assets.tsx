import { useState } from 'react';
import type { AssetEntry } from './types';
import { TileCard } from './TileCard/TileCard';
import { AssetDetailDialog } from './AssetDetailDialog/AssetDetailDialog';
import s from './Assets.module.css';
import { AssetTags } from '@absenat/specs';

interface Props {
  assets: AssetEntry[];
  onUpdate: (frame: number, id: string, tags: string[]) => void;
  onDelete: (frame: number) => void;
}

export function Assets({ assets, onUpdate, onDelete }: Props) {
  const [selectedFrame, setSelectedFrame] = useState<number | null>(null);

  const selected = selectedFrame !== null ? assets[selectedFrame] : null;

  function handleDelete() {
    if (selectedFrame === null) return;
    onDelete(selectedFrame);
    setSelectedFrame(null);
  }

  return (
    <>
      <div className={s.grid}>
        {assets.map((asset, i) => (
          <TileCard
            key={i}
            asset={asset}
            frame={i}
            onClick={() => setSelectedFrame(i)}
          />
        ))}
      </div>

      {selected !== null && selectedFrame !== null && (
        <AssetDetailDialog
          asset={selected}
          frame={selectedFrame}
          allTags={AssetTags}
          onClose={() => setSelectedFrame(null)}
          onUpdate={(id, tags) => onUpdate(selectedFrame, id, tags)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
