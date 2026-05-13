import { useRef, useState } from 'react';
import type { AssetSchema } from '@absenat/specs';
import { sliceImage, type TileSlice } from '../../lib/sliceImage';
import { packTilesIntoSheets, writeAssets } from '../../lib/assetsDb';
import s from './UploadDialog.module.css';

interface Props {
  folderHandle: FileSystemDirectoryHandle;
  existingAssets: AssetSchema[];
  onClose: () => void;
  onAdded: (newAssets: AssetSchema[]) => void;
}

export function UploadDialog({ folderHandle, existingAssets, onClose, onAdded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [slices, setSlices] = useState<TileSlice[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceFile(file);
    setRemoved(new Set());
    setSlices(await sliceImage(file));
  }

  function removeSlice(frame: number) {
    setRemoved(prev => new Set([...prev, frame]));
  }

  async function handleAdd() {
    if (!sourceFile || saving) return;
    setSaving(true);
    try {
      const kept = slices.filter(sl => !removed.has(sl.frame));
      const newAssets = await packTilesIntoSheets(
        folderHandle,
        existingAssets,
        kept.map(sl => sl.dataUrl),
      );
      await writeAssets(folderHandle, [...existingAssets, ...newAssets]);
      onAdded(newAssets);
    } finally {
      setSaving(false);
    }
  }

  const visible = slices.filter(sl => !removed.has(sl.frame));

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={s.overlay} onClick={handleOverlayClick}>
      <div className={s.dialog}>
        <div className={s.dialogHeader}>
          <h2 className={s.title}>Upload tiles</h2>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          <div className={s.dropzone} onClick={() => inputRef.current?.click()}>
            <input
              ref={inputRef}
              type="file"
              accept="image/png"
              onChange={handleFile}
              className={s.hiddenInput}
            />
            <span className={s.dropzoneLabel}>
              {sourceFile
                ? `${sourceFile.name} — ${visible.length} tile${visible.length !== 1 ? 's' : ''}`
                : 'Click to choose a PNG file'}
            </span>
          </div>

          {slices.length > 0 && (
            <div className={s.grid}>
              {slices.map(sl =>
                removed.has(sl.frame) ? null : (
                  <div key={sl.frame} className={s.tile}>
                    <img src={sl.dataUrl} alt={`frame ${sl.frame}`} className={s.tileImg} />
                    <button
                      className={s.deleteBtn}
                      onClick={() => removeSlice(sl.frame)}
                      aria-label="Remove tile"
                    >
                      ✕
                    </button>
                    <span className={s.tileFrame}>f{sl.frame}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={s.addBtn}
            disabled={visible.length === 0 || saving}
            onClick={handleAdd}
          >
            {saving ? 'Saving…' : `Add ${visible.length} tile${visible.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
