import {
  BattleSessionState,
  CombatEngine,
  PlayerCommand,
  PlayerLoadout,
} from '../core/CombatEngine';
import { EventEngine, EventExecutionState } from '../core/EventEngine';
import { measuredItemPower } from './itemPower';
import { DropPacingEngine, RewardCard } from '../core/DropPacingEngine';
import { EventOption, GameEventDefinition } from '../extensible/events/types';
import {
  ArmorItem,
  RelicItem,
  SALVAGE_GOLD,
  SkillItem,
  WeaponItem,
} from '../extensible/items/itemCatalog';

/**
 * Playtest bot policy: deterministic heuristics a competent player would use.
 * - Focus-fire the lowest-HP living enemy
 * - AoE skills when 2+ enemies stand, finisher skills when they can kill
 * - Opening debuff/buff, heal skill under 45% HP, consumable under 35% HP
 */
export class PlaytestBot {
  static chooseCombatCommand(
    session: BattleSessionState,
    loadout: PlayerLoadout
  ): PlayerCommand {
    const alive = session.enemies
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.currentHp > 0);
    if (alive.length === 0) return { type: 'attack', targetIndex: 0 };

    const hpPct = session.player.currentHp / session.player.maxHp;
    const target = alive.reduce((a, b) => (b.e.currentHp < a.e.currentHp ? b : a));

    const consumableReady = Boolean(
      loadout.consumable?.healPercent && session.consumableCharges > 0
    );
    const woundCap = session.player.maxHp - (session.playerWound ?? 0);

    // 1. Consumable heal at critical HP (it also pierces the wound cap)
    if (consumableReady && hpPct <= 0.35) {
      return { type: 'consumable' };
    }

    // 1b. Wound-capped: skill heals cannot raise HP past maxHp - wound,
    // so once HP sits at that cap only the consumable can still heal.
    if (
      consumableReady &&
      (session.playerWound ?? 0) > 0 &&
      session.player.currentHp >= woundCap &&
      hpPct <= 0.6
    ) {
      return { type: 'consumable' };
    }

    // 2. Heal skill when hurt — but never burn a charge on a direct heal
    // the wound cap would nullify (regen is exempt: its ticks land after
    // later damage drops HP below the cap again).
    const regenActive = session.player.statuses.some((st) => st.statusId === 'regen');
    const healSlot = PlaytestBot.findSkillSlot(session, loadout, (s) =>
      Boolean(s.healPercent || s.healFlat || (s.applyStatus?.statusId === 'regen' && !regenActive))
    );
    if (hpPct <= 0.45 && healSlot >= 0) {
      const healSkill = loadout.skills[healSlot]!;
      const isRegen = healSkill.applyStatus?.statusId === 'regen';
      const nominal = healSkill.healPercent
        ? (session.player.maxHp * healSkill.healPercent) / 100
        : (healSkill.healFlat ?? 0);
      const effective = Math.min(woundCap, session.player.currentHp + nominal);
      if (isRegen || effective > session.player.currentHp) {
        return { type: 'skill', slotIndex: healSlot as 0 | 1 | 2, targetIndex: target.i };
      }
    }

    // 3. AoE skill against a group
    const aoeSlot = PlaytestBot.findSkillSlot(
      session,
      loadout,
      (s) => s.targetScope === 'all_enemies' && Boolean(s.damageMultiplier)
    );
    if (alive.length >= 2 && aoeSlot >= 0) {
      return { type: 'skill', slotIndex: aoeSlot as 0 | 1 | 2, targetIndex: target.i };
    }

    // 4. Cheapest damage skill that finishes the target
    let finisher: { slot: number; mult: number } | null = null;
    loadout.skills.forEach((skill, slot) => {
      if (!skill || session.skillCharges[slot] <= 0) return;
      if (!skill.damageMultiplier || skill.targetScope === 'all_enemies') return;
      const est = CombatEngine.calculateDamage(
        session.player,
        target.e,
        skill.damageMultiplier,
        session.turn
      ).finalHpDamage;
      if (est >= target.e.currentHp && (!finisher || skill.damageMultiplier < finisher.mult)) {
        finisher = { slot, mult: skill.damageMultiplier };
      }
    });
    if (finisher) {
      return {
        type: 'skill',
        slotIndex: (finisher as { slot: number }).slot as 0 | 1 | 2,
        targetIndex: target.i,
      };
    }

    // 5. Opening debuff against a healthy target (first 2 turns)
    const debuffSlot = PlaytestBot.findSkillSlot(
      session,
      loadout,
      (s) => s.applyStatus?.target === 'enemy' && !s.damageMultiplier
    );
    const pureDamageDebuffSlot = PlaytestBot.findSkillSlot(
      session,
      loadout,
      (s) => s.category === 'debuff' && Boolean(s.applyStatus)
    );
    if (
      session.turn <= 2 &&
      target.e.currentHp / target.e.maxHp > 0.7 &&
      (debuffSlot >= 0 || pureDamageDebuffSlot >= 0)
    ) {
      const slot = debuffSlot >= 0 ? debuffSlot : pureDamageDebuffSlot;
      return { type: 'skill', slotIndex: slot as 0 | 1 | 2, targetIndex: target.i };
    }

    // 6. Self-buff (e.g. shield stance) on turn 1 if not already active
    const buffSlot = PlaytestBot.findSkillSlot(
      session,
      loadout,
      (s) => s.applyStatus?.target === 'self'
    );
    if (buffSlot >= 0 && session.turn === 1) {
      const buffStatus = loadout.skills[buffSlot]?.applyStatus?.statusId;
      const alreadyActive = session.player.statuses.some((s) => s.statusId === buffStatus);
      if (!alreadyActive) {
        return { type: 'skill', slotIndex: buffSlot as 0 | 1 | 2, targetIndex: target.i };
      }
    }

    // 7. Strongest damage skill against a bulky target
    let bestDamage: { slot: number; mult: number } | null = null;
    loadout.skills.forEach((skill, slot) => {
      if (!skill || session.skillCharges[slot] <= 0) return;
      if (!skill.damageMultiplier || skill.targetScope === 'all_enemies') return;
      if (!bestDamage || skill.damageMultiplier > bestDamage.mult) {
        bestDamage = { slot, mult: skill.damageMultiplier };
      }
    });
    if (bestDamage && target.e.currentHp >= Math.max(40, target.e.maxHp * 0.25)) {
      return {
        type: 'skill',
        slotIndex: (bestDamage as { slot: number }).slot as 0 | 1 | 2,
        targetIndex: target.i,
      };
    }

    // 8. Basic attack on the weakest enemy
    return { type: 'attack', targetIndex: target.i };
  }

  private static findSkillSlot(
    session: BattleSessionState,
    loadout: PlayerLoadout,
    pred: (s: SkillItem) => boolean
  ): number {
    for (let i = 0; i < 3; i++) {
      const s = loadout.skills[i];
      if (s && session.skillCharges[i] > 0 && pred(s)) return i;
    }
    return -1;
  }

  /** Rough power score for comparing skills when slots are full. */
  static skillPower(skill: SkillItem): number {
    let power =
      (skill.damageMultiplier ?? 0) * 20 +
      (skill.healPercent ?? 0) * 0.5 +
      (skill.healFlat ?? 0) * 0.2 +
      (skill.cleanse ? 5 : 0) +
      (skill.targetScope === 'all_enemies' ? 6 : 0) +
      (skill.spd ?? 0) * 2;
    const st = skill.applyStatus;
    if (st) {
      if (st.statusId === 'regen') {
        power += st.value * st.duration * 0.5;
      } else if (st.statusId === 'shield') {
        power += st.value * 0.6;
      } else if (st.statusId === 'burn' || st.statusId === 'poison') {
        power += st.value * st.duration * 0.35;
      } else {
        // Percent buffs / debuffs scale with their magnitude.
        power += st.value * 0.45;
      }
    }
    // Charges are real throughput: a 3-use skill fires far more often
    // than a 1-use skill with the same sticker numbers.
    power *= 1 + 0.25 * ((skill.maxChargesPerBattle ?? 1) - 1);
    return power;
  }

  /** Skill value for replacement decisions: measured power when the
   * benchmark has covered the skill, else the heuristic estimate. */
  static skillValue(skill: SkillItem, floor?: number): number {
    return measuredItemPower(skill.id, floor) ?? PlaytestBot.skillPower(skill);
  }

  /** Measured power difference (candidate - current), or null when
   * either side is unmeasured and the heuristics must decide instead. */
  static measuredDelta(
    candidateId: string,
    currentId: string | null,
    floor?: number
  ): number | null {
    const cand = measuredItemPower(candidateId, floor);
    if (cand === null) return null;
    if (currentId === null) return cand;
    const cur = measuredItemPower(currentId, floor);
    return cur === null ? null : cand - cur;
  }

  /**
   * Rough general-purpose value of a relic, by effectId. Relic effects are
   * code, not numbers, so this is a hand tier list; unlisted relics (e.g.
   * added by future floors) default to a mid value instead of being
   * treated as worthless.
   */
  static relicPower(relic: RelicItem): number {
    const tiers: Record<string, number> = {
      ember_leech_stone: 36, vampiric_fang: 34, worldtree_dewstone: 32,
      guardian_crest: 30, worldtree_seed_heart: 30, canopy_crown: 30,
      boiler_shell_plating: 30, berserker_idol: 28, ashen_shard_talon: 27,
      briar_thorn_relic: 24, root_medallion: 24, obsidian_ember_lens: 24,
      forge_cinder_talisman: 24, spirit_crest: 22, steam_pressure_valve: 22,
      doomsday_slag_core: 22, amber_heart: 20, forest_dewdrop: 20,
      venom_gland: 20, rootstone_ember_seal: 20, bookmark_charm: 20,
      mist_veil_bell: 18, steam_cog_regulator: 18, molten_slag_seal: 18,
      core_furnace_brand: 16, mirror_talisman: 16, elder_sap_seal: 16,
      reed_whistle: 16, mycelial_crystal: 14, ancient_amber: 12,
      golden_compass: 10, hornet_stinger: 10, mist_charm: 10,
      leyline_astrolabe: 8, verdant_brooch: 8, hunters_badge: 5,
    };
    return tiers[relic.effectId] ?? 15;
  }

  static chooseEventOption(
    eventDef: GameEventDefinition,
    state: EventExecutionState,
    canAfford: (option: EventOption) => boolean,
    grantCtx?: { worldSeed: number; encounterIndex: number; inventory: PlayerLoadout }
  ): number {
    const hpPct = state.currentHp / state.maxHp;
    const affordable = eventDef.options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => canAfford(o));
    if (affordable.length === 0) return -1;

    if (eventDef.isRestEvent) {
      const heal = affordable.find(({ o }) => o.outcome.healHpPercent);
      const refill = affordable.find(({ o }) => o.outcome.refillConsumable);
      const needsHeal = hpPct <= 0.65;
      const needsRefill = state.consumableCharges < state.consumableMaxCharges;
      if (needsHeal && heal) return heal.i;
      if (needsRefill && refill) return refill.i;
      if (needsHeal || needsRefill) return (heal ?? refill ?? affordable[0]).i;
      // Fully rested with full charges: fall through to the normal
      // scoring instead of wasting the stop on a heal that does nothing.
    }

    // Value an item grant by the actual item it will give (grants are
    // deterministic), not by a flat bonus: a weapon that will be
    // auto-salvaged is worth ~5G, not a jackpot.
    const grantValue = (option: EventOption): number | null => {
      if (!grantCtx) return null;
      const item = EventEngine.previewGrant(
        option,
        state.currentFloor ?? 1,
        grantCtx.worldSeed,
        grantCtx.encounterIndex
      );
      if (!item) return null;
      const inv = grantCtx.inventory;
      const mDelta = PlaytestBot.measuredDelta(
        item.id,
        item.kind === 'weapon' ? inv.weapon.id
        : item.kind === 'armor' ? inv.armor.id
        : item.kind === 'relic' ? (inv.relic?.id ?? null)
        : item.kind === 'consumable' ? (inv.consumable?.id ?? null)
        : null,
        state.currentFloor ?? 1
      );
      if (mDelta !== null && item.kind !== 'skill') {
        if (item.kind === 'relic' && !inv.relic) return 26;
        return mDelta > 0 ? 20 + mDelta : 3;
      }
      switch (item.kind) {
        case 'weapon':
          return DropPacingEngine.isWeaponDominated(item, {
            atk: inv.weapon.atk,
            element: inv.weapon.element,
          })
            ? 3
            : 20 + Math.max(0, item.atk - inv.weapon.atk) * 2;
        case 'armor':
          return DropPacingEngine.isArmorDominated(item, {
            def: inv.armor.def,
            maxHpBonus: inv.armor.maxHpBonus,
          })
            ? 3
            : 20 +
                Math.max(0, item.def - inv.armor.def) * 2 +
                Math.max(0, item.maxHpBonus - inv.armor.maxHpBonus) * 0.1;
        case 'skill': {
          const candP = measuredItemPower(item.id, state.currentFloor ?? 1);
          const heldP = inv.skills.map((s) => (s ? measuredItemPower(s.id, state.currentFloor ?? 1) : null));
          if (candP !== null && heldP.every((p, i) => inv.skills[i] === null || p !== null)) {
            if (inv.skills.some((s) => s === null)) return 30;
            const weakestM = Math.min(...heldP.filter((p): p is number => p !== null));
            const deltaM = candP - weakestM;
            return deltaM > 2 ? 16 + deltaM * 0.75 : 3;
          }
          if (inv.skills.some((s) => s === null)) return 30;
          const weakest = Math.min(
            ...inv.skills.map((s) => (s ? PlaytestBot.skillPower(s) : 0))
          );
          const delta = PlaytestBot.skillPower(item) - weakest;
          return delta > 5 ? 16 + delta * 0.5 : 3;
        }
        case 'relic': {
          if (!inv.relic) return 26;
          const next = PlaytestBot.relicPower(item);
          const cur = PlaytestBot.relicPower(inv.relic);
          return next > cur ? 14 + (next - cur) : 3;
        }
        case 'consumable': {
          const curTotal =
            (inv.consumable?.healPercent ?? 0) * (inv.consumable?.maxCharges ?? 0);
          const newTotal = (item.healPercent ?? 0) * item.maxCharges;
          return newTotal > curTotal ? 20 : 4;
        }
      }
    };

    let best = affordable[0];
    let bestScore = -Infinity;
    for (const cand of affordable) {
      const { outcome, cost } = cand.o;
      let score = 0;
      const gv = grantValue(cand.o);
      if (gv !== null) score += gv;
      else {
        if (outcome.specificItemId) score += 50;
        if (outcome.grantItemType) score += 30;
      }
      if (outcome.grantGold) score += outcome.grantGold / 5;
      if (outcome.healHpPercent) score += outcome.healHpPercent * (1 - hpPct);
      if (outcome.refillConsumable) {
        score += 15 * (state.consumableMaxCharges - state.consumableCharges);
      }
      if (outcome.cleanseDebuffs) score += 5;
      if (cost?.hpPercent) score -= cost.hpPercent * 1.5;
      if (cost?.gold) score -= EventEngine.scaledGoldCost(cost.gold, state.currentFloor ?? 1) / 5;
      if (score > bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    return best.i;
  }

  static chooseRewardCard(
    cards: [RewardCard, RewardCard, RewardCard],
    ctx: {
      weapon: WeaponItem;
      armor: ArmorItem;
      skills: [SkillItem | null, SkillItem | null, SkillItem | null];
      floor: number;
      relic: RelicItem | null;
      consumableId: string | null;
      consumableCharges: number;
      consumableMaxCharges: number;
      consumableHealPercent: number;
    }
  ): { index: number; action: 'equip' | 'salvage' | 'take' } {
    let bestIdx = 0;
    let bestScore = -Infinity;
    let bestAction: 'equip' | 'salvage' | 'take' = 'take';

    cards.forEach((card, idx) => {
      let score = 0;
      let action: 'equip' | 'salvage' | 'take' = 'salvage';
      if (card.type === 'potion_refill') {
        score = (ctx.consumableMaxCharges - ctx.consumableCharges) * 18;
        action = 'take';
      } else if (card.type === 'gold_bonus') {
        // Gold is spendable power (springs, markets); value it at the
        // same rate the event policy uses instead of ignoring the card.
        score = (card.goldBonusAmount ?? 0) / 5;
        action = 'take';
      } else if (card.item?.kind === 'weapon') {
        const mDelta = PlaytestBot.measuredDelta(card.item.id, ctx.weapon.id, ctx.floor);
        if (mDelta !== null) {
          score = mDelta * 2;
          action = score > 0 ? 'equip' : 'salvage';
          if (action === 'salvage') score = SALVAGE_GOLD * 0.6;
          if (score > bestScore) { bestScore = score; bestIdx = idx; bestAction = action; }
          return;
        }
        score = (card.item.atk - ctx.weapon.atk) * 12;
        // Effect premium: an effect's value is not in the ATK number.
        // +36 ≈ +3 ATK, enough to try most effect weapons once.
        if (card.item.effectId) score += 36;
        // Speed flips the 51F+ opening; price it like a small ATK gain.
        score += (card.item.spd ?? 0) * 6;
        action = score > 0 ? 'equip' : 'salvage';
        if (action === 'salvage') score = SALVAGE_GOLD * 0.6;
      } else if (card.item?.kind === 'armor') {
        const mDelta = PlaytestBot.measuredDelta(card.item.id, ctx.armor.id, ctx.floor);
        if (mDelta !== null) {
          score = mDelta * 2;
          action = score > 0 ? 'equip' : 'salvage';
          if (action === 'salvage') score = SALVAGE_GOLD * 0.6;
          if (score > bestScore) { bestScore = score; bestIdx = idx; bestAction = action; }
          return;
        }
        score =
          (card.item.def - ctx.armor.def) * 8 +
          (card.item.maxHpBonus - ctx.armor.maxHpBonus) * 0.25;
        if (card.item.effectId) score += 24;
        score += (card.item.spd ?? 0) * 6;
        // Price a persistent ATK modifier at the weapon-ATK rate.
        if (card.item.atkDelta) score += card.item.atkDelta * 12;
        action = score > 0 ? 'equip' : 'salvage';
        if (action === 'salvage') score = SALVAGE_GOLD * 0.6;
      } else if (card.item?.kind === 'skill') {
        const candP = measuredItemPower(card.item.id, ctx.floor);
        const heldP = ctx.skills.map((s) => (s ? measuredItemPower(s.id, ctx.floor) : null));
        if (candP !== null && heldP.every((p, i) => ctx.skills[i] === null || p !== null)) {
          if (ctx.skills.some((s) => s === null)) {
            score = 25 + candP * 0.2;
            action = 'equip';
          } else {
            const weakest = Math.min(...heldP.filter((p): p is number => p !== null));
            const delta = candP - weakest;
            if (delta > 2) { score = delta * 1.5; action = 'equip'; }
            else { score = SALVAGE_GOLD * 0.6; action = 'salvage'; }
          }
          if (score > bestScore) { bestScore = score; bestIdx = idx; bestAction = action; }
          return;
        }
        const empty = ctx.skills.some((s) => s === null);
        if (empty) {
          score = 40;
          action = 'equip';
        } else {
          const weakest = Math.min(
            ...ctx.skills.map((s) => (s ? PlaytestBot.skillPower(s) : 0))
          );
          const delta = PlaytestBot.skillPower(card.item) - weakest;
          if (delta > 5) {
            score = delta;
            action = 'equip';
          } else {
            score = SALVAGE_GOLD * 0.6;
            action = 'salvage';
          }
        }
      } else if (card.item?.kind === 'consumable') {
        const mDelta = PlaytestBot.measuredDelta(card.item.id, ctx.consumableId, ctx.floor);
        if (mDelta !== null) {
          if (mDelta > 0) { score = 20 + mDelta * 0.5; action = 'equip'; }
          else { score = SALVAGE_GOLD * 0.6; action = 'salvage'; }
          if (score > bestScore) { bestScore = score; bestIdx = idx; bestAction = action; }
          return;
        }
        // Swap only for a strictly larger total heal (per-use % x charges);
        // the side effect (cleanse / status) rides along either way.
        const curTotal = ctx.consumableHealPercent * ctx.consumableMaxCharges;
        const newTotal = (card.item.healPercent ?? 0) * card.item.maxCharges;
        if (newTotal > curTotal) {
          score = 20 + (newTotal - curTotal) * 0.5;
          action = 'equip';
        } else {
          score = SALVAGE_GOLD * 0.6;
          action = 'salvage';
        }
      } else if (card.item?.kind === 'relic') {
        const candP = measuredItemPower(card.item.id, ctx.floor);
        const curP = ctx.relic ? measuredItemPower(ctx.relic.id, ctx.floor) : null;
        if (candP !== null && (ctx.relic === null || curP !== null)) {
          if (!ctx.relic) { score = 30; action = 'equip'; }
          else if (candP > (curP as number)) { score = 12 + (candP - (curP as number)); action = 'equip'; }
          else { score = SALVAGE_GOLD * 0.6; action = 'salvage'; }
          if (score > bestScore) { bestScore = score; bestIdx = idx; bestAction = action; }
          return;
        }
        if (!ctx.relic) {
          score = 30;
          action = 'equip';
        } else if (PlaytestBot.relicPower(card.item) > PlaytestBot.relicPower(ctx.relic)) {
          // Relics are replaceable in the real game; a stronger one is
          // worth taking (the old one salvages via applyEquip).
          score = 12 + (PlaytestBot.relicPower(card.item) - PlaytestBot.relicPower(ctx.relic));
          action = 'equip';
        } else {
          score = SALVAGE_GOLD * 0.6;
          action = 'salvage';
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
        bestAction = action;
      }
    });

    return { index: bestIdx, action: bestAction };
  }
}
