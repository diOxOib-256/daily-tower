import {
  LATEST_AUTHORED_FLOOR,
  REALM_METADATA,
  RealmMetadata,
} from '../extensible/realms/realmIndex';
import { SAVE_SLOT_IDS, hasSlotData, loadSlotSave } from './SaveSlotManager';
import type { SaveData } from './StorageValidator';

export const PROFILE_STORAGE_KEY = 'DAILY_TOWER_PROFILE';

export interface PlayerProfile {
  unlockedStartRealm: number;
}

const DEFAULT_PROFILE: PlayerProfile = {
  unlockedStartRealm: 1,
};

/**
 * Computes the 1-indexed realm number from a 1-indexed floor number.
 * 1..50 -> 1, 51..100 -> 2, etc.
 */
export function realmFromFloor(floor: number): number {
  if (typeof floor !== 'number' || !Number.isFinite(floor) || floor < 1) {
    return 1;
  }
  return Math.floor((Math.floor(floor) - 1) / 50) + 1;
}

/**
 * Validates and heals an arbitrary raw value into a safe PlayerProfile.
 * Missing or corrupted values fall back to unlockedStartRealm = 1.
 */
export function sanitizeProfile(raw: unknown): PlayerProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_PROFILE };
  }
  const value = (raw as Record<string, unknown>).unlockedStartRealm;
  if (typeof value === 'number' && Number.isFinite(value) && value >= 1) {
    return { unlockedStartRealm: Math.floor(value) };
  }
  return { ...DEFAULT_PROFILE };
}

export function loadProfile(): PlayerProfile {
  try {
    const rawStr = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!rawStr) {
      return { ...DEFAULT_PROFILE };
    }
    const parsed: unknown = JSON.parse(rawStr);
    return sanitizeProfile(parsed);
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    const safe = sanitizeProfile(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Raises unlockedStartRealm to at least `realm` and persists when updated.
 */
export function recordUnlockedRealm(realm: number): PlayerProfile {
  const current = loadProfile();
  const safeRealm =
    typeof realm === 'number' && Number.isFinite(realm) && realm >= 1
      ? Math.floor(realm)
      : 1;
  const nextRealm = Math.max(current.unlockedStartRealm, safeRealm);
  const next: PlayerProfile = { unlockedStartRealm: nextRealm };
  if (nextRealm > current.unlockedStartRealm) {
    saveProfile(next);
  }
  return next;
}

/**
 * Derives the highest unlocked start realm from a collection of saves
 * based on each save's playStats.maxFloorReached.
 */
export function deriveUnlockedRealmFromSaves(
  saves: ReadonlyArray<Pick<SaveData, 'midFloor' | 'playStats'>>
): number {
  let maxRealm = 1;
  for (const save of saves) {
    const maxFloor =
      save.playStats?.maxFloorReached ?? save.midFloor?.currentFloor ?? 1;
    const realm = realmFromFloor(maxFloor);
    if (realm > maxRealm) {
      maxRealm = realm;
    }
  }
  return maxRealm;
}

/**
 * Scans all existing save slots and backfills the global profile if any slot
 * has already reached a higher realm than currently recorded.
 */
export function backfillProfileFromSlots(): PlayerProfile {
  const existingSaves: SaveData[] = [];
  for (const slotId of SAVE_SLOT_IDS) {
    if (hasSlotData(slotId)) {
      existingSaves.push(loadSlotSave(slotId));
    }
  }
  const derivedRealm = deriveUnlockedRealmFromSaves(existingSaves);
  return recordUnlockedRealm(derivedRealm);
}

/**
 * Returns realms selectable as a starting point:
 * realm <= unlockedStartRealm and startFloor <= LATEST_AUTHORED_FLOOR.
 */
export function getSelectableStartRealms(
  unlockedStartRealm: number
): RealmMetadata[] {
  const safeUnlocked =
    typeof unlockedStartRealm === 'number' &&
    Number.isFinite(unlockedStartRealm) &&
    unlockedStartRealm >= 1
      ? Math.floor(unlockedStartRealm)
      : 1;
  return Object.values(REALM_METADATA)
    .filter(
      (meta) =>
        meta.realm <= safeUnlocked && meta.startFloor <= LATEST_AUTHORED_FLOOR
    )
    .sort((a, b) => a.realm - b.realm);
}
