/**
 * Mechanically formats a skill's concrete effect clause from its structured
 * data, in the catalog's established description style. Used to append the
 * effect text to flavor-only skill descriptions so the numbers shown in-game
 * always match the data. Dev tooling only; not imported by the app.
 */
import type { SkillItem } from '../extensible/items/itemCatalog';

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
