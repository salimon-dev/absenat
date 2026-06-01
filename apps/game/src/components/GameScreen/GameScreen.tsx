import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game } from 'phaser';
import { createGame } from '@game/index';
import HUD, { type HUDStats } from '@components/HUD';
import Toolbar from '@components/Toolbar';
import InventoryDialog from '@components/InventoryDialog';
import {
  InventoryEvent,
  type RemoveInventoryItemPayload,
  type InventorySlotMovePayload,
  type InventorySlot,
  type InventorySnapshot,
  type QuickSlotAssignmentPayload,
  type QuickSlotMovePayload,
  type QuickSlotsSnapshot
} from '@game/player/types';

export default function GameScreen() {
  const appRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [stats, setStats] = useState<HUDStats | undefined>(undefined);
  const [inventorySlots, setInventorySlots] = useState<InventorySlot[]>([]);
  const [quickSlots, setQuickSlots] = useState<QuickSlotsSnapshot | undefined>(undefined);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const handleInventoryUpdate = useCallback((snapshot: InventorySnapshot) => {
    setInventorySlots(snapshot.slots);
  }, []);

  useEffect(() => {
    if (!appRef.current) return;
    const game = createGame(appRef.current);
    gameRef.current = game;
    game.events.on('stats-update', setStats);
    game.events.on(InventoryEvent.Update, handleInventoryUpdate);
    game.events.on(InventoryEvent.QuickSlotsUpdate, setQuickSlots);
    game.events.emit(InventoryEvent.Request);
    game.events.emit(InventoryEvent.QuickSlotsRequest);
    return () => {
      game.events.off('stats-update', setStats);
      game.events.off(InventoryEvent.Update, handleInventoryUpdate);
      game.events.off(InventoryEvent.QuickSlotsUpdate, setQuickSlots);
      gameRef.current = null;
      game.destroy(true);
    };
  }, [handleInventoryUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInventoryOpen(false);
      if (e.key === 'i' || e.key === 'I') setInventoryOpen(prev => !prev);
      if (e.key === 'u' || e.key === 'U') setStatsOpen(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const requestInventory = useCallback(() => {
    gameRef.current?.events.emit(InventoryEvent.Request);
  }, []);

  const moveInventoryItem = useCallback((payload: InventorySlotMovePayload) => {
    gameRef.current?.events.emit(InventoryEvent.Move, payload);
  }, []);

  const removeInventoryItem = useCallback((payload: RemoveInventoryItemPayload) => {
    gameRef.current?.events.emit(InventoryEvent.Remove, payload);
  }, []);

  const selectQuickSlotSet = useCallback((setId: number) => {
    gameRef.current?.events.emit(InventoryEvent.QuickSlotsSelectSet, setId);
  }, []);

  const moveQuickSlot = useCallback((payload: QuickSlotMovePayload) => {
    gameRef.current?.events.emit(InventoryEvent.QuickSlotMove, payload);
  }, []);

  const assignQuickSlot = useCallback((payload: QuickSlotAssignmentPayload) => {
    gameRef.current?.events.emit(InventoryEvent.QuickSlotAssign, payload);
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
          inventorySlots={inventorySlots}
          quickSlots={quickSlots}
          onClose={() => setInventoryOpen(false)}
          onInventoryRequest={requestInventory}
          onInventoryRemove={removeInventoryItem}
          onInventorySlotMove={moveInventoryItem}
          onQuickSlotAssign={assignQuickSlot}
          onQuickSlotMove={moveQuickSlot}
          onQuickSlotSetSelect={selectQuickSlotSet}
        />
      )}
    </>
  );
}
