import { getBuildableSpec, type BuildableName } from '../../game/build/buildables';
import styles from './BuildPlacementHint.module.css';

interface BuildPlacementHintProps {
  buildable: BuildableName;
}

export default function BuildPlacementHint({ buildable }: BuildPlacementHintProps) {
  const spec = getBuildableSpec(buildable);

  return (
    <aside className={styles.panel} aria-live="polite">
      <span className={styles.kicker}>Build Mode</span>
      <strong className={styles.label}>{spec.label}</strong>
      <span className={styles.hint}>Left click to place. Right click or Esc to cancel.</span>
    </aside>
  );
}
