import styles from './SaveLog.module.css';

interface SaveLogProps {
  visible: boolean;
}

export default function SaveLog({ visible }: SaveLogProps) {
  if (!visible) return null;
  return (
    <aside className={styles.log} aria-live="polite">
      <span className={styles.marker} aria-hidden="true" />
      <span>Game saved</span>
    </aside>
  );
}
