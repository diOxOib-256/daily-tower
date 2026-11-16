import { EnemyDefinition } from './types';

/**
 * Gold paid for defeating one enemy.
 *
 * An explicit `goldReward` on the definition always wins. When a draft
 * omits it, the reward is derived from the enemy's stats so new content
 * does not need a hand-tuned gold value:
 *   base = round((hp + 2 * atk) / 12)   (Realm 1 regulars land in 6-8G,
 *   inside the authored 4-10G range; all 96 authored regulars map to
 *   3-13G under this formula)
 *   bosses (isBoss) pay double, clamped to the authored boss range.
 */
export function enemyGoldReward(def: EnemyDefinition): number {
  if (def.goldReward !== undefined) return def.goldReward;
  const base = Math.round((def.hp + 2 * def.atk) / 12);
  if (def.isBoss) return Math.min(90, Math.max(15, base * 2));
  return Math.min(25, Math.max(3, base));
}
