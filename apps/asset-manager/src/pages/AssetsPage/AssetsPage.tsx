import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetFileCard } from '../../components/AssetFileCard/AssetFileCard';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { readAssetFiles } from '../../lib/assetsDb';
import { folderHandleAtom } from '../../store';
import s from './AssetsPage.module.css';

export default function AssetsPage() {
  const folderHandle = useAtomValue(folderHandleAtom);
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadFiles() {
      if (!folderHandle) return;
      setLoading(true);
      const assetFiles = await readAssetFiles(folderHandle);
      if (active) setFiles(assetFiles);
      if (active) setLoading(false);
    }
    loadFiles();
    return () => { active = false; };
  }, [folderHandle]);

  function handleEdit(filename: string) {
    navigate(`/assets/${encodeURIComponent(filename)}/edit`);
  }

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div>
          <h1 className={s.title}>Asset Files</h1>
          <p className={s.subtitle}>PNG tile sheets stored in the assets folder.</p>
        </div>
        <button className={s.createBtn} onClick={() => navigate('/assets/create')}>
          New asset file
        </button>
      </header>

      {loading ? (
        <EmptyState icon="…" label="Loading asset files" sub="Reading PNG files from disk." />
      ) : files.length === 0 ? (
        <EmptyState icon="▦" label="No asset files yet" sub="Create a PNG tile sheet to get started." />
      ) : (
        <div className={s.grid}>
          {files.map(file => (
            <AssetFileCard
              key={file.name}
              file={file}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
}
