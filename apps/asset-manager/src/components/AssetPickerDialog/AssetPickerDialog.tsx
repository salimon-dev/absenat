import type { AssetSchema } from '@absenat/specs';
import { AssetPreview } from '../AssetPreview/AssetPreview';
import s from './AssetPickerDialog.module.css';

interface Props {
  assets: AssetSchema[];
  selectedAssetId?: string;
  folderHandle: FileSystemDirectoryHandle;
  onClose: () => void;
  onSelect: (asset: AssetSchema) => void;
}

export function AssetPickerDialog({
  assets,
  selectedAssetId,
  folderHandle,
  onClose,
  onSelect,
}: Props) {
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.overlay} onClick={handleOverlayClick}>
      <div className={s.dialog}>
        <div className={s.dialogHeader}>
          <h2 className={s.title}>Select asset</h2>
          <button type="button" className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          {assets.length === 0 ? (
            <p className={s.empty}>No assets available.</p>
          ) : (
            <div className={s.grid}>
              {assets.map(asset => (
                <button
                  type="button"
                  key={asset.id}
                  className={`${s.assetBtn} ${asset.id === selectedAssetId ? s.assetBtnActive : ''}`}
                  onClick={() => onSelect(asset)}
                >
                  <AssetPreview asset={asset} folderHandle={folderHandle} size="small" />
                  <span className={s.assetMeta}>
                    <span className={s.assetId} title={asset.id}>{asset.id.slice(0, 8)}</span>
                    <span className={s.assetFrame}>f{asset.frame}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

