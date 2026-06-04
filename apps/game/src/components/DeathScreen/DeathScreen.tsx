import styles from './DeathScreen.module.css';

interface DeathScreenProps {
  onRespawn: () => void;
}

export default function DeathScreen({ onRespawn }: DeathScreenProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h1 className={styles.title}>You Died</h1>
        <p className={styles.text}>
          Hunger, thirst, and exhaustion caught up with you. Return to camp and keep exploring.
        </p>
        <button className={styles.button} type="button" onClick={onRespawn}>
          Respawn
        </button>
      </div>
    </div>
  );
}
