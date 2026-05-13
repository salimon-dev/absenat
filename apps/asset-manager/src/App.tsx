import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { folderHandleAtom, folderReadyAtom } from './store';
import { loadHandle } from './lib/folderDb';
import { Header } from './components/Header/Header';
import { FolderGate } from './components/FolderGate/FolderGate';
import { Sidebar } from './components/Sidebar/Sidebar';
import { AssetsPage } from './pages/AssetsPage/AssetsPage';
import { EntitiesPage } from './pages/EntitiesPage/EntitiesPage';
import { MapModulesPage } from './pages/MapModulesPage/MapModulesPage';
import s from './App.module.css';

function AppShell() {
  return (
    <div className={s.layout}>
      <Header />
      <div className={s.body}>
        <Sidebar />
        <main className={s.main}>
          <Routes>
            <Route index element={<Navigate to="assets" replace />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="entities" element={<EntitiesPage />} />
            <Route path="map-modules" element={<MapModulesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
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
    return (
      <BrowserRouter>
        <FolderGate restoredHandle={restoredHandle} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
