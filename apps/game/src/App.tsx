import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game } from 'phaser';
import { createGame } from './game';
import HUD, { type HUDStats } from './components/HUD';
import Toolbar from '@components/Toolbar';
import InventoryDialog from '@components/InventoryDialog';
import {
  InventoryEvent,
  type InventoryItem,
  type QuickSlotsSnapshot,
  type RemoveInventoryItemPayload
} from './game/player/types';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [stats, setStats] = useState<HUDStats | undefined>(undefined);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quickSlots, setQuickSlots] = useState<QuickSlotsSnapshot | undefined>(undefined);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    if (!appRef.current) return;
    const game = createGame(appRef.current);
    gameRef.current = game;
    game.events.on('stats-update', setStats);
    game.events.on(InventoryEvent.Update, setInventory);
    game.events.on(InventoryEvent.QuickSlotsUpdate, setQuickSlots);
    game.events.emit(InventoryEvent.Request);
    game.events.emit(InventoryEvent.QuickSlotsRequest);
    return () => {
      game.events.off('stats-update', setStats);
      game.events.off(InventoryEvent.Update, setInventory);
      game.events.off(InventoryEvent.QuickSlotsUpdate, setQuickSlots);
      gameRef.current = null;
      game.destroy(true);
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

  const requestInventory = useCallback(() => {
    gameRef.current?.events.emit(InventoryEvent.Request);
  }, []);

  const removeInventoryItem = useCallback((payload: RemoveInventoryItemPayload) => {
    gameRef.current?.events.emit(InventoryEvent.Remove, payload);
  }, []);

  const selectQuickSlotSet = useCallback((setId: number) => {
    gameRef.current?.events.emit(InventoryEvent.QuickSlotsSelectSet, setId);
  }, []);

  return (
    <>
      <div ref={appRef} className="app" />
      {stats && <HUD stats={stats} />}
      <Toolbar
        inventoryActive={inventoryOpen}
        quickSlots={quickSlots}
        statsActive={statsOpen}
        onQuickSlotSetSelect={selectQuickSlotSet}
      />
      {inventoryOpen && (
        <InventoryDialog
          inventory={inventory}
          quickSlots={quickSlots}
          onClose={() => setInventoryOpen(false)}
          onInventoryRequest={requestInventory}
          onInventoryRemove={removeInventoryItem}
          onQuickSlotSetSelect={selectQuickSlotSet}
        />
      )}
    </>
  );
}

export default App;
