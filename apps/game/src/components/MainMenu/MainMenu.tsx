import styles from './MainMenu.module.css';

interface MainMenuProps {
  onStart: () => void;
}

export default function MainMenu({ onStart }: MainMenuProps) {
  return (
    <main className={styles.screen}>
      <div className={styles.castleBackdrop} />
      <section className={styles.panel} aria-labelledby="main-menu-title">
        <span className={styles.sigil} aria-hidden="true" />
        <p className={styles.kicker}>the begining</p>
        <h1 id="main-menu-title" className={styles.title}>
          Salimon: absenat
        </h1>
        <button className={styles.startButton} type="button" onClick={onStart}>
          Start Game
        </button>
      </section>
    </main>
  );
}
