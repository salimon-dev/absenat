import { useAtomValue } from 'jotai';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { writeAssetFile } from '../../lib/assetsDb';
import { folderHandleAtom } from '../../store';
import s from './AssetsCreatePage.module.css';

function isPng(file: File): boolean {
  return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
}

export default function AssetsCreatePage() {
  const folderHandle = useAtomValue(folderHandleAtom);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError('');
    setSelectedFile(file && isPng(file) ? file : null);
    if (file && !isPng(file)) setError('Asset files must be PNG images.');
  }

  async function handleCreate() {
    if (!folderHandle || !selectedFile) return;
    await writeAssetFile(folderHandle, selectedFile);
    navigate('/assets');
  }

  return (
    <section className={s.page}>
      <header className={s.header}>
        <button className={s.backBtn} onClick={() => navigate('/assets')}>← Assets</button>
        <h1 className={s.title}>Create Asset File</h1>
        <p className={s.subtitle}>Add a PNG file that contains tile artwork.</p>
      </header>

      <div className={s.panel}>
        <input
          ref={inputRef}
          className={s.hiddenInput}
          type="file"
          accept="image/png"
          onChange={handleFileChange}
        />
        <button className={s.pickBtn} onClick={() => inputRef.current?.click()}>
          Choose PNG file
        </button>
        <div className={s.fileInfo}>
          {selectedFile ? selectedFile.name : 'No file selected'}
        </div>
        {error && <p className={s.error}>{error}</p>}
        <button
          className={s.createBtn}
          disabled={!selectedFile}
          onClick={handleCreate}
        >
          Create asset file
        </button>
      </div>
    </section>
  );
}
