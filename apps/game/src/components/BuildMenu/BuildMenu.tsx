import { BUILDABLE_NAMES, getBuildableSpec, type BuildableName } from '../../game/build/buildables';
import styles from './BuildMenu.module.css';

interface BuildMenuProps {
  onClose: () => void;
  onSelect: (buildable: BuildableName) => void;
  woodCount: number;
}

export default function BuildMenu({ onClose, onSelect, woodCount }: BuildMenuProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={event => event.stopPropagation()}>
        <h2 className={styles.header}>Build Menu</h2>
        <p className={styles.description}>
          Select a raft structure, then place it with the mouse. Only tiles inside the raft can accept new builds.
        </p>
        <div className={styles.grid}>
          {BUILDABLE_NAMES.map(name => {
            const buildable = getBuildableSpec(name);
            const woodCost = buildable.costs[0]?.count ?? 0;
            const disabled = woodCount < woodCost;
            return (
              <button
                key={name}
                type="button"
                className={styles.card}
                disabled={disabled}
                onClick={() => onSelect(name)}
              >
                <h3 className={styles.cardTitle}>{buildable.label}</h3>
                <p className={styles.cardDescription}>{buildable.description}</p>
                <div className={styles.metaRow}>
                  <span>{buildable.width}x{buildable.height}</span>
                  <span>{woodCost} wood</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className={styles.hint}>Press Esc to close. Gather more wood to unlock disabled builds.</p>
      </div>
    </div>
  );
}
