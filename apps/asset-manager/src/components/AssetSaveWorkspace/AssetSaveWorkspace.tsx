import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { readAssetFiles, writeAssetFile } from '../../lib/assetsDb';
import { createTileSheetFile } from '../../lib/createTileSheetFile';
import { sliceImage } from '../../lib/sliceImage';
import { folderHandleAtom } from '../../store';
import { EmptyState } from '../common/EmptyState/EmptyState';
import s from './AssetSaveWorkspace.module.css';
import { AssetSavePageMode, type AssetSavePageModeType } from './types';

interface Props {
  editFilename?: string;
  mode: AssetSavePageModeType;
}

interface StagedTile {
  dataUrl: string;
  id: string;
  label: string;
}

interface EditableTilesResult {
  error: string;
  tiles: StagedTile[];
}

function isPng(file: File): boolean {
  return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
}

async function getTilesFromFiles(files: File[]): Promise<StagedTile[]> {
  const groups = await Promise.all(files.map(sliceFile));
  return groups.flat();
}

async function sliceFile(file: File, fileIndex: number): Promise<StagedTile[]> {
  const slices = await sliceImage(file);
  return slices.map(slice => ({
    dataUrl: slice.dataUrl,
    id: `${fileIndex}-${slice.frame}`,
    label: `${file.name} f${slice.frame}`,
  }));
}

async function getEditableTiles(
  root: FileSystemDirectoryHandle,
  editFilename: string,
): Promise<EditableTilesResult> {
  const files = await readAssetFiles(root);
  const file = files.find(candidate => candidate.name === editFilename);
  if (!file) return { error: 'Asset file was not found.', tiles: [] };
  return getEditableTilesFromFile(file);
}

async function getEditableTilesFromFile(file: File): Promise<EditableTilesResult> {
  try {
    return { error: '', tiles: await sliceFile(file, 0) };
  } catch {
    return { error: 'Unable to read asset file.', tiles: [] };
  }
}

function getAssetBaseName(assetName: string): string {
  const trimmed = assetName.trim();
  return trimmed.toLowerCase().endsWith('.png') ? trimmed.slice(0, -4) : trimmed;
}

function getAssetFilename(assetName: string): string {
  return `${getAssetBaseName(assetName)}.png`;
}

function getAssetNameError(assetName: string): string {
  const baseName = getAssetBaseName(assetName);
  if (!baseName) return 'Asset name is required.';
  if (/[\\/]/.test(baseName)) return 'Asset name cannot include slashes.';
  return '';
}

function getEditTargetError(editFilename: string): string {
  return editFilename ? '' : 'Asset file was not found.';
}

function getPageTitle(isEditMode: boolean): string {
  return isEditMode ? 'Edit Asset File' : 'Create Asset File';
}

function getPageSubtitle(isEditMode: boolean): string {
  if (isEditMode) return 'Edit the 16x16 tiles and save changes to the existing sheet.';
  return 'Upload PNG artwork and save it as a new sheet.';
}

function getSaveLabel(saving: boolean): string {
  return saving ? 'Saving...' : 'Save asset file';
}

export function AssetSaveWorkspace({ editFilename = '', mode }: Props) {
  const folderHandle = useAtomValue(folderHandleAtom);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditMode = mode === AssetSavePageMode.Edit;
  const [assetName, setAssetName] = useState('');
  const [tiles, setTiles] = useState<StagedTile[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadEditableFile() {
      if (!folderHandle || !isEditMode) return;
      const result = await getEditableTiles(folderHandle, editFilename);
      if (!active) return;
      setError(result.error);
      setTiles(result.tiles);
    }
    loadEditableFile();
    return () => { active = false; };
  }, [editFilename, folderHandle, isEditMode]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    setError('');
    setTiles([]);
    if (files.length === 0) return;
    if (files.some(file => !isPng(file))) {
      setError('Asset files must be PNG images.');
      return;
    }
    await stageFiles(files);
  }

  async function stageFiles(files: File[]) {
    try {
      setTiles(await getTilesFromFiles(files));
    } catch {
      setError('Unable to read one or more PNG files.');
    }
  }

  function removeTile(id: string) {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  }

  async function handleSave() {
    const targetError = getTargetError();
    if (!folderHandle || tiles.length === 0 || targetError || saving) {
      setError(targetError);
      return;
    }
    await saveAssetFile(folderHandle);
  }

  function getTargetError(): string {
    if (isEditMode) return getEditTargetError(editFilename);
    return getAssetNameError(assetName);
  }

  async function saveAssetFile(root: FileSystemDirectoryHandle) {
    setSaving(true);
    try {
      const file = await createTileSheetFile(getTargetFilename(), getTileDataUrls());
      await writeAssetFile(root, file);
      navigate('/assets');
    } catch {
      setError('Unable to save asset file.');
    } finally {
      setSaving(false);
    }
  }

  function getTargetFilename(): string {
    return isEditMode ? editFilename : getAssetFilename(assetName);
  }

  function getTileDataUrls(): string[] {
    return tiles.map(tile => tile.dataUrl);
  }

  const targetError = getTargetError();
  const saveDisabled = tiles.length === 0 || !!targetError || saving;
  const finalFilename = targetError ? '' : getTargetFilename();
  const title = getPageTitle(isEditMode);
  const subtitle = getPageSubtitle(isEditMode);

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div className={s.headerText}>
          <button className={s.backBtn} onClick={() => navigate('/assets')}>← Assets</button>
          <h1 className={s.title}>{title}</h1>
          <p className={s.subtitle}>{subtitle}</p>
        </div>
        <div className={s.headerActions}>
          <input
            ref={inputRef}
            className={s.hiddenInput}
            type="file"
            accept="image/png"
            multiple
            onChange={handleFileChange}
          />
          <button className={s.pickBtn} onClick={() => inputRef.current?.click()}>
            {isEditMode ? 'Replace with PNG files' : 'Upload PNG files'}
          </button>
          <button
            className={s.createBtn}
            disabled={saveDisabled}
            onClick={handleSave}
          >
            {getSaveLabel(saving)}
          </button>
        </div>
      </header>

      <div className={s.toolbar}>
        {isEditMode ? (
          <div className={s.fileInfo}>Editing: {editFilename}</div>
        ) : (
          <label className={s.field}>
            <span className={s.label}>Asset name</span>
            <input
              className={s.nameInput}
              value={assetName}
              onChange={event => setAssetName(event.target.value)}
              placeholder="tree"
            />
          </label>
        )}

        {finalFilename && <div className={s.fileInfo}>Final file: {finalFilename}</div>}
        <div className={s.fileInfo}>
          {tiles.length > 0 ? `${tiles.length} tile${tiles.length !== 1 ? 's' : ''} staged` : 'No files selected'}
        </div>
        {error && <p className={s.error}>{error}</p>}
      </div>

      <main className={s.content}>
        {tiles.length === 0 ? (
          <EmptyState
            icon="▦"
            label="No tiles staged"
            sub="Upload PNG files to list their 16x16 tiles here."
          />
        ) : (
          <div className={s.grid}>
            {tiles.map(tile => (
              <div key={tile.id} className={s.tile}>
                <img src={tile.dataUrl} alt={tile.label} className={s.tileImg} />
                <button
                  className={s.deleteBtn}
                  onClick={() => removeTile(tile.id)}
                  aria-label={`Delete ${tile.label}`}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </section>
  );
}
