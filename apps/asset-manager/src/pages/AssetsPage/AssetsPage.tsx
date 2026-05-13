import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import type { AssetSchema } from '@absenat/specs';
import { folderHandleAtom } from '../../store';
import { readAssets, writeAssets } from '../../lib/assetsDb';
import { AssetCard } from '../../components/AssetCard/AssetCard';
import { UploadDialog } from '../../components/UploadDialog/UploadDialog';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import s from './AssetsPage.module.css';

export function AssetsPage() {
  const folderHandle = useAtomValue(folderHandleAtom)!;
  const [assets, setAssets] = useState<AssetSchema[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    readAssets(folderHandle).then(setAssets);
  }, [folderHandle]);

  function handleAdded(newAssets: AssetSchema[]) {
    setAssets(prev => [...prev, ...newAssets]);
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    const next = assets.filter(a => a.id !== id);
    setAssets(next);
    await writeAssets(folderHandle, next);
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Tiles</h1>
        <button className={s.uploadBtn} onClick={() => setDialogOpen(true)}>
          Upload
        </button>
      </div>

      {assets.length === 0 ? (
        <EmptyState icon="🖼" label="No tiles yet" sub="Upload a PNG to slice it into 16×16 tiles." />
      ) : (
        <div className={s.grid}>
          {assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} folderHandle={folderHandle} onDelete={() => handleDelete(asset.id)} />
          ))}
        </div>
      )}

      {dialogOpen && (
        <UploadDialog
          folderHandle={folderHandle}
          existingAssets={assets}
          onClose={() => setDialogOpen(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
