# Player Stats

## Survival

Drain over time via `drainRate`. Each stat has `current`, `total`, and `drainRate`.

| Stat      | Description                          |
|-----------|--------------------------------------|
| `health`  | Hit points. Reaches 0 = death.       |
| `thirst`  | Dehydration. Drains over time.       |
| `hunger`  | Starvation. Drains over time.        |
| `fatigue` | Exhaustion. Drains with movement.    |

## Action Speed

Configurable player action timing.

| Stat         | Description                                   |
|--------------|-----------------------------------------------|
| `attackSpeed` | Number of swing attacks started per second. |

## Damage

Flat outgoing damage per type. Applied on hit before target resist.

| Stat              | Description              |
|-------------------|--------------------------|
| `physicalDamage`  | Melee / ranged attacks.  |
| `magicDamage`     | Spells and arcane hits.  |
| `fireDamage`      | Fire-based attacks.      |
| `iceDamage`       | Ice-based attacks.       |
| `electricDamage`  | Lightning-based attacks. |

## Resist

Damage reduction per type. Applied on incoming hit.

| Stat              | Description                        |
|-------------------|------------------------------------|
| `physicalResist`  | Reduces incoming physical damage.  |
| `magicResist`     | Reduces incoming magic damage.     |
| `fireResist`      | Reduces incoming fire damage.      |
| `iceResist`       | Reduces incoming ice damage.       |
| `electricResist`  | Reduces incoming electric damage.  |

## Critical Chance

Per-type chance to deal a critical hit. Range: `0–100` (percentage).

| Stat                  | Description                           |
|-----------------------|---------------------------------------|
| `physicalCritChance`  | Crit chance for physical attacks.     |
| `magicCritChance`     | Crit chance for magic attacks.        |
| `fireCritChance`      | Crit chance for fire attacks.         |
| `iceCritChance`       | Crit chance for ice attacks.          |
| `electricCritChance`  | Crit chance for electric attacks.     |

## Critical Rate

Per-type damage multiplier applied on a critical hit. Default: `1.5`.

| Stat                 | Description                                      |
|----------------------|--------------------------------------------------|
| `physicalCritRate`   | Damage multiplier for physical crits. (×1.5)     |
| `magicCritRate`      | Damage multiplier for magic crits. (×1.5)        |
| `fireCritRate`       | Damage multiplier for fire crits. (×1.5)         |
| `iceCritRate`        | Damage multiplier for ice crits. (×1.5)          |
| `electricCritRate`   | Damage multiplier for electric crits. (×1.5)     |

---

## Open Questions

- Are damage/resist/crit flat numbers or do they split into `base` + `bonus` (for equipment math)?
