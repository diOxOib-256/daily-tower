import { describe, expect, it } from 'vitest';
import {
  CONSUMABLE_CATALOG,
  RELIC_CATALOG,
  SKILL_CATALOG,
} from '../src/extensible/items/itemCatalog';
import { EFFECT_REGISTRY } from '../src/extensible/effects/effectRegistry';
import {
  RELIC_EFFECT_SPECS,
  formatConsumableEffect,
  formatRelicEffect,
  formatSkillEffect,
} from '../src/sim/skillEffectText';

/**
 * Item descriptions are the only place the game shows an item's effect, so
 * every skill / relic / consumable description must state concrete numbers
 * (multiplier, status values, heal amounts, charges) — flavor-only text is
 * a defect. New items should append the mechanically generated effect text
 * from src/sim/skillEffectText.ts so the text cannot drift from the data.
 * (Weapons and armor are exempt: their ATK / DEF / HP render numerically.)
 */
describe('skill descriptions state concrete effects', () => {
  it('every skill description contains at least one digit', () => {
    const offenders = Object.values(SKILL_CATALOG)
      .filter((s) => !/[0-9]/.test(s.description))
      .map((s) => s.id);
    expect(offenders).toEqual([]);
  });

  it('formatSkillEffect covers every skill without throwing', () => {
    for (const s of Object.values(SKILL_CATALOG)) {
      expect(formatSkillEffect(s).length).toBeGreaterThan(0);
    }
  });

  it('every skill description states its key numbers (multiplier, status value, charges)', () => {
    const offenders: string[] = [];
    for (const s of Object.values(SKILL_CATALOG)) {
      if (s.damageMultiplier !== undefined && !s.description.includes(String(s.damageMultiplier))) offenders.push(`${s.id}: multiplier`);
      if (s.applyStatus && !s.description.includes(String(s.applyStatus.value))) offenders.push(`${s.id}: status value`);
      if (s.healPercent !== undefined && !s.description.includes(String(s.healPercent))) offenders.push(`${s.id}: heal`);
      if (!s.description.includes(String(s.maxChargesPerBattle))) offenders.push(`${s.id}: charges`);
    }
    expect(offenders).toEqual([]);
  });
});

describe('relic descriptions state concrete effects', () => {
  it('every relic description contains at least one digit', () => {
    const offenders = Object.values(RELIC_CATALOG)
      .filter((r) => !/[0-9]/.test(r.description))
      .map((r) => r.id);
    expect(offenders).toEqual([]);
  });

  it('every registered effect has a description spec', () => {
    const missing = Object.keys(EFFECT_REGISTRY).filter(
      (id) => !RELIC_EFFECT_SPECS[id]
    );
    expect(missing).toEqual([]);
  });

  it('formatRelicEffect covers every relic without throwing', () => {
    for (const r of Object.values(RELIC_CATALOG)) {
      expect(formatRelicEffect(r.effectId).length).toBeGreaterThan(0);
    }
  });

  it('every relic description states its key number', () => {
    const offenders: string[] = [];
    for (const r of Object.values(RELIC_CATALOG)) {
      const spec = RELIC_EFFECT_SPECS[r.effectId];
      if (!spec) continue;
      const key =
        spec.kind === 'status' ? spec.value
        : spec.kind === 'healFlat' || spec.kind === 'gold' ? spec.amount
        : spec.percent;
      if (!r.description.includes(String(key))) offenders.push(`${r.id}: key number ${key}`);
    }
    expect(offenders).toEqual([]);
  });
});

describe('consumable descriptions state concrete effects', () => {
  it('every consumable description contains at least one digit', () => {
    const offenders = Object.values(CONSUMABLE_CATALOG)
      .filter((c) => !/[0-9]/.test(c.description))
      .map((c) => c.id);
    expect(offenders).toEqual([]);
  });

  it('formatConsumableEffect covers every consumable without throwing', () => {
    for (const c of Object.values(CONSUMABLE_CATALOG)) {
      expect(formatConsumableEffect(c).length).toBeGreaterThan(0);
    }
  });

  it('every consumable description states its key numbers (heal, status value, charges)', () => {
    const offenders: string[] = [];
    for (const c of Object.values(CONSUMABLE_CATALOG)) {
      if (c.healPercent !== undefined && !c.description.includes(String(c.healPercent))) offenders.push(`${c.id}: heal`);
      if (c.applyStatus && !c.description.includes(String(c.applyStatus.value))) offenders.push(`${c.id}: status value`);
      if (!c.description.includes(String(c.maxCharges))) offenders.push(`${c.id}: charges`);
    }
    expect(offenders).toEqual([]);
  });
});
