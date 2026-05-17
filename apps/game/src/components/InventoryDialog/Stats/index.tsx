import styles from './Stats.module.css';

export default function Stats() {
  return (
    <div className={styles.stats}>
      <span className={styles.sectionLabel}>Stats</span>
      <div className={styles.statsList}>
        <div className={styles.statRow}><span>Damage</span><span>10</span></div>
        <div className={styles.statRow}><span>Armor</span><span>10</span></div>
        <div className={styles.statRow}><span>Critical Rate</span><span>10</span></div>
        <div className={styles.statRow}><span>Mana</span><span>10</span></div>
        <div className={styles.statRow}><span>Health</span><span>10</span></div>
        <div className={styles.statRow}><span>Thirst Drain Rate</span><span>10</span></div>
        <div className={styles.statRow}><span>Fatigue Drain Rate</span><span>10</span></div>
        <div className={styles.statRow}><span>Hunger Drain Rate</span><span>10</span></div>
      </div>
    </div>
  );
}
