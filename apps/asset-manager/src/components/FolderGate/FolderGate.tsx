import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { folderHandleAtom } from '../../store';
import { saveHandle } from '../../lib/folderDb';
import s from './FolderGate.module.css';

interface Props {
  /** Restored handle that needs re-permission from the user */
  restoredHandle?: FileSystemDirectoryHandle;
}

export function FolderGate({ restoredHandle }: Props) {
  const setFolderHandle = useSetAtom(folderHandleAtom);
  const [error, setError] = useState<string | null>(null);

  async function grant() {
    setError(null);
    try {
      if (restoredHandle) {
        const result = await restoredHandle.requestPermission({ mode: 'readwrite' });
        if (result === 'granted') {
          setFolderHandle(restoredHandle);
          return;
        }
        setError('Permission denied. Please try again.');
        return;
      }

      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await saveHandle(handle);
      setFolderHandle(handle);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError('Failed to open folder. Please try again.');
    }
  }

  return (
    <div className={s.overlay}>
      <div className={s.card}>
        <h2 className={s.title}>
          {restoredHandle ? 'Restore folder access' : 'Select game assets folder'}
        </h2>
        <p className={s.description}>
          {restoredHandle
            ? 'Grant access to the previously selected folder to continue.'
            : 'Grant access to the game\'s public assets folder so the asset manager can read and write files directly.'}
        </p>
        {!restoredHandle && <div className={s.path}>apps/game/public</div>}
        {!restoredHandle && (
          <p className={s.description}>
            Navigate to your project root and open that folder when the file picker appears.
          </p>
        )}
        {error && <p className={s.error}>{error}</p>}
        <button className={s.button} onClick={grant}>
          {restoredHandle ? 'Restore access' : 'Choose folder'}
        </button>
      </div>
    </div>
  );
}
