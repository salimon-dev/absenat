import type { PlayerStat } from '@absenat/specs';

export interface HUDStats {
  health: PlayerStat;
  thirst: PlayerStat;
  hunger: PlayerStat;
  fatigue: PlayerStat;
}


function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e05555">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function DropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#55aaee">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 2.5S7 8.5 7 13c0 2.76 2.24 5 5 5s5-2.24 5-5c0-4.5-5-10.5-5-10.5z" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e0a855">
      <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-8-15.03-8-15.03 0h15.03zM1.02 17h15v2h-15z" />
    </svg>
  );
}

function FatigueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#aa88ee">
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
    </svg>
  );
}

const STATS_CONFIG = [
  { key: 'health' as const, label: 'HP', Icon: HeartIcon },
  { key: 'thirst' as const, label: 'THR', Icon: DropIcon },
  { key: 'hunger' as const, label: 'HNG', Icon: FoodIcon },
  { key: 'fatigue' as const, label: 'FAT', Icon: FatigueIcon }
];

export default function HUD({ stats }: { stats: HUDStats }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 100,
        pointerEvents: 'none'
      }}
    >
      {STATS_CONFIG.map(({ key, Icon }) => {
        const { current, total } = stats[key];
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.55)',
              borderRadius: 6,
              padding: '3px 8px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Icon />
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                color: '#fff',
                letterSpacing: '0.03em',
                minWidth: 52
              }}
            >
              {Math.round(current)}/{Math.round(total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
