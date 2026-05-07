import { useEffect, useRef, useState } from 'react';
import { createGame } from './game';
import HUD, { type HUDStats } from './components/HUD';

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<HUDStats | undefined>(undefined);

  useEffect(() => {
    if (!appRef.current) return;
    const game = createGame(appRef.current);
    game.events.on('stats-update', setStats);
    return () => { game.events.off('stats-update', setStats); };
  }, []);

  return (
    <>
      <div ref={appRef} className="app" />
      {stats && <HUD stats={stats} />}
    </>
  );
}

export default App;
