import { AreaEngine } from '../core/AreaEngine';
import { CombatEngine, WOUND_RATE, calcPlayerSpd } from '../core/CombatEngine';
import { DropPacingEngine } from '../core/DropPacingEngine';
import { EventEngine } from '../core/EventEngine';
import { FloorRunner } from '../core/FloorRunner';
import {
  BASE_PLAYER_MAX_HP,
  SaveData,
  StorageValidator,
} from '../core/StorageValidator';
import { collectEquippedEffects } from '../extensible/effects/effectRegistry';
import {
  AnyCatalogItem,
  SALVAGE_GOLD,
  salvageGoldFor,
} from '../extensible/items/itemCatalog';
import { REALM_METADATA } from '../extensible/realms/realmIndex';
import { PlaytestBot } from './playtestBot';

/** Deterministic PRNG so simulation runs are reproducible per seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RunResult {
  seed: number;
  floorsCleared: number;
  highestFloorReached: number;
  deaths: number;
  deathsByFloor: Record<number, number>;
  attemptsByFloor: Record<number, number>;
  battles: number;
  totalTurns: number;
  goldEarned: number;
  /** Gold balance when the run ended (start gold + all income - all spending). */
  finalGold: number;
  endReason: 'cleared' | 'death_cap' | 'turn_cap';
  /** HP% right after clearing each floor (first clear only). */
  floorEndHpPct: Record<number, number>;
}

const MAX_DEATHS_PER_RUN = 30;
const MAX_TURNS_PER_BATTLE = 300;

/** Item categories whose slot can be frozen for A/B item measurement. */
export type ItemKind = AnyCatalogItem['kind'];

export interface SimOptions {
  /** Slots the bot may not change (used by the item benchmark). */
  frozenKinds?: ReadonlySet<ItemKind>;
  /** Called with a deep copy of the save at the start of each floor. */
  onFloorStart?: (floor: number, save: SaveData) => void;
}

/** Applies an obtained item the way the game store does (old gear salvages). */
function applyEquip(
  save: SaveData,
  item: AnyCatalogItem,
  frozenKinds?: ReadonlySet<ItemKind>
): void {
  if (frozenKinds?.has(item.kind)) return;
  // Mirror the store: strictly-dominated granted equipment is salvaged.
  if (
    item.kind === 'weapon' &&
    DropPacingEngine.isWeaponDominated(item, {
      atk: save.inventory.weapon.atk,
      element: save.inventory.weapon.element,
    })
  ) {
    save.gold += SALVAGE_GOLD;
    return;
  }
  if (
    item.kind === 'armor' &&
    DropPacingEngine.isArmorDominated(item, {
      def: save.inventory.armor.def,
      maxHpBonus: save.inventory.armor.maxHpBonus,
    })
  ) {
    save.gold += SALVAGE_GOLD;
    return;
  }
  const maxHpNow = BASE_PLAYER_MAX_HP + save.inventory.armor.maxHpBonus;
  if (item.kind === 'weapon') {
    save.gold += SALVAGE_GOLD;
    save.inventory.weapon = item;
  } else if (item.kind === 'armor') {
    save.gold += SALVAGE_GOLD;
    const hpDiff = Math.max(0, item.maxHpBonus - save.inventory.armor.maxHpBonus);
    save.inventory.armor = item;
    const newMax = BASE_PLAYER_MAX_HP + item.maxHpBonus;
    save.midFloor.playerCurrentHp = Math.min(
      newMax,
      save.midFloor.playerCurrentHp + hpDiff
    );
    void maxHpNow;
  } else if (item.kind === 'relic') {
    save.gold += salvageGoldFor(save.inventory.relic);
    save.inventory.relic = item;
  } else if (item.kind === 'skill') {
    const emptyIdx = save.inventory.skills.findIndex((s) => s === null);
    if (emptyIdx >= 0) {
      save.inventory.skills[emptyIdx] = item;
    } else {
      // Replace the weakest skill and salvage it
      let weakestIdx = 0;
      let weakestPower = Infinity;
      save.inventory.skills.forEach((s, i) => {
        if (s) {
          const p = PlaytestBot.skillValue(s, save.midFloor.currentFloor);
          if (p < weakestPower) {
            weakestPower = p;
            weakestIdx = i;
          }
        }
      });
      save.gold += salvageGoldFor(save.inventory.skills[weakestIdx]);
      save.inventory.skills[weakestIdx] = item;
    }
  } else if (item.kind === 'consumable') {
    save.inventory.consumable = item;
    save.midFloor.consumableCharges = item.maxCharges;
  }
}

/**
 * Plays a full run from floor 1 to `maxFloor` with the PlaytestBot,
 * mirroring the game store's flow (HP carry-over, events, reward cards,
 * checkpoint respawns, dimensional leaps). Deaths respawn the bot at the
 * checkpoint exactly like a player retrying.
 */
export function simulateRun(
  seed: number,
  maxFloor = 100,
  opts: SimOptions = {}
): RunResult {
  const rng = mulberry32(seed);
  const save = StorageValidator.createDefaultSave(rng);
  return simulateRunFromSave(save, seed, maxFloor, rng, opts);
}

/**
 * Runs the simulation from an existing save (used by the item benchmark
 * to start paired runs from identical mid-tower checkpoints).
 */
export function simulateRunFromSave(
  save: SaveData,
  seed: number,
  maxFloor: number,
  rng: () => number,
  opts: SimOptions = {}
): RunResult {
  const result: RunResult = {
    seed,
    floorsCleared: 0,
    highestFloorReached: 1,
    deaths: 0,
    deathsByFloor: {},
    attemptsByFloor: {},
    battles: 0,
    totalTurns: 0,
    goldEarned: 0,
    finalGold: 0,
    endReason: 'cleared',
    floorEndHpPct: {},
  };

  let wound = save.midFloor.playerWound ?? 0;
  let floor = save.midFloor.currentFloor;
  while (floor <= maxFloor) {
    opts.onFloorStart?.(floor, structuredClone(save));
    result.attemptsByFloor[floor] = (result.attemptsByFloor[floor] ?? 0) + 1;
    const floorDef = FloorRunner.getFloor(floor);
    const realmMeta = REALM_METADATA[floorDef.realm] ?? REALM_METADATA[1];
    result.highestFloorReached = Math.max(result.highestFloorReached, floor);
    let diedOnFloor = false;

    for (let encIdx = 0; encIdx < floorDef.encounters.length; encIdx++) {
      const enc = FloorRunner.resolveEncounter(floorDef, encIdx, save.worldSeed);
      const maxHp = BASE_PLAYER_MAX_HP + save.inventory.armor.maxHpBonus;

      if (enc.kind === 'event') {
        const state = {
          currentHp: save.midFloor.playerCurrentHp,
          maxHp,
          gold: save.gold,
          consumableCharges: save.midFloor.consumableCharges,
          consumableMaxCharges: save.inventory.consumable?.maxCharges ?? 2,
          currentFloor: floor,
        };
        const optIdx = PlaytestBot.chooseEventOption(
          enc.eventDef,
          state,
          (o) => EventEngine.canAffordOption(state, o),
          { worldSeed: save.worldSeed ?? 0, encounterIndex: encIdx, inventory: save.inventory }
        );
        if (optIdx >= 0) {
          const chosen = enc.eventDef.options[optIdx];
          // Mirror the real store: grants are deterministic per save.
          const res = EventEngine.resolveOption(state, chosen, () =>
            EventEngine.grantRoll(save.worldSeed ?? 0, floor, encIdx, chosen.id)
          );
          if (res.success) {
            save.gold = res.nextState.gold;
            save.midFloor.playerCurrentHp = res.nextState.currentHp;
            save.midFloor.consumableCharges = res.nextState.consumableCharges;
            // Wound trial: rest events and spring heals clear the wound.
            if (enc.eventDef.isRestEvent || enc.eventDef.options[optIdx].outcome.healHpPercent) {
              wound = 0;
            }
            if (res.grantedItem) applyEquip(save, res.grantedItem, opts.frozenKinds);
          }
        }
        continue;
      }

      // Combat encounter
      let session = CombatEngine.createBattleSession(
        save.midFloor.playerCurrentHp,
        maxHp,
        save.midFloor.consumableCharges,
        save.inventory,
        enc.enemyDefs,
        enc.statScale,
        wound,
        WOUND_RATE,
        floor >= 51 ? { playerSpd: calcPlayerSpd(save.inventory) } : undefined
      );
      result.battles += 1;
      let turns = 0;
      while (session.status === 'ongoing' && turns < MAX_TURNS_PER_BATTLE) {
        const cmd = PlaytestBot.chooseCombatCommand(session, save.inventory);
        session = CombatEngine.executeTurn(
          session,
          cmd,
          save.inventory,
          realmMeta.environmentalStatus,
          rng
        );
        turns += 1;
      }
      result.totalTurns += turns;

      wound = session.playerWound;
      if (session.status === 'victory') {
        let gold = session.totalGoldReward;
        for (const eff of collectEquippedEffects(save.inventory)) {
          if (eff.trigger !== 'battle_victory') continue;
          const res = eff.handler({
            playerCurrentHp: session.player.currentHp,
            playerMaxHp: session.player.maxHp,
            playerAtk: session.player.baseAtk,
            playerDef: session.player.baseDef,
            enemyCurrentHp: 0,
            enemyMaxHp: session.enemies[0]?.maxHp ?? 0,
            turnNumber: session.turn,
          });
          if (res.grantGold) gold += res.grantGold;
          if (res.healPlayer) {
            const healCap =
              WOUND_RATE > 0
                ? Math.floor(session.player.maxHp - wound)
                : session.player.maxHp;
            const healTarget = Math.min(
              healCap,
              session.player.currentHp + res.healPlayer
            );
            if (healTarget > session.player.currentHp) {
              session.player.currentHp = healTarget;
            }
          }
        }
        save.gold += gold;
        result.goldEarned += gold;
        save.midFloor.playerCurrentHp = session.player.currentHp;
        save.midFloor.consumableCharges = session.consumableCharges;
      } else {
        // Defeat (or turn cap): checkpoint respawn, retry from that floor
        result.deaths += 1;
        result.deathsByFloor[floor] = (result.deathsByFloor[floor] ?? 0) + 1;
        if (result.deaths > MAX_DEATHS_PER_RUN) {
          result.endReason = 'death_cap';
          return result;
        }
        if (turns >= MAX_TURNS_PER_BATTLE) {
          result.endReason = 'turn_cap';
          return result;
        }
        wound = 0;
        const respawnFloor = AreaEngine.calculateRespawnFloor(floor);
        save.midFloor.playerCurrentHp =
          BASE_PLAYER_MAX_HP + save.inventory.armor.maxHpBonus;
        floor = respawnFloor;
        diedOnFloor = true;
        break;
      }
    }

    if (diedOnFloor) continue;

    // Floor cleared (wound trial B: the wound persists across floors and
    // clears only at rest / spring heals, respawn, and dimensional leaps)
    if (floor % 50 === 0) wound = 0;
    result.floorsCleared = Math.max(result.floorsCleared, floor);
    const maxHpAfter = BASE_PLAYER_MAX_HP + save.inventory.armor.maxHpBonus;
    if (result.floorEndHpPct[floor] === undefined) {
      result.floorEndHpPct[floor] = Math.round(
        (save.midFloor.playerCurrentHp / maxHpAfter) * 100
      );
    }

    // Reward cards
    const cards = DropPacingEngine.generateFloorRewardCards(floorDef, rng, {
      skillIds: save.inventory.skills
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .map((s) => s.id),
      weaponId: save.inventory.weapon.id,
      armorId: save.inventory.armor.id,
      relicId: save.inventory.relic?.id ?? null,
      consumableId: save.inventory.consumable?.id ?? null,
      weaponAtk: save.inventory.weapon.atk,
      weaponElement: save.inventory.weapon.element,
      armorDef: save.inventory.armor.def,
      armorMaxHpBonus: save.inventory.armor.maxHpBonus,
    });
    const choice = PlaytestBot.chooseRewardCard(cards, {
      floor,
      weapon: save.inventory.weapon,
      armor: save.inventory.armor,
      skills: save.inventory.skills,
      relic: save.inventory.relic,
      consumableId: save.inventory.consumable?.id ?? null,
      consumableCharges: save.midFloor.consumableCharges,
      consumableMaxCharges: save.inventory.consumable?.maxCharges ?? 2,
      consumableHealPercent: save.inventory.consumable?.healPercent ?? 0,
    });
    const card = cards[choice.index];
    if (card.type === 'potion_refill') {
      const maxCons = save.inventory.consumable?.maxCharges ?? 2;
      save.midFloor.consumableCharges = Math.min(
        maxCons,
        save.midFloor.consumableCharges + (card.potionRefillAmount ?? 1)
      );
    } else if (card.type === 'gold_bonus') {
      save.gold += card.goldBonusAmount ?? 0;
    } else if (card.item) {
      if (choice.action === 'equip' && !opts.frozenKinds?.has(card.item.kind)) {
        applyEquip(save, card.item, opts.frozenKinds);
      } else {
        save.gold += SALVAGE_GOLD;
      }
    }

    // Dimensional leap after Apex floors
    if (floor % 50 === 0) {
      const leap = AreaEngine.executeDimensionalLeap({
        clearedFloor: floor,
        weapon: save.inventory.weapon,
        armor: save.inventory.armor,
        skills: save.inventory.skills,
        relicName: save.inventory.relic?.name ?? 'なし',
        gold: save.gold,
      });
      save.inventory.weapon = leap.normalizedWeapon;
      save.inventory.armor = leap.normalizedArmor;
      save.inventory.skills = leap.normalizedSkills;
      save.midFloor.playerCurrentHp = BASE_PLAYER_MAX_HP + leap.normalizedArmor.maxHpBonus;
      const maxCons = save.inventory.consumable?.maxCharges ?? 2;
      save.midFloor.consumableCharges = Math.min(
        maxCons,
        save.midFloor.consumableCharges + 1
      );
      floor = leap.nextFloor;
    } else {
      floor += 1;
    }
  }

  result.finalGold = save.gold;
  return result;
}

export interface AggregateReport {
  runs: RunResult[];
  runCount: number;
  maxFloor: number;
  fullClearRuns: number;
  medianFloorsCleared: number;
  avgDeaths: number;
  avgTurnsPerBattle: number;
  /** Fraction of runs that cleared each floor (only floors with data). */
  clearRateByFloor: Record<number, number>;
  deathsByFloor: Record<number, number>;
  avgFloorEndHpPct: Record<number, number>;
}

export function simulateMany(seeds: number[], maxFloor = 100): AggregateReport {
  const runs = seeds.map((s) => simulateRun(s, maxFloor));
  const clearRateByFloor: Record<number, number> = {};
  const deathsByFloor: Record<number, number> = {};
  const hpSamples: Record<number, number[]> = {};

  for (let f = 1; f <= maxFloor; f++) {
    const cleared = runs.filter((r) => r.floorsCleared >= f).length;
    clearRateByFloor[f] = cleared / runs.length;
  }
  for (const r of runs) {
    for (const [f, n] of Object.entries(r.deathsByFloor)) {
      deathsByFloor[Number(f)] = (deathsByFloor[Number(f)] ?? 0) + n;
    }
    for (const [f, pct] of Object.entries(r.floorEndHpPct)) {
      (hpSamples[Number(f)] ??= []).push(pct);
    }
  }
  const avgFloorEndHpPct: Record<number, number> = {};
  for (const [f, arr] of Object.entries(hpSamples)) {
    avgFloorEndHpPct[Number(f)] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  const sorted = [...runs].sort((a, b) => a.floorsCleared - b.floorsCleared);
  const totalBattles = runs.reduce((a, r) => a + r.battles, 0);
  const totalTurns = runs.reduce((a, r) => a + r.totalTurns, 0);

  return {
    runs,
    runCount: runs.length,
    maxFloor,
    fullClearRuns: runs.filter((r) => r.floorsCleared >= maxFloor).length,
    medianFloorsCleared: sorted[Math.floor(sorted.length / 2)]?.floorsCleared ?? 0,
    avgDeaths: runs.reduce((a, r) => a + r.deaths, 0) / runs.length,
    avgTurnsPerBattle: totalBattles > 0 ? totalTurns / totalBattles : 0,
    clearRateByFloor,
    deathsByFloor,
    avgFloorEndHpPct,
  };
}

export function formatReport(report: AggregateReport): string {
  const lines: string[] = [];
  lines.push(
    `== Playtest Simulation Report (${report.runCount} runs, floors 1-${report.maxFloor}) ==`
  );
  lines.push(
    `Full clears: ${report.fullClearRuns}/${report.runCount} / Median floors cleared: ${report.medianFloorsCleared} / Avg deaths per run: ${report.avgDeaths.toFixed(1)} / Avg turns per battle: ${report.avgTurnsPerBattle.toFixed(1)}`
  );
  lines.push('');
  lines.push('Clear rate by 10-floor band (floor: rate / avg end HP%):');
  for (let start = 1; start <= report.maxFloor; start += 10) {
    const cells: string[] = [];
    for (let f = start; f < Math.min(start + 10, report.maxFloor + 1); f++) {
      const rate = Math.round((report.clearRateByFloor[f] ?? 0) * 100);
      const hp = report.avgFloorEndHpPct[f];
      cells.push(`${f}:${rate}%${hp !== undefined ? `/${hp}%` : ''}`);
    }
    lines.push('  ' + cells.join('  '));
  }
  lines.push('');
  const deathRanking = Object.entries(report.deathsByFloor)
    .map(([f, n]) => ({ floor: Number(f), deaths: n }))
    .sort((a, b) => b.deaths - a.deaths)
    .slice(0, 8);
  lines.push(
    'Deadliest floors: ' +
      (deathRanking.length
        ? deathRanking.map((d) => `${d.floor}F x${d.deaths}`).join(', ')
        : 'none')
  );
  return lines.join('\n');
}
