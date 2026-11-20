/**
 * Realm-wide enemy difficulty tuning.
 *
 * Floor definitions carry a per-encounter enemyStatScale; this module adds
 * one realm-wide multiplier on top, so overall difficulty can be tuned in
 * a single place (measured with the calibrated playtest bot) instead of
 * editing every floor definition. Realms are 50-floor bands by design.
 *
 * Shipped curve (user's design, 2026-11-20): the opening is light and
 * the realm gets heavier toward the end. Floors 1-10 stay at 1.0 (nearly
 * deathless for the calibrated bot: 0.06 deaths), the scale ramps
 * linearly to 1.38 at floor 49, and the apex (50F) uses 1.05 because the
 * boss fight is long and wound-driven — its deaths come from arrival
 * state as much as its own stats. Measured total for the calibrated bot:
 * 0.84 deaths per Realm 1 clear (target 0.5-1.0), split 1-10F 0.08 /
 * 11-30F 0.01 / 31-49F 0.53 / 50F 0.22. The response is cliff-like
 * above this (peak 1.42 already gives 1.28), so re-measure after any
 * change.
 */
export const DIFFICULTY_TUNING = {
  /** Peak scale: the uniform value, or the ramp's value at floor 49 when ramping. */
  realm1Scale: 1.38,
  /** When true, the scale ramps linearly from 1.0 at realm1RampFrom to realm1Scale at floor 49. */
  realm1Ramp: true,
  /** Floors at or below this stay at 1.0 while ramping (light opening: dying before your build comes together feels unfair). */
  realm1RampFrom: 10,
  /** Floor 50 (the apex) always uses this scale: the boss has its own multipliers and walls quickly under a ramp peak. */
  realm1ApexScale: 1.05,
};

export function realmEnemyScale(floor: number): number {
  if (floor < 1 || floor > 50) return 1.0;
  if (floor === 50) return DIFFICULTY_TUNING.realm1ApexScale;
  const m = DIFFICULTY_TUNING.realm1Scale;
  if (!DIFFICULTY_TUNING.realm1Ramp) return m;
  const from = DIFFICULTY_TUNING.realm1RampFrom;
  if (floor <= from) return 1.0;
  return 1 + (m - 1) * ((floor - from) / (49 - from));
}
