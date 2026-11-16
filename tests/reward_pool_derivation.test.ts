import { describe, expect, it } from 'vitest';
import { enemyGoldReward } from '../src/extensible/enemies/enemyGold';
import { EnemyDefinition } from '../src/extensible/enemies/types';
import {
  ARMOR_CATALOG,
  CONSUMABLE_CATALOG,
  WEAPON_CATALOG,
} from '../src/extensible/items/itemCatalog';
import {
  equipmentCaps,
  resolveRewardPool,
} from '../src/extensible/items/rewardPoolDerivation';
import { FloorDefinition } from '../src/extensible/realms/realm_01_greenwood';
import { ALL_FLOORS } from '../src/extensible/realms/realmIndex';

/** Debut floor recomputed independently from authored pools. */
function debutOf(id: string): number | undefined {
  let best: number | undefined;
  for (const [num, def] of Object.entries(ALL_FLOORS)) {
    const pool = def.rewardPool;
    if (!pool) continue;
    const all = [
      ...pool.equipmentIds,
      ...pool.skillIds,
      ...pool.utilityIds,
      ...(pool.consumableIds ?? []),
    ];
    if (all.includes(id)) {
      const f = Number(num);
      if (best === undefined || f < best) best = f;
    }
  }
  return best;
}

function poolLessFloor(floor: number, realm: number): FloorDefinition {
  return { floor, realm, title: 'test', subtitle: 'test', encounters: [] };
}

describe('resolveRewardPool', () => {
  it('returns the authored pool unchanged for authored floors', () => {
    const authored = ALL_FLOORS[5];
    expect(authored.rewardPool).toBeDefined();
    expect(resolveRewardPool(authored)).toBe(authored.rewardPool);
  });

  it('derives a band-filtered own+previous block pool for a pool-less floor', () => {
    const pool = resolveRewardPool(poolLessFloor(14, 1));
    expect(pool.equipmentIds.length).toBeGreaterThan(0);
    expect(pool.skillIds.length).toBeGreaterThan(0);
    expect(pool.utilityIds.length).toBeGreaterThan(0);
    // Non-boss floor: no consumables, mirroring authored pools.
    expect(pool.consumableIds).toEqual([]);
    const caps = equipmentCaps(1, 14);
    for (const id of pool.equipmentIds) {
      const debut = debutOf(id);
      expect(debut).toBeDefined();
      expect(debut!).toBeGreaterThanOrEqual(1);
      expect(debut!).toBeLessThanOrEqual(20);
      const weapon = WEAPON_CATALOG[id];
      if (weapon) {
        expect(weapon.atk).toBeLessThanOrEqual(caps.weaponAtk);
      } else {
        const armor = ARMOR_CATALOG[id];
        expect(armor).toBeDefined();
        expect(armor.def).toBeLessThanOrEqual(caps.armorDef);
        expect(armor.maxHpBonus).toBeLessThanOrEqual(caps.armorHp);
      }
    }
    for (const id of [...pool.skillIds, ...pool.utilityIds]) {
      const debut = debutOf(id);
      expect(debut).toBeDefined();
      expect(debut!).toBeGreaterThanOrEqual(1);
      expect(debut!).toBeLessThanOrEqual(20);
    }
  });

  it('derives consumables only on boss floors', () => {
    const pool = resolveRewardPool(poolLessFloor(15, 1));
    expect(pool.consumableIds!.length).toBeGreaterThan(0);
    for (const id of pool.consumableIds!) {
      expect(CONSUMABLE_CATALOG[id]).toBeDefined();
      const debut = debutOf(id);
      expect(debut).toBeDefined();
      expect(debut!).toBeLessThanOrEqual(20);
    }
  });

  it('does not leak previous-realm items across a realm boundary', () => {
    const pool = resolveRewardPool(poolLessFloor(51, 2));
    const all = [
      ...pool.equipmentIds,
      ...pool.skillIds,
      ...pool.utilityIds,
      ...(pool.consumableIds ?? []),
    ];
    expect(all.length).toBeGreaterThan(0);
    for (const id of all) {
      const debut = debutOf(id);
      expect(debut).toBeDefined();
      expect(debut!).toBeGreaterThanOrEqual(51);
    }
  });
});

describe('enemyGoldReward', () => {
  const base: EnemyDefinition = {
    id: 'test_enemy',
    name: 'テスト',
    spriteId: 'slime',
    palette: 'emerald_slime',
    hp: 45,
    atk: 11,
    def: 2,
    phases: [],
  };

  it('passes through an explicit goldReward', () => {
    expect(enemyGoldReward({ ...base, goldReward: 4 })).toBe(4);
  });

  it('derives a regular reward inside the authored 4-10G band', () => {
    const g = enemyGoldReward(base);
    expect(g).toBeGreaterThanOrEqual(4);
    expect(g).toBeLessThanOrEqual(10);
  });

  it('derives a boss reward inside the authored miniboss band', () => {
    const g = enemyGoldReward({ ...base, hp: 84, atk: 16, isBoss: true });
    expect(g).toBeGreaterThanOrEqual(15);
    expect(g).toBeLessThanOrEqual(33);
  });
});
