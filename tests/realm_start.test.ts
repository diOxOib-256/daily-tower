import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PROFILE_STORAGE_KEY,
  backfillProfileFromSlots,
  deriveUnlockedRealmFromSaves,
  getSelectableStartRealms,
  loadProfile,
  realmFromFloor,
  recordUnlockedRealm,
  sanitizeProfile,
  saveProfile,
} from '../src/core/PlayerProfile';
import { saveSlotData } from '../src/core/SaveSlotManager';
import {
  BASE_PLAYER_MAX_HP,
  SaveData,
  StorageValidator,
} from '../src/core/StorageValidator';
import {
  ARMOR_CATALOG,
  STARTING_SKILL_POOL_IDS,
  WEAPON_CATALOG,
} from '../src/extensible/items/itemCatalog';
import {
  LATEST_AUTHORED_FLOOR,
  REALM_METADATA,
} from '../src/extensible/realms/realmIndex';
import { mulberry32 } from '../src/sim/runSimulation';

function makeSaveWithMaxFloor(maxFloorReached: number, currentFloor = 1): SaveData {
  const base = StorageValidator.createDefaultSave(mulberry32(1));
  return {
    ...base,
    midFloor: {
      ...base.midFloor,
      currentFloor,
    },
    playStats: {
      maxFloorReached,
      battlesWon: 0,
      enemiesDefeated: 0,
      leaps: maxFloorReached >= 51 ? 1 : 0,
    },
  };
}

describe('Realm start unlock & PlayerProfile', () => {
  let store: Record<string, string> = {};

  const mockLocalStorage = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };

  beforeEach(() => {
    store = {};
    vi.restoreAllMocks();
    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('realmFromFloor & deriveUnlockedRealmFromSaves', () => {
    it('does not unlock Realm 2 at maxFloorReached 50', () => {
      expect(realmFromFloor(50)).toBe(1);
      expect(deriveUnlockedRealmFromSaves([makeSaveWithMaxFloor(50, 50)])).toBe(1);
    });

    it('unlocks Realm 2 at maxFloorReached 51 and 59', () => {
      expect(realmFromFloor(51)).toBe(2);
      expect(realmFromFloor(59)).toBe(2);
      expect(deriveUnlockedRealmFromSaves([makeSaveWithMaxFloor(59, 55)])).toBe(2);
    });

    it('takes the maximum unlocked realm across multiple slots', () => {
      const saves = [
        makeSaveWithMaxFloor(12, 10),
        makeSaveWithMaxFloor(59, 52),
        makeSaveWithMaxFloor(50, 50),
      ];
      expect(deriveUnlockedRealmFromSaves(saves)).toBe(2);
    });
  });

  describe('backfillProfileFromSlots', () => {
    it('backfills unlockedStartRealm to 2 when profile is absent and a slot reached >= 51', () => {
      expect(store[PROFILE_STORAGE_KEY]).toBeUndefined();
      saveSlotData(1, makeSaveWithMaxFloor(30, 25));
      saveSlotData(2, makeSaveWithMaxFloor(55, 51));

      const profile = backfillProfileFromSlots();
      expect(profile.unlockedStartRealm).toBe(2);
      expect(loadProfile().unlockedStartRealm).toBe(2);
    });

    it('keeps unlockedStartRealm at 1 when all slots are <= 50', () => {
      saveSlotData(1, makeSaveWithMaxFloor(50, 50));

      const profile = backfillProfileFromSlots();
      expect(profile.unlockedStartRealm).toBe(1);
    });

    it('does not downgrade an already higher profile value', () => {
      saveProfile({ unlockedStartRealm: 3 });
      saveSlotData(1, makeSaveWithMaxFloor(10, 10));

      const profile = backfillProfileFromSlots();
      expect(profile.unlockedStartRealm).toBe(3);
      expect(recordUnlockedRealm(2).unlockedStartRealm).toBe(3);
    });
  });

  describe('profile self-healing', () => {
    it('heals corrupted or missing values to unlockedStartRealm = 1 without throwing', () => {
      expect(sanitizeProfile(null)).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile(undefined)).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile('broken')).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile([])).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile({ unlockedStartRealm: 0 })).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile({ unlockedStartRealm: -5 })).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile({ unlockedStartRealm: NaN })).toEqual({ unlockedStartRealm: 1 });
      expect(sanitizeProfile({ unlockedStartRealm: '2' })).toEqual({ unlockedStartRealm: 1 });

      store[PROFILE_STORAGE_KEY] = '{not valid json';
      expect(() => loadProfile()).not.toThrow();
      expect(loadProfile()).toEqual({ unlockedStartRealm: 1 });

      store[PROFILE_STORAGE_KEY] = JSON.stringify({ unlockedStartRealm: -10 });
      expect(loadProfile()).toEqual({ unlockedStartRealm: 1 });
    });
  });

  describe('getSelectableStartRealms', () => {
    it('returns only realms up to unlockedStartRealm and within LATEST_AUTHORED_FLOOR', () => {
      expect(getSelectableStartRealms(1).map((r) => r.realm)).toEqual([1]);

      const realmsAt2 = getSelectableStartRealms(2);
      expect(realmsAt2.map((r) => r.realm)).toEqual([1, 2]);
      expect(realmsAt2[1].startFloor).toBe(51);
      expect(realmsAt2[1].name).toBe(REALM_METADATA[2].name);
      for (const r of realmsAt2) {
        expect(r.startFloor).toBeLessThanOrEqual(LATEST_AUTHORED_FLOOR);
      }
    });
  });
});

describe('StorageValidator.createSaveForRealmStart', () => {
  it('matches createDefaultSave for startRealm = 1 with the same rng', () => {
    const def = StorageValidator.createDefaultSave(mulberry32(99));
    const realm1 = StorageValidator.createSaveForRealmStart(1, mulberry32(99));
    expect(realm1).toEqual(def);
  });

  it('creates a properly initialized Realm 2 save', () => {
    const save = StorageValidator.createSaveForRealmStart(2, mulberry32(42));
    const expectedMaxHp = BASE_PLAYER_MAX_HP + ARMOR_CATALOG.bark_cuirass.maxHpBonus;

    expect(save.midFloor.currentFloor).toBe(51);
    expect(save.midFloor.currentEncounterIndex).toBe(0);
    expect(save.midFloor.playerWound).toBe(0);
    expect(save.midFloor.playerCurrentHp).toBe(expectedMaxHp);
    expect(save.midFloor.consumableCharges).toBe(2);

    expect(save.inventory.weapon.id).toBe(WEAPON_CATALOG.verdant_blade.id);
    expect(save.inventory.armor.id).toBe(ARMOR_CATALOG.bark_cuirass.id);
    expect(save.inventory.consumable?.id).toBe('crimson_vial');
    expect(save.inventory.relic?.id).toBe('guardian_crest_relic');

    const [s1, s2, s3] = save.inventory.skills;
    expect(s1).not.toBeNull();
    expect(s2).not.toBeNull();
    expect(s3).toBeNull();
    expect(s1!.id).not.toBe(s2!.id);
    expect(STARTING_SKILL_POOL_IDS).toContain(s1!.id);
    expect(STARTING_SKILL_POOL_IDS).toContain(s2!.id);

    expect(save.gold).toBe(2500);
    expect(save.cosmeticGems).toBe(10);
    expect(save.archive).toEqual([]);
    expect(typeof save.worldSeed).toBe('number');
    expect(save.playStats?.maxFloorReached).toBe(51);
    expect(save.playStats?.leaps).toBe(0);
  });
});
