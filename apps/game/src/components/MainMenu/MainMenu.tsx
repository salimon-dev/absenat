import styles from './MainMenu.module.css';

interface MainMenuProps {
  busy: boolean;
  hasSave: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

export default function MainMenu({ busy, hasSave, onContinue, onNewGame }: MainMenuProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.castleBackdrop} />
      <section className={styles.panel} aria-labelledby="main-menu-title">
        <span className={styles.sigil} aria-hidden="true" />
        <p className={styles.kicker}>the begining</p>
        <h1 id="main-menu-title" className={styles.title}>
          Salimon: absenat
        </h1>
        <div className={styles.actions}>
          {hasSave && (
            <button className={styles.startButton} disabled={busy} type="button" onClick={onContinue}>
              Continue
            </button>
          )}
          <button className={styles.secondaryButton} disabled={busy} type="button" onClick={onNewGame}>
            New Game
          </button>
        </div>
      </section>
    </main>
  );
}
