import { ITEM_POWER_TABLE } from './itemPowerData';

/**
 * Measured item strength, produced by the paired A/B item benchmark
 * (force-hold the item from a mid-tower checkpoint vs the typical item
 * it replaces; the delta in deaths / end HP / turns over the debut
 * block is the item's power). The difficulty bot values items from
 * this table so its shopping judgment is calibrated by outcomes, not
 * by hand-written heuristics. Items missing from the table (e.g. from
 * a brand-new floor) fall back to the heuristics in PlaytestBot.
 */
let overrides: Record<string, number> | null = null;

/** Test/benchmark hook: replace the shipped table (null = shipped). */
export function setItemPowerOverrides(map: Record<string, number> | null): void {
  overrides = map;
}

export function measuredItemPower(id: string, floor?: number): number | null {
  const table = overrides ?? ITEM_POWER_TABLE;
  if (floor !== undefined) {
    // Item strength is contextual: prefer the value measured in the
    // block the decision happens in, fall back to the debut-block value.
    const blockStart = Math.floor((floor - 1) / 10) * 10 + 1;
    const contextual = table[`${id}@${blockStart}`];
    if (contextual !== undefined) return contextual;
  }
  return table[id] ?? null;
}
