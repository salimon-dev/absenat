import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  activeViewAtom,
  folderHandleAtom,
  folderReadyAtom,
  View,
} from './store';
import { loadHandle } from './lib/folderDb';
import { Header } from './components/Header/Header';
import { TilesView } from './components/TilesView/TilesView';
import { ObjectsView } from './components/ObjectsView/ObjectsView';
import { MapModulesView } from './components/MapModulesView/MapModulesView';
import { FolderGate } from './components/FolderGate/FolderGate';
import s from './App.module.css';

function App() {
  const activeView = useAtomValue(activeViewAtom);
  const [folderHandle, setFolderHandle] = useAtom(folderHandleAtom);
  const [ready, setReady] = useAtom(folderReadyAtom);
  const [restoredHandle, setRestoredHandle] = useState<
    FileSystemDirectoryHandle | undefined
  >();

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
      <Header />
      <main className={s.main}>
        {activeView === View.Tiles && <TilesView />}
        {activeView === View.Objects && <ObjectsView />}
        {activeView === View.MapEditor && <MapModulesView />}
      </main>
    </div>
  );
}

export default App;
