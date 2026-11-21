import {
  ARMOR_CATALOG,
  ArmorItem,
  SkillItem,
  WEAPON_CATALOG,
  WeaponItem,
} from '../extensible/items/itemCatalog';
import { REALM_METADATA } from '../extensible/realms/realmIndex';
import { EXTENSIBLE_COSMETICS } from '../extensible/cosmetics/cosmeticAdditions';

export interface RunArchiveRecord {
  id: string;
  realm: number;
  realmName: string;
  clearedFloor: number;
  timestamp: string;
  weaponName: string;
  armorName: string;
  skillNames: string[];
  relicName: string;
  goldEarned: number;
  gemsAwarded: number;
}

export interface CosmeticItem {
  id: string;
  name: string;
  category: 'skin' | 'theme' | 'title';
  costGems: number;
  spriteId?: string;
  paletteId?: string;
  themeClass?: string;
  titleText?: string;
  description: string;
}

const BASE_COSMETIC_SHOP_CATALOG: CosmeticItem[] = [
  {
    id: 'skin_crimson_knight',
    name: '紅蓮の覇者スキン',
    category: 'skin',
    costGems: 10,
    spriteId: 'hero_knight',
    paletteId: 'crimson_knight',
    description: '深紅と黄金の鎧を纏った騎士のドット絵スキン。',
  },
  {
    id: 'skin_astral_mage',
    name: '星詠みの魔導士スキン',
    category: 'skin',
    costGems: 15,
    spriteId: 'hero_mage',
    paletteId: 'astral_mage',
    description: '星光のローブを纏う魔導士のドット絵スキン。',
  },
  {
    id: 'skin_neon_cyber',
    name: 'ネオン・サイバースキン',
    category: 'skin',
    costGems: 20,
    spriteId: 'hero_cyber',
    paletteId: 'neon_cyber',
    description: '次元を超越したサイバーパンク仕様の特装スキン。',
  },
  {
    id: 'skin_forest_hunter',
    name: '森の狩人スキン',
    category: 'skin',
    costGems: 25,
    spriteId: 'hero_hunter',
    paletteId: 'forest_hunter',
    description: '世界樹の森を歩く狩人のドット絵スキン。フードと弓が目印。',
  },
  {
    id: 'skin_star_librarian',
    name: '星屑の司書スキン',
    category: 'skin',
    costGems: 25,
    spriteId: 'hero_librarian',
    paletteId: 'star_librarian',
    description: '星の書庫に仕える司書のドット絵スキン。大きな本を抱えている。',
  },
  {
    id: 'skin_cat_knight',
    name: '猫騎士スキン',
    category: 'skin',
    costGems: 30,
    spriteId: 'hero_cat',
    paletteId: 'cat_knight',
    description: '小さな体に大きな剣を携えた、猫騎士のドット絵スキン。',
  },
  {
    id: 'skin_skeleton_knight',
    name: '骸骨の騎士スキン',
    category: 'skin',
    costGems: 25,
    spriteId: 'hero_skeleton',
    paletteId: 'skeleton_knight',
    description: '蒼く光る剣を携えた骸骨騎士のドット絵スキン。',
  },
  {
    id: 'skin_moss_golem',
    name: '苔むすゴーレムスキン',
    category: 'skin',
    costGems: 30,
    spriteId: 'hero_golem',
    paletteId: 'hero_moss_golem',
    description: '長い眠りから目覚めた、苔むすゴーレムのドット絵スキン。',
  },
  {
    id: 'skin_star_spirit',
    name: '星屑の精霊スキン',
    category: 'skin',
    costGems: 30,
    spriteId: 'hero_spirit',
    paletteId: 'star_spirit',
    description: '星屑をまとって漂う精霊のドット絵スキン。足元に星が瞬く。',
  },
  {
    id: 'skin_frost_knight',
    name: '蒼氷の騎士スキン',
    category: 'skin',
    costGems: 15,
    spriteId: 'hero_knight',
    paletteId: 'frost_knight',
    description: '蒼氷の鎧を纏った騎士のドット絵スキン（騎士の色違い）。',
  },
  {
    id: 'skin_obsidian_knight',
    name: '漆黒の騎士スキン',
    category: 'skin',
    costGems: 15,
    spriteId: 'hero_knight',
    paletteId: 'obsidian_knight',
    description: '漆黒の鎧と赤い輝きを帯びた騎士のドット絵スキン（騎士の色違い）。',
  },
  {
    id: 'skin_sakura_mage',
    name: '桜色の魔導士スキン',
    category: 'skin',
    costGems: 15,
    spriteId: 'hero_mage',
    paletteId: 'sakura_mage',
    description: '桜色のローブを纏う魔導士のドット絵スキン（魔導士の色違い）。',
  },
  {
    id: 'title_verdant_conqueror',
    name: '称号：樹海を征す者',
    category: 'title',
    costGems: 10,
    titleText: '【樹海を征す者】',
    description: 'プレイヤー名の横に誇り高き称号を表示する。',
  },
  {
    id: 'title_dimension_walker',
    name: '称号：次元跳躍の観測者',
    category: 'title',
    costGems: 20,
    titleText: '【次元跳躍の観測者】',
    description: '幾度もの領域リセットを乗り越えた証の称号。',
  },
];

/**
 * The full shop catalog: the base list above plus cosmetics registered
 * from the extensible side (daily skin pipeline). Consumers keep reading
 * this merged list, so additions never need a core change.
 */
export const COSMETIC_SHOP_CATALOG: CosmeticItem[] = [
  ...BASE_COSMETIC_SHOP_CATALOG,
  ...EXTENSIBLE_COSMETICS,
];

export class AreaEngine {
  /**
   * Dynamic Checkpoint & Death Penalty Formula (Spec §6.3):
   * RespawnFloor = max(RealmStartFloor, N - min(30, floor(N * 0.3)))
   */
  static calculateRespawnFloor(currentFloor: number): number {
    const realmIndex = Math.floor((Math.max(1, currentFloor) - 1) / 50);
    const realmStartFloor = realmIndex * 50 + 1;
    const penalty = Math.min(30, Math.floor(currentFloor * 0.3));
    return Math.max(realmStartFloor, currentFloor - penalty);
  }

  /**
   * Executes the 50-Floor Dimensional Leap:
   * - Creates a permanent RunArchiveRecord
   * - Awards Cosmetic Gems (15 gems per 50F clear)
   * - Resets equipment to the new Realm's normalized baseline gear
   */
  static executeDimensionalLeap(params: {
    clearedFloor: number;
    weapon: WeaponItem;
    armor: ArmorItem;
    skills: [SkillItem | null, SkillItem | null, SkillItem | null];
    relicName: string;
    gold: number;
    /** Skill the player chose to carry into the new realm (2026-11-20:
     * the leap asks the player when they hold two or more skills). When
     * omitted, or not among the held skills, the first non-null skill
     * in slot order is carried, as before. */
    carriedSkillId?: string | null;
  }): {
    nextFloor: number;
    nextRealm: number;
    normalizedWeapon: WeaponItem;
    normalizedArmor: ArmorItem;
    normalizedSkills: [SkillItem | null, SkillItem | null, SkillItem | null];
    gemsAwarded: number;
    archiveRecord: RunArchiveRecord;
  } {
    const clearedRealm = Math.floor((params.clearedFloor - 1) / 50) + 1;
    const nextFloor = params.clearedFloor + 1;
    const nextRealm = clearedRealm + 1;
    const meta = REALM_METADATA[clearedRealm] ?? REALM_METADATA[1];
    const gemsAwarded = 15;

    const archiveRecord: RunArchiveRecord = {
      id: `archive_${Date.now()}_f${params.clearedFloor}`,
      realm: clearedRealm,
      realmName: meta.name,
      clearedFloor: params.clearedFloor,
      timestamp: new Date().toISOString(),
      weaponName: params.weapon.name,
      armorName: params.armor.name,
      skillNames: params.skills.filter(Boolean).map((s) => s!.name),
      relicName: params.relicName,
      goldEarned: params.gold,
      gemsAwarded,
    };

    // Normalized baseline gear for the new Realm to prevent exponential stat overflow
    const normalizedWeapon =
      nextRealm >= 2 ? WEAPON_CATALOG.verdant_blade : WEAPON_CATALOG.rusty_shortsword;
    const normalizedArmor =
      nextRealm >= 2 ? ARMOR_CATALOG.bark_cuirass : ARMOR_CATALOG.leather_tunic;
    // Carry over exactly one skill into the new realm (design:
    // 2026-11-14), placed in slot 0; the other two slots start empty
    // so the new realm's skill cards rebuild the kit. Since 2026-11-20
    // the player chooses the skill when they hold two or more (the
    // store passes carriedSkillId); without a choice the first
    // non-null skill in slot order is carried. Previously this granted
    // power_slash plus the slot-0 skill, which duplicated power_slash
    // whenever it was already in slot 0.
    const chosen = params.carriedSkillId
      ? params.skills.find((s) => s?.id === params.carriedSkillId) ?? null
      : null;
    const carriedSkill =
      chosen ?? params.skills[0] ?? params.skills[1] ?? params.skills[2] ?? null;
    const normalizedSkills: [SkillItem | null, SkillItem | null, SkillItem | null] = [
      carriedSkill,
      null,
      null,
    ];

    return {
      nextFloor,
      nextRealm,
      normalizedWeapon,
      normalizedArmor,
      normalizedSkills,
      gemsAwarded,
      archiveRecord,
    };
  }

  static formatShareText(record: RunArchiveRecord): string {
    const skills = record.skillNames.length > 0 ? record.skillNames.join(' / ') : 'なし';
    return [
      `🏰 【Daily Tower 登頂記録】`,
      `領域: Realm ${record.realm} 「${record.realmName}」 (${record.clearedFloor}F 踏破!)`,
      `⚔️ 武器: ${record.weaponName} | 🛡️ 防具: ${record.armorName}`,
      `✨ スキル: ${skills}`,
      `🔮 レリック: ${record.relicName}`,
      `💎 獲得ジェム: +${record.gemsAwarded} | 💰 所持金: ${record.goldEarned}G`,
      `#DailyTower`,
    ].join('\n');
  }
}
