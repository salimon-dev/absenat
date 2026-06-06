import { useCallback, useEffect, useRef, useState } from 'react';
import type { Game } from 'phaser';
import { createGame } from '@game/index';
import { createGameSave } from '@game/save/snapshot';
import { writeSave } from '@game/save/storage';
import type { GameSaveData } from '@game/save/types';
import { World } from '@game/world';
import { attachDebugGame, detachDebugGame } from '@game/debug';
import HUD, { type HUDStats } from '@components/HUD';
import Toolbar from '@components/Toolbar';
import InventoryDialog from '@components/InventoryDialog';
import DeathScreen from '@components/DeathScreen/DeathScreen';
import BuildMenuDialog from '@components/BuildMenuDialog/BuildMenuDialog';
import SaveLog from '@components/SaveLog/SaveLog';
import {
  InventoryEvent,
  PlayerEvent,
  PlayerLifeState,
  type PlayerLifeStatePayload,
  type RemoveInventoryItemPayload,
  type InventorySlotMovePayload,
  type InventorySlot,
  type InventorySnapshot,
  type QuickSlotAssignmentPayload,
  type QuickSlotMovePayload,
  type QuickSlotsSnapshot
} from '@game/player/types';
import { BuildEvent } from '@game/building/events';
import type { BuildPlacementPayload, BuildStateSnapshot } from '@game/building/types';
import { ResourceType } from '../../utils/resources';

const AUTOSAVE_INTERVAL_MS = 15000;
const SAVE_LOG_VISIBLE_MS = 2400;

interface GameScreenProps {
  initialSave?: GameSaveData;
}

interface AutosaveHandle {
  intervalId: number;
  timeoutId: number;
}

export default function GameScreen({ initialSave }: GameScreenProps) {
  const appRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [stats, setStats] = useState<HUDStats | undefined>(undefined);
  const [inventorySlots, setInventorySlots] = useState<InventorySlot[]>([]);
  const [quickSlots, setQuickSlots] = useState<QuickSlotsSnapshot | undefined>(undefined);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [lifeState, setLifeState] = useState(PlayerLifeState.Alive);
  const [buildMenuOpen, setBuildMenuOpen] = useState(false);
  const [buildState, setBuildState] = useState<BuildStateSnapshot>({});
  const [saveLogVisible, setSaveLogVisible] = useState(false);
  const saveLogTimeoutRef = useRef<number | undefined>(undefined);

  const showSaveLog = useCallback(() => {
    setSaveLogVisible(true);
    window.clearTimeout(saveLogTimeoutRef.current);
    saveLogTimeoutRef.current = window.setTimeout(() => setSaveLogVisible(false), SAVE_LOG_VISIBLE_MS);
  }, []);

  const handleInventoryUpdate = useCallback((snapshot: InventorySnapshot) => {
    setInventorySlots(snapshot.slots);
  }, []);

  const handleLifeStateChange = useCallback(({ state }: PlayerLifeStatePayload) => {
    setLifeState(state);
    if (state === PlayerLifeState.Dead) {
      setInventoryOpen(false);
      setBuildMenuOpen(false);
      gameRef.current?.events.emit(BuildEvent.CancelPlacement);
    }
  }, []);

  useEffect(() => {
    if (!appRef.current) return;
    const game = createGame(appRef.current, { initialSave });
    gameRef.current = game;
    attachDebugGame(game);
    game.events.on(PlayerEvent.StatsUpdate, setStats);
    game.events.on(PlayerEvent.LifeStateChange, handleLifeStateChange);
    game.events.on(InventoryEvent.Update, handleInventoryUpdate);
    game.events.on(InventoryEvent.QuickSlotsUpdate, setQuickSlots);
    game.events.on(BuildEvent.StateUpdate, setBuildState);
    game.events.emit(InventoryEvent.Request);
    game.events.emit(InventoryEvent.QuickSlotsRequest);
    const autosave = startAutosave(game, showSaveLog);
    return () => {
      window.clearInterval(autosave.intervalId);
      window.clearTimeout(autosave.timeoutId);
      window.clearTimeout(saveLogTimeoutRef.current);
      game.events.off(PlayerEvent.StatsUpdate, setStats);
      game.events.off(PlayerEvent.LifeStateChange, handleLifeStateChange);
      game.events.off(InventoryEvent.Update, handleInventoryUpdate);
      game.events.off(InventoryEvent.QuickSlotsUpdate, setQuickSlots);
      game.events.off(BuildEvent.StateUpdate, setBuildState);
      detachDebugGame(game);
      gameRef.current = null;
      game.destroy(true);
    };
  }, [handleInventoryUpdate, handleLifeStateChange, initialSave, showSaveLog]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setInventoryOpen(false);
        setBuildMenuOpen(false);
        gameRef.current?.events.emit(BuildEvent.CancelPlacement);
      }
      if (lifeState === PlayerLifeState.Dead) return;
      if (event.key === 'i' || event.key === 'I') {
        setBuildMenuOpen(false);
        gameRef.current?.events.emit(BuildEvent.CancelPlacement);
        setInventoryOpen(prev => !prev);
      }
      if (event.key === 'u' || event.key === 'U') {
        setInventoryOpen(false);
        gameRef.current?.events.emit(BuildEvent.CancelPlacement);
        setBuildMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lifeState]);

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

  const requestRespawn = useCallback(() => {
    gameRef.current?.events.emit(PlayerEvent.RespawnRequest);
  }, []);

  const startBuildPlacement = useCallback((payload: BuildPlacementPayload) => {
    gameRef.current?.events.emit(BuildEvent.StartPlacement, payload);
    setBuildMenuOpen(false);
  }, []);

  const woodCount = getInventoryItemCount(inventorySlots, ResourceType.Wood);
  return (
    <>
      <div ref={appRef} className="app" />
      {stats && <HUD stats={stats} />}
      <Toolbar
        buildActive={buildMenuOpen || Boolean(buildState.activeBuild)}
        inventoryActive={inventoryOpen}
        quickSlots={quickSlots}
        onQuickSlotSetSelect={selectQuickSlotSet}
      />
      {buildMenuOpen && (
        <BuildMenuDialog
          woodCount={woodCount}
          onClose={() => setBuildMenuOpen(false)}
          onSelect={buildable => startBuildPlacement({ buildable })}
        />
      )}
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
      {lifeState === PlayerLifeState.Dead && <DeathScreen onRespawn={requestRespawn} />}
      <SaveLog visible={saveLogVisible} />
    </>
  );
}

function getInventoryItemCount(slots: InventorySlot[], name: string): number {
  return slots.find(slot => slot.item?.name === name)?.item?.count ?? 0;
}

function startAutosave(game: Game, onSaved: () => void): AutosaveHandle {
  return {
    intervalId: window.setInterval(() => void writeCurrentSave(game, onSaved), AUTOSAVE_INTERVAL_MS),
    timeoutId: window.setTimeout(() => void writeCurrentSave(game, onSaved), 0)
  };
}

async function writeCurrentSave(game: Game, onSaved: () => void): Promise<void> {
  const world = game.scene.getScene('world');
  if (!(world instanceof World)) return;
  try {
    await writeSave(createGameSave(world));
    onSaved();
  } catch (error) {
    console.error('Unable to autosave game state', error);
  }
}
