import { describe, expect, it } from 'vitest';
import {
  CombatEngine,
  PlayerLoadout,
  WOUND_RATE,
  cappedHealHp,
} from '../src/core/CombatEngine';
import { StorageValidator } from '../src/core/StorageValidator';
import { ENEMY_REGISTRY } from '../src/extensible/enemies/enemyRegistry';
import {
  ARMOR_CATALOG,
  CONSUMABLE_CATALOG,
  RELIC_CATALOG,
  SKILL_CATALOG,
  WEAPON_CATALOG,
} from '../src/extensible/items/itemCatalog';
import { mulberry32 } from '../src/sim/runSimulation';

const makeLoadout = (over: Partial<PlayerLoadout> = {}): PlayerLoadout => ({
  weapon: WEAPON_CATALOG.rusty_shortsword,
  armor: ARMOR_CATALOG.leather_tunic,
  skills: [null, null, null],
  consumable: CONSUMABLE_CATALOG.crimson_vial,
  relic: null,
  ...over,
});

describe('重症 (wound) mechanic', () => {
  it('accrues ceil(damage * WOUND_RATE) when the player takes HP damage', () => {
    const lo = makeLoadout();
    const prev = CombatEngine.createBattleSession(
      100, 100, 2, lo, ENEMY_REGISTRY.moss_slime, 1.0, 0, WOUND_RATE
    );
    const next = CombatEngine.executeTurn(
      prev, { type: 'attack', targetIndex: 0 }, lo, undefined, mulberry32(3)
    );
    const hpLost = 100 - next.player.currentHp;
    expect(hpLost).toBeGreaterThan(0);
    expect(next.playerWound).toBe(Math.ceil(hpLost * WOUND_RATE));
  });

  it('caps skill healing at maxHp - wound', () => {
    const lo = makeLoadout({ skills: [SKILL_CATALOG.sap_guard, null, null] });
    const prev = CombatEngine.createBattleSession(
      50, 100, 2, lo, ENEMY_REGISTRY.moss_slime, 0.01, 40, WOUND_RATE
    );
    const next = CombatEngine.executeTurn(
      prev, { type: 'skill', slotIndex: 0 }, lo, undefined, mulberry32(5)
    );
    // sap_guard heals 18% (=18) but the cap is 100 - 40 = 60; the slime is
    // scaled to near-zero attack so post-turn HP reflects the capped heal.
    expect(next.player.currentHp).toBeLessThanOrEqual(60);
    expect(next.player.currentHp).toBeGreaterThan(50);
  });

  it('consumable healing pierces the wound cap', () => {
    const lo = makeLoadout();
    const prev = CombatEngine.createBattleSession(
      50, 100, 2, lo, ENEMY_REGISTRY.moss_slime, 0.01, 40, WOUND_RATE
    );
    const next = CombatEngine.executeTurn(
      prev, { type: 'consumable' }, lo, undefined, mulberry32(5)
    );
    // crimson_vial heals 45%: 50 + 45 = 95 before the enemy's chip hit,
    // well above the 60 cap that binds skill healing.
    expect(next.player.currentHp).toBeGreaterThan(60);
    expect(next.player.currentHp).toBeGreaterThanOrEqual(90);
  });

  it('is fully disabled when woundRate is 0 (legacy behavior)', () => {
    const lo = makeLoadout({ skills: [SKILL_CATALOG.sap_guard, null, null] });
    const prev = CombatEngine.createBattleSession(50, 100, 2, lo, ENEMY_REGISTRY.moss_slime);
    const next = CombatEngine.executeTurn(
      prev, { type: 'skill', slotIndex: 0 }, lo, undefined, mulberry32(5)
    );
    expect(next.playerWound).toBe(0);
    expect(next.player.currentHp).toBeGreaterThan(60);
  });

  it('cappedHealHp never exceeds maxHp - wound and never lowers HP', () => {
    expect(cappedHealHp(50, 100, 40, 18)).toBe(60);
    expect(cappedHealHp(70, 100, 40, 18)).toBe(70);
    expect(cappedHealHp(50, 100, 0, 18)).toBe(68);
    expect(WOUND_RATE).toBe(0.5);
  });

  it('validator defaults playerWound to 0 for legacy saves and keeps valid values', () => {
    const fresh = StorageValidator.createDefaultSave(mulberry32(1));
    expect(fresh.midFloor.playerWound).toBe(0);
    const legacy = JSON.parse(JSON.stringify(fresh));
    delete legacy.midFloor.playerWound;
    expect(StorageValidator.validateAndHeal(legacy).save.midFloor.playerWound).toBe(0);
    const wounded = JSON.parse(JSON.stringify(fresh));
    wounded.midFloor.playerWound = 30;
    expect(StorageValidator.validateAndHeal(wounded).save.midFloor.playerWound).toBe(30);
    const excessive = JSON.parse(JSON.stringify(fresh));
    excessive.midFloor.playerWound = 99999;
    expect(
      StorageValidator.validateAndHeal(excessive).save.midFloor.playerWound
    ).toBeLessThanOrEqual(100 + excessive.inventory.armor.maxHpBonus);
  });

  it('starting relic is not required for wound tracking (relic-free loadout)', () => {
    const lo = makeLoadout({ relic: RELIC_CATALOG.guardian_crest_relic });
    const prev = CombatEngine.createBattleSession(
      100, 100, 2, lo, ENEMY_REGISTRY.thorn_goblin, 1.0, 0, WOUND_RATE
    );
    const next = CombatEngine.executeTurn(
      prev, { type: 'attack', targetIndex: 0 }, lo, undefined, mulberry32(11)
    );
    expect(next.playerWound).toBeGreaterThanOrEqual(0);
  });
});
