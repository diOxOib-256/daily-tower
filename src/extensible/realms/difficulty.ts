/**
 * Realm-wide enemy difficulty tuning.
 *
 * Floor definitions carry a per-encounter enemyStatScale; this module adds
 * one realm-wide multiplier on top, so overall difficulty can be tuned in
 * a single place (measured with the calibrated playtest bot) instead of
 * editing every floor definition. Realms are 50-floor bands by design.
 *
 * realm1Scale = 1.10 (uniform): measured 0.56 deaths per Realm 1 clear
 * for the calibrated bot (user's target 0.5-1.0, 2026-11-20). Deaths
 * concentrate in floors 1-3, where the fixed starter kit gates the run;
 * those deaths are cheap (rollback restarts at floor 1). The response is
 * cliff-like (1.11 already gives 0.96 with floor 1 absorbing most of it,
 * and ramping the scale toward floor 50 walls the apex instead), so do
 * not raise this casually; re-measure after any change. DIFFICULTY_TUNING is a
 * mutable object so measurement scripts can sweep values in-process; the
 * shipped game always runs with the values written here.
 */
export const DIFFICULTY_TUNING = {
  realm1Scale: 1.10,
  /** When true, realm1Scale ramps linearly from 1.0 at realm1RampFrom to the full value at floor 50. */
  realm1Ramp: false,
  /** Floors at or below this stay at 1.0 while ramping (the opening is gated by the fixed starter kit). */
  realm1RampFrom: 1,
};

export function realmEnemyScale(floor: number): number {
  if (floor < 1 || floor > 50) return 1.0;
  const m = DIFFICULTY_TUNING.realm1Scale;
  if (!DIFFICULTY_TUNING.realm1Ramp) return m;
  const from = DIFFICULTY_TUNING.realm1RampFrom;
  if (floor <= from) return 1.0;
  return 1 + (m - 1) * ((floor - from) / (50 - from));
}
