import {
  ARMOR_CATALOG,
  CONSUMABLE_CATALOG,
  RELIC_CATALOG,
  SKILL_CATALOG,
  WEAPON_CATALOG,
} from './itemCatalog';
import { ALL_FLOORS } from '../realms/realmIndex';
import { FloorDefinition, FloorRewardPool } from '../realms/realm_01_greenwood';

/**
 * Reward-pool derivation for floors that do not author an explicit pool.
 *
 * Authored floors keep their explicit `rewardPool` untouched; this module
 * only serves pool-less floors (new drafts may omit the pool entirely).
 *
 * An item's debut floor is the earliest authored pool containing it.
 * Items that appear in no pool yet (brand-new content) can declare their
 * debut here instead — one line per item:
 */
export const ITEM_DEBUT_OVERRIDES: Record<string, number> = {
  verdant_battleaxe: 21,
  rending_cleave: 21,
  mycelial_crystal: 21,
  carapace_cuirass: 22,
  whirlwind_slash: 22,
  elder_regrowth: 23,
  spirit_crest: 23,
  spore_ignition: 24,
  ancient_staff: 25,
  shell_fortress: 25,
  sovereign_nectar: 25,
  verdant_war_cry: 26,
  deepwood_plate: 27,
  corrosive_haze: 27,
  colossus_draught: 30,
  rootbreaker_mace: 31,
  earthshatter_blow: 31,
  hornet_stinger: 31,
  amber_scale_mail: 32,
  briar_tempest: 32,
  warden_vitality: 33,
  root_medallion: 33,
  cinder_burst: 34,
  verdant_halberd: 35,
  amber_aegis: 35,
  royal_amber_jelly: 35,
  primal_surge: 36,
  rootguard_plate: 37,
  wraith_chill: 37,
  warden_sap_vial: 40,
};

let debutCache: Map<string, number> | null = null;

function debutIndex(): Map<string, number> {
  if (debutCache) return debutCache;
  const map = new Map<string, number>();
  const note = (id: string, floor: number) => {
    const cur = map.get(id);
    if (cur === undefined || floor < cur) map.set(id, floor);
  };
  for (const [num, def] of Object.entries(ALL_FLOORS)) {
    const pool = def.rewardPool;
    if (!pool) continue;
    const f = Number(num);
    for (const id of pool.equipmentIds) note(id, f);
    for (const id of pool.skillIds) note(id, f);
    for (const id of pool.utilityIds) note(id, f);
    for (const id of pool.consumableIds ?? []) note(id, f);
  }
  for (const [id, f] of Object.entries(ITEM_DEBUT_OVERRIDES)) note(id, f);
  debutCache = map;
  return map;
}

/** §2.8 equipment caps per 5-floor step (index 0 = step 1), before realm escalation. */
const WEAPON_ATK_CAPS_R1 = [16, 16, 18, 19, 21, 22, 23, 24, 26, 27];
const WEAPON_ATK_CAPS_R2P = [19, 19, 19, 19, 21, 22, 23, 24, 26, 27];
const ARMOR_DEF_CAPS_R1 = [5, 6, 6, 6, 7, 7, 8, 8, 9, 9];
const ARMOR_DEF_CAPS_R2P = [7, 7, 7, 7, 7, 7, 8, 8, 9, 9];
const ARMOR_HP_CAPS = [30, 30, 35, 40, 43, 48, 52, 58, 62, 68];

export function equipmentCaps(
  realm: number,
  floor: number
): { weaponAtk: number; armorDef: number; armorHp: number } {
  const rel = floor - (realm - 1) * 50;
  const step = Math.min(10, Math.max(1, Math.ceil(rel / 5)));
  const esc = realm - 1;
  const w = realm <= 1 ? WEAPON_ATK_CAPS_R1 : WEAPON_ATK_CAPS_R2P;
  const d = realm <= 1 ? ARMOR_DEF_CAPS_R1 : ARMOR_DEF_CAPS_R2P;
  return {
    weaponAtk: w[step - 1] + esc,
    armorDef: d[step - 1] + esc,
    armorHp: ARMOR_HP_CAPS[step - 1] + 5 * esc,
  };
}

/**
 * The floor's effective reward pool: the authored pool when present,
 * otherwise derived from debut floors — items that debuted in the
 * floor's own 10-floor block or the previous block, within the same
 * realm, with equipment filtered by the §2.8 caps of the floor's step.
 * Consumables are derived only for miniboss/apex floors (every 5th),
 * mirroring authored pools.
 */
export function resolveRewardPool(floorDef: FloorDefinition): FloorRewardPool {
  if (floorDef.rewardPool) return floorDef.rewardPool;
  const debuts = debutIndex();
  const blockStart = Math.floor((floorDef.floor - 1) / 10) * 10 + 1;
  const windowStart = Math.max(1, blockStart - 10);
  const windowEnd = blockStart + 9;
  const realmOf = (f: number) => Math.floor((f - 1) / 50);
  const inWindow = (id: string): boolean => {
    const d = debuts.get(id);
    return (
      d !== undefined &&
      d >= windowStart &&
      d <= windowEnd &&
      realmOf(d) === realmOf(floorDef.floor)
    );
  };
  const byDebut = (a: string, b: string) =>
    (debuts.get(a) ?? 0) - (debuts.get(b) ?? 0) || a.localeCompare(b);
  const caps = equipmentCaps(floorDef.realm, floorDef.floor);

  const equipmentIds = [
    ...Object.values(WEAPON_CATALOG)
      .filter((w) => inWindow(w.id) && w.atk <= caps.weaponAtk)
      .map((w) => w.id),
    ...Object.values(ARMOR_CATALOG)
      .filter((a) => inWindow(a.id) && a.def <= caps.armorDef && a.maxHpBonus <= caps.armorHp)
      .map((a) => a.id),
  ].sort(byDebut);
  const skillIds = Object.values(SKILL_CATALOG)
    .filter((s) => inWindow(s.id))
    .map((s) => s.id)
    .sort(byDebut);
  const utilityIds = Object.values(RELIC_CATALOG)
    .filter((r) => inWindow(r.id))
    .map((r) => r.id)
    .sort(byDebut);
  const isBossFloor = floorDef.floor % 5 === 0;
  const consumableIds = isBossFloor
    ? Object.values(CONSUMABLE_CATALOG)
        .filter((c) => inWindow(c.id))
        .map((c) => c.id)
        .sort(byDebut)
    : [];

  return { equipmentIds, skillIds, utilityIds, consumableIds };
}
