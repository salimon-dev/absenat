import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetImageCard } from '../../components/AssetImageCard/AssetImageCard';
import { EmptyState } from '../../components/common/EmptyState/EmptyState';
import { readPublicAssetImageFiles } from '../../lib/assetsDb';
import { folderHandleAtom } from '../../store';
import s from './AssetsPage.module.css';

interface AssetImagePreview {
  name: string;
  src: string;
}

function createAssetPreviews(files: File[]): AssetImagePreview[] {
  return files.map(file => ({
    name: file.name,
    src: URL.createObjectURL(file),
  }));
}

export default function AssetsPage() {
  const folderHandle = useAtomValue(folderHandleAtom);
  const navigate = useNavigate();
  const [assetImages, setAssetImages] = useState<AssetImagePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];

    async function loadFiles() {
      if (!folderHandle) return;
      setLoading(true);
      const files = await readPublicAssetImageFiles(folderHandle);
      const previews = createAssetPreviews(files);
      objectUrls = previews.map(preview => preview.src);
      if (!active) {
        objectUrls.forEach(url => URL.revokeObjectURL(url));
        return;
      }
      setAssetImages(previews);
      setLoading(false);
    }

    loadFiles();
    return () => {
      active = false;
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [folderHandle]);

  function handleAssetClick(filename: string) {
    navigate(`/assets/${encodeURIComponent(filename)}/edit`);
  }

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div>
          <h1 className={s.title}>Asset Files</h1>
          <p className={s.subtitle}>PNG files in the selected folder.</p>
        </div>
      </header>

      {loading ? (
        <EmptyState icon="..." label="Loading asset files" sub="Reading PNG files from the selected folder." />
      ) : assetImages.length === 0 ? (
        <EmptyState icon="▦" label="No asset files found" sub="Add PNG files to the selected folder." />
      ) : (
        <div className={s.grid}>
          {assetImages.map(asset => (
            <AssetImageCard
              key={asset.name}
              name={asset.name}
              onClick={handleAssetClick}
              src={asset.src}
            />
          ))}
        </div>
      )}
    </section>
  );
}
