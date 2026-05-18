import { useEffect, useRef, useState } from 'react';
import { createGame } from './game';
import HUD, { type HUDStats } from './components/HUD';
import Toolbar from '@components/Toolbar';
import InventoryDialog from '@components/InventoryDialog';
import type { InventoryItem } from './game/player/types';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<HUDStats | undefined>(undefined);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    if (!appRef.current) return;
    const game = createGame(appRef.current);
    game.events.on('stats-update', setStats);
    game.events.on('inventory-update', setInventory);
    return () => {
      game.events.off('stats-update', setStats);
      game.events.off('inventory-update', setInventory);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'i' || e.key === 'I') setInventoryOpen(prev => !prev);
      if (e.key === 'u' || e.key === 'U') setStatsOpen(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div ref={appRef} className="app" />
      {stats && <HUD stats={stats} />}
      <Toolbar inventoryActive={inventoryOpen} statsActive={statsOpen} />
      {inventoryOpen && (
        <InventoryDialog inventory={inventory} onClose={() => setInventoryOpen(false)} />
      )}
    </>
  );
}

export default App;
