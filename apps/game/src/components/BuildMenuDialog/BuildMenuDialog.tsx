import styles from './BuildMenuDialog.module.css';
import { BUILDABLE_NAMES, BUILDABLE_DEFINITIONS } from '../../game/building/definitions';
import { ResourceType } from '../../utils/resources';
import type { BuildableName } from '../../game/building/types';

interface BuildMenuDialogProps {
  onClose: () => void;
  onSelect: (buildable: BuildableName) => void;
  woodCount: number;
}

export default function BuildMenuDialog({ onClose, onSelect, woodCount }: BuildMenuDialogProps) {
  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Build menu" onClick={event => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Build</h2>
            <p className={styles.subtitle}>Select a structure, then place it on the raft.</p>
          </div>
          <button className={styles.closeButton} type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className={styles.stock}>Available wood: {woodCount}</p>
        <div className={styles.list}>
          {BUILDABLE_NAMES.map(buildable => {
            const definition = BUILDABLE_DEFINITIONS[buildable];
            const affordable = woodCount >= definition.cost.count;
            return (
              <button
                key={buildable}
                className={styles.option}
                type="button"
                disabled={!affordable}
                onClick={() => onSelect(buildable)}
              >
                <span className={styles.optionHeader}>
                  <span>{definition.label}</span>
                  <span>{definition.width}x{definition.height}</span>
                </span>
                <span className={styles.optionBody}>{definition.description}</span>
                <span className={styles.optionCost}>
                  {definition.cost.count} {formatResourceName(definition.cost.name)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatResourceName(name: ResourceType): string {
  return name.replace('-', ' ');
}
