/**
 * Mechanically formats a skill's concrete effect clause from its structured
 * data, in the catalog's established description style. Used to append the
 * effect text to flavor-only skill descriptions so the numbers shown in-game
 * always match the data. Dev tooling only; not imported by the app.
 */
import type { ConsumableItem, SkillItem } from '../extensible/items/itemCatalog';

const fmtMult = (m: number): string => String(m);

export function formatSkillEffect(skill: SkillItem): string {
  const parts: string[] = [];
  const all = skill.targetScope === 'all_enemies';
  const st = skill.applyStatus;

  if (skill.damageMultiplier !== undefined) {
    parts.push(
      all
        ? `敵全体に${fmtMult(skill.damageMultiplier)}倍ダメージ`
        : `${fmtMult(skill.damageMultiplier)}倍ダメージ`
    );
  }
  if (skill.healPercent !== undefined) {
    parts.push(`最大HPの${skill.healPercent}%を回復`);
  }
  if (skill.healFlat !== undefined) {
    parts.push(`HPを${skill.healFlat}回復`);
  }
  if (st) {
    const v = st.value;
    const d = st.duration;
    const enemyPrefix = all ? '敵全体' : '敵';
    switch (st.statusId) {
      case 'burn':
        parts.push(`${enemyPrefix}に火傷(最大HP${v}%/${d}T)を付与`);
        break;
      case 'poison':
        parts.push(`${enemyPrefix}に猛毒(${v}ダメージ/${d}T)を付与`);
        break;
      case 'freeze':
        parts.push(`${enemyPrefix}を${d}ターン凍結(行動不能)にする`);
        break;
      case 'regen':
        parts.push(
          `${d}ターンの間、ターン開始時に最大HPの${v}%ずつ回復（合計${v * d}%）`
        );
        break;
      case 'shield':
        parts.push(`自身に${v}ダメージを吸収する障壁(${d}T)を展開`);
        break;
      case 'atk_buff':
        parts.push(
          skill.damageMultiplier !== undefined
            ? `自身に攻撃強化(+${v}%/${d}T)を付与`
            : `自身の攻撃力を${v}%上昇(${d}T)させる`
        );
        break;
      case 'def_buff':
        parts.push(
          skill.damageMultiplier !== undefined
            ? `自身に防御強化(+${v}%/${d}T)を付与`
            : `自身の防御力を${v}%上昇(${d}T)させる`
        );
        break;
      case 'atk_debuff':
        parts.push(`${enemyPrefix}の攻撃力を${v}%低下(${d}T)`);
        break;
      case 'def_debuff':
        parts.push(`${enemyPrefix}の防御力を${v}%低下(${d}T)`);
        break;
      default:
        throw new Error(
          `formatSkillEffect: unknown statusId '${st.statusId}' for skill ${skill.id}`
        );
    }
  }
  if (skill.cleanse) {
    parts.push('すべてのデバフを解除');
  }
  if (parts.length === 0) {
    throw new Error(`formatSkillEffect: no effect parts for skill ${skill.id}`);
  }
  return `${parts.join('＋')}（1戦${skill.maxChargesPerBattle}回）`;
}

/** Flavor text + mechanically generated effect clause. */
export function withEffectText(skill: SkillItem): string {
  const flavor = skill.description.replace(/\s+$/, '');
  return `${flavor}${formatSkillEffect(skill)}。`;
}

/* ------------------------------------------------------------------ */
/* Relics (and equipment effects): EFFECT_REGISTRY handlers are        */
/* functions, so their numbers cannot be read from data at runtime.    */
/* RELIC_EFFECT_SPECS mirrors each handler's payload (verified against */
/* effectRegistry.ts) in structured form; formatRelicEffect composes   */
/* the description sentence mechanically from the spec. A test asserts  */
/* every registered effect has a spec, so a new effect cannot ship     */
/* without its numbers being stated.                                   */
/* ------------------------------------------------------------------ */

export type RelicEffectSpec =
  | { triggerText: string; kind: 'status'; target: 'self' | 'enemy'; statusId: string; value: number; duration: number }
  | { triggerText: string; kind: 'healPercent'; percent: number }
  | { triggerText: string; kind: 'healFlat'; amount: number }
  | { triggerText: string; kind: 'shieldPercent'; percent: number; min: number; duration: number }
  | { triggerText: string; kind: 'gold'; amount: number }
  | { triggerText: string; kind: 'bonusDamage'; percent: number; min: number };

export const RELIC_EFFECT_SPECS: Record<string, RelicEffectSpec> = {
  vampiric_fang: { triggerText: '通常攻撃を行うたび', kind: 'healPercent', percent: 4 },
  guardian_crest: { triggerText: '戦闘開始時', kind: 'shieldPercent', percent: 15, min: 12, duration: 3 },
  berserker_idol: { triggerText: '戦闘開始時', kind: 'status', target: 'self', statusId: 'atk_buff', value: 25, duration: 3 },
  venom_gland: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'enemy', statusId: 'poison', value: 8, duration: 3 },
  golden_compass: { triggerText: '戦闘に勝利するたび', kind: 'gold', amount: 15 },
  bookmark_charm: { triggerText: '戦闘中の最初の通常攻撃で', kind: 'bonusDamage', percent: 15, min: 1 },
  forest_dewdrop: { triggerText: '戦闘開始時', kind: 'status', target: 'self', statusId: 'def_buff', value: 25, duration: 3 },
  briar_thorn: { triggerText: '通常攻撃を行うたび', kind: 'bonusDamage', percent: 12, min: 2 },
  mist_veil_bell: { triggerText: '戦闘開始時', kind: 'status', target: 'enemy', statusId: 'atk_debuff', value: 15, duration: 3 },
  elder_sap_seal: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'enemy', statusId: 'def_debuff', value: 15, duration: 2 },
  mirror_talisman: { triggerText: '戦闘開始時', kind: 'status', target: 'enemy', statusId: 'def_debuff', value: 15, duration: 3 },
  reed_whistle: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'enemy', statusId: 'atk_debuff', value: 15, duration: 2 },
  rootstone_ember_seal: { triggerText: '戦闘開始時', kind: 'status', target: 'enemy', statusId: 'burn', value: 8, duration: 3 },
  ancient_amber: { triggerText: '戦闘に勝利するたび', kind: 'gold', amount: 20 },
  worldtree_seed_heart: { triggerText: 'スキルを使用するたび', kind: 'healPercent', percent: 5 },
  canopy_crown: { triggerText: 'スキルを使用するたび', kind: 'shieldPercent', percent: 12, min: 10, duration: 2 },
  forge_cinder_talisman: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'enemy', statusId: 'burn', value: 10, duration: 3 },
  ember_leech_stone: { triggerText: '通常攻撃を行うたび', kind: 'healPercent', percent: 5 },
  steam_pressure_valve: { triggerText: '戦闘開始時', kind: 'status', target: 'self', statusId: 'flat_atk_up', value: 8, duration: 3 },
  molten_slag_seal: { triggerText: '戦闘開始時', kind: 'status', target: 'enemy', statusId: 'poison', value: 10, duration: 3 },
  obsidian_ember_lens: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'self', statusId: 'atk_buff', value: 25, duration: 2 },
  ashen_shard_talon: { triggerText: '通常攻撃を行うたび', kind: 'bonusDamage', percent: 15, min: 4 },
  steam_cog_regulator: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'self', statusId: 'def_buff', value: 25, duration: 2 },
  boiler_shell_plating: { triggerText: '通常攻撃を行うたび', kind: 'shieldPercent', percent: 10, min: 10, duration: 2 },
  core_furnace_brand: { triggerText: '戦闘開始時', kind: 'status', target: 'enemy', statusId: 'flat_atk_down', value: 12, duration: 3 },
  doomsday_slag_core: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'enemy', statusId: 'def_debuff', value: 25, duration: 3 },
  emberbrand: { triggerText: '通常攻撃を行うたび', kind: 'status', target: 'enemy', statusId: 'burn', value: 3, duration: 2 },
  dewdrinker: { triggerText: 'HPが半分未満のとき、通常攻撃を行うたび', kind: 'healFlat', amount: 3 },
  hunters_badge: { triggerText: '戦闘開始時', kind: 'status', target: 'self', statusId: 'flat_atk_up', value: 4, duration: 3 },
  verdant_brooch: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'self', statusId: 'shield', value: 8, duration: 2 },
  mist_charm: { triggerText: '戦闘開始時', kind: 'status', target: 'enemy', statusId: 'def_debuff', value: 10, duration: 2 },
  amber_heart: { triggerText: '戦闘に勝利するたび', kind: 'healPercent', percent: 8 },
  mycelial_crystal: { triggerText: '3ターン目の開始時に一度だけ', kind: 'status', target: 'self', statusId: 'atk_buff', value: 15, duration: 2 },
  spirit_crest: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'self', statusId: 'regen', value: 4, duration: 2 },
  hornet_stinger: { triggerText: '戦闘中の最初の通常攻撃で', kind: 'status', target: 'enemy', statusId: 'poison', value: 5, duration: 2 },
  root_medallion: { triggerText: '戦闘開始時', kind: 'status', target: 'self', statusId: 'regen', value: 5, duration: 3 },
  worldtree_dewstone: { triggerText: '毎ターン開始時', kind: 'status', target: 'self', statusId: 'regen', value: 3, duration: 2 },
  leyline_astrolabe: { triggerText: '2ターン目の開始時に一度だけ', kind: 'status', target: 'self', statusId: 'flat_atk_up', value: 12, duration: 5 },
  eclipse_astrolabe: { triggerText: 'スキルを使用するたび', kind: 'status', target: 'self', statusId: 'shield', value: 5, duration: 2 },
};

export function formatRelicEffect(effectId: string): string {
  const spec = RELIC_EFFECT_SPECS[effectId];
  if (!spec) {
    throw new Error(`formatRelicEffect: no spec for effectId '${effectId}'`);
  }
  let effect: string;
  switch (spec.kind) {
    case 'status': {
      const v = spec.value;
      const d = spec.duration;
      if (spec.target === 'self') {
        switch (spec.statusId) {
          case 'shield': effect = `${v}ダメージを吸収する障壁(${d}T)を得る`; break;
          case 'atk_buff': effect = `${d}ターンの間、攻撃力+${v}%を得る`; break;
          case 'def_buff': effect = `${d}ターンの間、防御力+${v}%を得る`; break;
          case 'flat_atk_up': effect = `${d}ターンの間、攻撃力+${v}を得る`; break;
          case 'regen': effect = `再生(最大HPの${v}%/${d}T)を得る`; break;
          default: throw new Error(`formatRelicEffect: unknown self statusId '${spec.statusId}'`);
        }
      } else {
        switch (spec.statusId) {
          case 'atk_debuff': effect = `敵の攻撃力を${v}%低下(${d}T)させる`; break;
          case 'def_debuff': effect = `敵の防御力を${v}%低下(${d}T)させる`; break;
          case 'flat_atk_down': effect = `敵の攻撃力を${v}低下(${d}T)させる`; break;
          case 'burn': effect = `敵に火傷(最大HP${v}%/${d}T)を付与する`; break;
          case 'poison': effect = `敵に猛毒(${v}ダメージ/${d}T)を付与する`; break;
          default: throw new Error(`formatRelicEffect: unknown enemy statusId '${spec.statusId}'`);
        }
      }
      break;
    }
    case 'healPercent': effect = `最大HPの${spec.percent}%を回復する`; break;
    case 'healFlat': effect = `HPを${spec.amount}回復する`; break;
    case 'shieldPercent': effect = `最大HPの${spec.percent}%分(最低${spec.min})の障壁(${spec.duration}T)を得る`; break;
    case 'gold': effect = `追加で${spec.amount}ゴールドを得る`; break;
    case 'bonusDamage': effect = `攻撃力の${spec.percent}%(最低${spec.min})の追加ダメージを与える`; break;
  }
  return `${spec.triggerText}、${effect}`;
}

/** Flavor text + mechanically generated relic effect sentence. */
export function withRelicEffectText(item: { description: string; effectId?: string }): string {
  if (!item.effectId) throw new Error('withRelicEffectText: item has no effectId');
  const flavor = item.description.replace(/\s+$/, '');
  return `${flavor}${formatRelicEffect(item.effectId)}。`;
}

/* ------------------------------------------------------------------ */
/* Consumables: fully structured (healPercent / cleanse / applyStatus) */
/* ------------------------------------------------------------------ */

export function formatConsumableEffect(item: ConsumableItem): string {
  const parts: string[] = [];
  if (item.healPercent !== undefined) {
    parts.push(`HPを${item.healPercent}%回復`);
  }
  if (item.cleanse) {
    parts.push('状態異常を浄化');
  }
  const st = item.applyStatus;
  if (st) {
    const v = st.value;
    const d = st.duration;
    switch (st.statusId) {
      case 'shield': parts.push(`障壁(${v}/${d}T)を付与`); break;
      case 'atk_buff': parts.push(`${d}ターンの間、攻撃力+${v}%を得る`); break;
      case 'def_buff': parts.push(`${d}ターンの間、防御力+${v}%を得る`); break;
      case 'regen': parts.push(`再生(最大HPの${v}%/${d}T)を得る`); break;
      default:
        throw new Error(`formatConsumableEffect: unknown statusId '${st.statusId}' for consumable ${item.id}`);
    }
  }
  if (parts.length === 0) {
    throw new Error(`formatConsumableEffect: no effect parts for consumable ${item.id}`);
  }
  return `${parts.join('＋')}（最大${item.maxCharges}チャージ）`;
}

/** Flavor text + mechanically generated consumable effect clause. */
export function withConsumableEffectText(item: ConsumableItem): string {
  const flavor = item.description.replace(/\s+$/, '');
  return `${flavor}${formatConsumableEffect(item)}。`;
}
