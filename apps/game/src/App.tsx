import { lazy, Suspense, useState } from 'react';
import MainMenu from '@components/MainMenu/MainMenu';

const GameScreen = lazy(() => import('@components/GameScreen/GameScreen'));

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <>
      {!gameStarted && <MainMenu onStart={() => setGameStarted(true)} />}
      {gameStarted && (
        <Suspense fallback={null}>
          <GameScreen />
        </Suspense>
      )}
    </>
  );
}

export default App;
