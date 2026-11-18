import { describe, expect, it } from 'vitest';
import { SKILL_CATALOG } from '../src/extensible/items/itemCatalog';
import { formatSkillEffect } from '../src/sim/skillEffectText';

/**
 * Skill descriptions are the only place the game shows a skill's effect, so
 * every description must state concrete numbers (multiplier, status values,
 * charges) — flavor-only text is a defect. New skills should append the
 * mechanically generated clause from formatSkillEffect so the text cannot
 * drift from the data.
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
});
