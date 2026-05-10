import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import {
  activeViewAtom,
  folderHandleAtom,
  folderReadyAtom,
  View,
} from './store';
import { loadHandle } from './lib/folderDb';
import { exportTiles } from './lib/exportTiles';
import { Header } from './components/Header/Header';
import { FolderGate } from './components/FolderGate/FolderGate';
import { Assets } from './components/Assets/Assets';
import type { AssetEntry } from './components/Assets/types';
import { AssetUploadDialog } from './components/AssetUploadDialog/AssetUploadDialog';
import s from './App.module.css';

function App() {
  const [folderHandle, setFolderHandle] = useAtom(folderHandleAtom);
  const [ready, setReady] = useAtom(folderReadyAtom);
  const [restoredHandle, setRestoredHandle] = useState<
    FileSystemDirectoryHandle | undefined
  >();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [assets, setAssets] = useState<AssetEntry[]>([]);

  const handleExport = useCallback(async () => {
    if (!folderHandle || assets.length === 0) return;
    await exportTiles(assets, folderHandle);
  }, [assets, folderHandle]);

  useEffect(() => {
    async function tryRestore() {
      try {
        const handle = await loadHandle();
        if (!handle) {
          setReady(true);
          return;
        }

        const permission = await handle.queryPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
          setFolderHandle(handle);
        } else {
          setRestoredHandle(handle);
        }
      } catch {
        // IDB unavailable — fall through to full gate
      }
      setReady(true);
    }
    tryRestore();
  }, [setFolderHandle, setReady]);

  if (!ready) return null;

  if (!folderHandle) {
    return <FolderGate restoredHandle={restoredHandle} />;
  }

  return (
    <div className={s.layout}>
      <Header
        onUpload={setUploadedFile}
        onExport={handleExport}
        canExport={assets.length > 0}
      />
      <main className={s.main}>
        <Assets
          assets={assets}
          onUpdate={(frame, id, tags) =>
            setAssets((prev) =>
              prev.map((a, i) => (i === frame ? { ...a, id, tags } : a)),
            )
          }
          onDelete={(frame) =>
            setAssets((prev) => prev.filter((_, i) => i !== frame))
          }
        />
      </main>
      {uploadedFile && (
        <AssetUploadDialog
          file={uploadedFile}
          onClose={() => setUploadedFile(null)}
          onAddTiles={(tiles) =>
            setAssets((prev) => [
              ...prev,
              ...tiles.map((dataUrl) => ({ dataUrl, id: '', tags: [] })),
            ])
          }
        />
      )}
    </div>
  );
}

export default App;
