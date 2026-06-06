import { lazy, Suspense, useEffect, useState } from 'react';
import MainMenu from '@components/MainMenu/MainMenu';
import { deleteSave, hasSave, loadSave } from '@game/save/storage';
import { GameStartMode, type GameStartRequest, type GameSaveData } from '@game/save/types';

const GameScreen = lazy(() => import('@components/GameScreen/GameScreen'));

interface ActiveGame {
  initialSave?: GameSaveData;
  mode: GameStartRequest['mode'];
}

function App() {
  const [activeGame, setActiveGame] = useState<ActiveGame | undefined>(undefined);
  const [saveAvailable, setSaveAvailable] = useState(false);
  const [menuBusy, setMenuBusy] = useState(true);

  useEffect(() => {
    let active = true;
    hasSave()
      .then(value => updateSaveAvailability(active, value, setSaveAvailable))
      .catch(error => handleSaveAvailabilityError(active, error, setSaveAvailable))
      .finally(() => {
        if (active) setMenuBusy(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function continueGame(): Promise<void> {
    setMenuBusy(true);
    try {
      const initialSave = await loadSave();
      if (!initialSave) {
        setSaveAvailable(false);
        return;
      }
      setActiveGame({ initialSave, mode: GameStartMode.Continue });
    } catch (error) {
      console.error('Unable to load save', error);
    } finally {
      setMenuBusy(false);
    }
  }

  async function startNewGame(): Promise<void> {
    setMenuBusy(true);
    try {
      await deleteSave();
    } catch (error) {
      console.error('Unable to clear previous save', error);
    } finally {
      setActiveGame({ mode: GameStartMode.NewGame });
      setMenuBusy(false);
    }
  }

  return (
    <>
      {!activeGame && (
        <MainMenu
          busy={menuBusy}
          hasSave={saveAvailable}
          onContinue={continueGame}
          onNewGame={startNewGame}
        />
      )}
      {activeGame && (
        <Suspense fallback={null}>
          <GameScreen initialSave={activeGame.initialSave} />
        </Suspense>
      )}
    </>
  );
}

export default App;

function updateSaveAvailability(
  active: boolean,
  value: boolean,
  setSaveAvailable: (value: boolean) => void
): void {
  if (active) setSaveAvailable(value);
}

function handleSaveAvailabilityError(
  active: boolean,
  error: unknown,
  setSaveAvailable: (value: boolean) => void
): void {
  console.error('Unable to check save availability', error);
  if (active) setSaveAvailable(false);
}
