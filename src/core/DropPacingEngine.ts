import {
  AnyCatalogItem,
  ARMOR_CATALOG,
  ArmorItem,
  CONSUMABLE_CATALOG,
  RELIC_CATALOG,
  SKILL_CATALOG,
  WEAPON_CATALOG,
  WeaponItem,
} from '../extensible/items/itemCatalog';
import { resolveRewardPool } from '../extensible/items/rewardPoolDerivation';
import { FloorDefinition } from '../extensible/realms/realm_01_greenwood';

export interface RewardCard {
  slot: 1 | 2 | 3;
  title: string;
  subtitle: string;
  type: 'item' | 'potion_refill' | 'gold_bonus';
  item?: AnyCatalogItem;
  potionRefillAmount?: number;
  goldBonusAmount?: number;
}

export interface OwnedRewardInfo {
  skillIds: string[];
  weaponId?: string;
  armorId?: string;
  relicId?: string | null;
  consumableId?: string | null;
  /** Current equipment stats, used to filter strictly-dominated offers. */
  weaponAtk?: number;
  weaponElement?: string;
  armorDef?: number;
  armorMaxHpBonus?: number;
}

export class DropPacingEngine {
  /**
   * A weapon offer is strictly dominated when it is weaker than the current
   * weapon AND shares its element (a different element can still be a
   * useful sidegrade against enemy weaknesses, so those stay offerable).
   */
  static isWeaponDominated(
    candidate: WeaponItem,
    current: { atk: number; element: string }
  ): boolean {
    // An effect-bearing weapon is never strictly dominated: its value is
    // not captured by ATK alone.
    if (candidate.effectId) return false;
    return candidate.atk < current.atk && candidate.element === current.element;
  }

  /** An armor offer is strictly dominated when both stats are no better and at least one is worse. */
  static isArmorDominated(
    candidate: ArmorItem,
    current: { def: number; maxHpBonus: number }
  ): boolean {
    // Effect-bearing armor is never strictly dominated (see weapon note).
    if (candidate.effectId) return false;
    return (
      candidate.def <= current.def &&
      candidate.maxHpBonus <= current.maxHpBonus &&
      (candidate.def < current.def || candidate.maxHpBonus < current.maxHpBonus)
    );
  }

  /**
   * Generates the 3 floor-clear reward cards per Spec §3.1 and §5.3:
   * - Card 1: Equipment (Weapon OR Armor)
   * - Card 2: Skill (Attack, Heal, Buff, or Debuff)
   * - Card 3: Utility (Relic OR rare ~15% consumable charge on Miniboss / guaranteed on Apex)
   * Standard non-boss floors NEVER offer consumable charges on reward cards.
   *
   * When a slot's own pool is exhausted (everything owned or filtered out),
   * the slot substitutes an unowned item from another category instead of
   * paying out gold — gold is kept scarce on purpose, so a gold card is
   * only dealt when every category in the pool is exhausted.
   */
  static generateFloorRewardCards(
    floorDef: FloorDefinition,
    rng: () => number = Math.random,
    owned?: OwnedRewardInfo
  ): [RewardCard, RewardCard, RewardCard] {
    const pool = resolveRewardPool(floorDef);
    const isApex = floorDef.floor % 50 === 0;
    const isMiniboss = !isApex && floorDef.floor % 5 === 0;
    const goldBonusAmount = 40 + floorDef.floor;

    const makeGoldCard = (slot: 1 | 2 | 3): RewardCard => ({
      slot,
      title: '黄金の欠片',
      subtitle: `Gold +${goldBonusAmount}`,
      type: 'gold_bonus',
      goldBonusAmount,
    });

    const categoryMap: Record<string, string> = {
      attack: '攻撃技',
      heal: '回復技',
      buff: '強化技',
      debuff: '弱体技',
    };

    const makeItemCard = (slot: 1 | 2 | 3, item: AnyCatalogItem): RewardCard => {
      switch (item.kind) {
        case 'weapon':
          return { slot, title: item.name, subtitle: `武器 (ATK +${item.atk})`, type: 'item', item };
        case 'armor':
          return { slot, title: item.name, subtitle: `防具 (DEF +${item.def} / HP +${item.maxHpBonus})`, type: 'item', item };
        case 'skill':
          return { slot, title: item.name, subtitle: `${categoryMap[item.category] ?? 'スキル'}（使用回数 ${item.maxChargesPerBattle}）`, type: 'item', item };
        case 'relic':
          return { slot, title: item.name, subtitle: 'レリック', type: 'item', item };
        case 'consumable':
          return { slot, title: item.name, subtitle: `消耗品（最大${item.maxCharges}チャージ）`, type: 'item', item };
      }
    };

    const rawEquipPool: (WeaponItem | ArmorItem)[] = pool.equipmentIds
      .map((id): WeaponItem | ArmorItem | undefined => WEAPON_CATALOG[id] ?? ARMOR_CATALOG[id])
      .filter((x): x is WeaponItem | ArmorItem => Boolean(x));
    const rawSkillPool = pool.skillIds
      .map((id) => SKILL_CATALOG[id])
      .filter(Boolean);

    if (!owned) {
      // Legacy path (no ownership info): fixed fallbacks, never gold.
      const chosenEquip: WeaponItem | ArmorItem =
        rawEquipPool[Math.floor(rng() * rawEquipPool.length)] ??
        WEAPON_CATALOG.verdant_blade;
      const card1 = makeItemCard(1, chosenEquip);

      const chosenSkill =
        rawSkillPool[Math.floor(rng() * rawSkillPool.length)] ??
        SKILL_CATALOG.power_slash;
      const card2 = makeItemCard(2, chosenSkill);

      let card3: RewardCard;
      if (isApex) {
        card3 = {
          slot: 3,
          title: '領域突破の霊薬充填',
          subtitle: '秘薬 +1回分 補充',
          type: 'potion_refill',
          potionRefillAmount: 1,
        };
      } else if (isMiniboss && rng() < 0.15) {
        card3 = {
          slot: 3,
          title: '希少な秘薬の雫',
          subtitle: '秘薬 +1回分 補充',
          type: 'potion_refill',
          potionRefillAmount: 1,
        };
      } else {
        const relicPool = pool.utilityIds
          .map((id) => RELIC_CATALOG[id])
          .filter(Boolean);
        const chosenRelic =
          relicPool[Math.floor(rng() * relicPool.length)] ?? RELIC_CATALOG.vampiric_fang_relic;
        card3 = makeItemCard(3, chosenRelic);
      }
      return [card1, card2, card3];
    }

    // Owned path: filter out owned / strictly-dominated offers per category.
    const equipPool = rawEquipPool.filter((item) => {
      if (item.id === owned.weaponId || item.id === owned.armorId) return false;
      if (
        item.kind === 'weapon' &&
        owned.weaponAtk !== undefined &&
        owned.weaponElement !== undefined &&
        DropPacingEngine.isWeaponDominated(item, {
          atk: owned.weaponAtk,
          element: owned.weaponElement,
        })
      ) {
        return false;
      }
      if (
        item.kind === 'armor' &&
        owned.armorDef !== undefined &&
        owned.armorMaxHpBonus !== undefined &&
        DropPacingEngine.isArmorDominated(item, {
          def: owned.armorDef,
          maxHpBonus: owned.armorMaxHpBonus,
        })
      ) {
        return false;
      }
      return true;
    });
    const ownedSkillSet = new Set(owned.skillIds);
    const skillPool = rawSkillPool.filter((skill) => !ownedSkillSet.has(skill.id));
    const relicPool = pool.utilityIds
      .map((id) => RELIC_CATALOG[id])
      .filter((r) => Boolean(r) && r.id !== owned.relicId);
    const consumablePool = (pool.consumableIds ?? [])
      .map((id) => CONSUMABLE_CATALOG[id])
      .filter((c) => Boolean(c) && c.id !== owned.consumableId);

    // Picks never repeat an item already dealt to another card this floor.
    const chosenIds = new Set<string>();
    const pick = <T extends AnyCatalogItem>(candidates: T[]): T | undefined => {
      const avail = candidates.filter((i) => !chosenIds.has(i.id));
      if (avail.length === 0) return undefined;
      const item = avail[Math.floor(rng() * avail.length)];
      chosenIds.add(item.id);
      return item;
    };
    const pickAcross = (
      pools: AnyCatalogItem[][]
    ): AnyCatalogItem | undefined => {
      for (const p of pools) {
        const item = pick(p);
        if (item) return item;
      }
      return undefined;
    };

    // Card 1: Equipment (substitutes another category before paying gold)
    const card1Item = pickAcross([equipPool, skillPool, relicPool, consumablePool]);
    const card1 = card1Item ? makeItemCard(1, card1Item) : makeGoldCard(1);

    // Card 2: Skill (substitutes another category before paying gold)
    const card2Item = pickAcross([skillPool, equipPool, relicPool, consumablePool]);
    const card2 = card2Item ? makeItemCard(2, card2Item) : makeGoldCard(2);

    // Card 3: Utility (Strictly enforce consumable scarcity per Spec §3.1)
    let card3: RewardCard;
    if (isApex) {
      card3 = {
        slot: 3,
        title: '領域突破の霊薬充填',
        subtitle: '秘薬 +1回分 補充',
        type: 'potion_refill',
        potionRefillAmount: 1,
      };
    } else if (isMiniboss && rng() < 0.15) {
      card3 = {
        slot: 3,
        title: '希少な秘薬の雫',
        subtitle: '秘薬 +1回分 補充',
        type: 'potion_refill',
        potionRefillAmount: 1,
      };
    } else {
      let card3Item: AnyCatalogItem | undefined;
      if (isMiniboss && consumablePool.length > 0 && rng() < 0.3) {
        card3Item = pick(consumablePool);
      }
      if (!card3Item) {
        card3Item = pickAcross([relicPool, consumablePool, equipPool, skillPool]);
      }
      card3 = card3Item ? makeItemCard(3, card3Item) : makeGoldCard(3);
    }

    return [card1, card2, card3];
  }
}
