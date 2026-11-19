import { describe, expect, it } from 'vitest';
import {
  BASE_PLAYER_SPD,
  CombatEngine,
  PlayerLoadout,
  WOUND_RATE,
  calcPlayerSpd,
} from '../src/core/CombatEngine';
import { EnemyDefinition } from '../src/extensible/enemies/types';
import { ENEMY_REGISTRY } from '../src/extensible/enemies/enemyRegistry';
import {
  ARMOR_CATALOG,
  CONSUMABLE_CATALOG,
  RELIC_CATALOG,
  SKILL_CATALOG,
  WEAPON_CATALOG,
} from '../src/extensible/items/itemCatalog';
import { computeActionPreview } from '../src/utils/combatPreview';

const makeLoadout = (over: Partial<PlayerLoadout> = {}): PlayerLoadout => ({
  weapon: WEAPON_CATALOG.rusty_shortsword,
  armor: ARMOR_CATALOG.leather_tunic,
  skills: [null, null, null],
  consumable: CONSUMABLE_CATALOG.crimson_vial,
  relic: null,
  ...over,
});

const makeEnemy = (over: Partial<EnemyDefinition> = {}): EnemyDefinition => ({
  id: 'test_enemy',
  name: 'テスト敵',
  spriteId: 'slime',
  palette: 'moss',
  hp: 100,
  atk: 20,
  def: 2,
  spd: 10,
  phases: [
    {
      hpThresholdPercent: 100,
      actions: [
        {
          name: '体当たり',
          type: 'attack',
          weight: 100,
          damageMultiplier: 1.0,
          logMessage: 'テスト敵の体当たり！',
        },
      ],
    },
  ],
  ...over,
});

/** Deterministic non-crit RNG (0.99 >= 0.05 and 0.1). */
const noCritRng = () => 0.99;

describe('すばやさ（先制・不意打ち）システム', () => {
  it('calcPlayerSpd returns BASE_PLAYER_SPD plus equipped weapon, armor, relic, and skills', () => {
    expect(BASE_PLAYER_SPD).toBe(10);

    const baseLoadout = makeLoadout();
    expect(calcPlayerSpd(baseLoadout)).toBe(10);

    const fullSpeedLoadout = makeLoadout({
      weapon: WEAPON_CATALOG.astral_quill, // +3
      armor: ARMOR_CATALOG.starlight_robe, // +2
      relic: RELIC_CATALOG.bookmark_charm_relic, // +4
      skills: [SKILL_CATALOG.chrono_flip, null, null], // +2
    });
    expect(calcPlayerSpd(fullSpeedLoadout)).toBe(10 + 3 + 2 + 4 + 2);
  });

  it('grants preemptive on tie or when player is faster; skips enemy action on turn 1 only', () => {
    const lo = makeLoadout();
    const enemyTie = makeEnemy({ hp: 200, atk: 20, spd: 12 });

    // Tie: playerSpd === enemy.spd => preemptive
    const tieSession = CombatEngine.createBattleSession(
      100, 100, 2, lo, enemyTie, 1.0, 0, WOUND_RATE, { playerSpd: 12 }
    );
    expect(tieSession.opening).toBe('preemptive');
    expect(tieSession.logs.some((l) => l.includes('先制'))).toBe(true);

    // Faster: playerSpd > enemy.spd => preemptive
    const fastSession = CombatEngine.createBattleSession(
      100, 100, 2, lo, enemyTie, 1.0, 0, WOUND_RATE, { playerSpd: 15 }
    );
    expect(fastSession.opening).toBe('preemptive');

    // Turn 1: player takes 0 damage because enemy skips its action
    const afterTurn1 = CombatEngine.executeTurn(
      fastSession,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(afterTurn1.player.currentHp).toBe(100);
    expect(afterTurn1.turn).toBe(2);

    // Turn 2: enemy acts normally and deals damage
    const afterTurn2 = CombatEngine.executeTurn(
      afterTurn1,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(afterTurn2.player.currentHp).toBeLessThan(100);
  });

  it('still runs enemy turn_start status damage during a preemptive turn 1', () => {
    const lo = makeLoadout({
      skills: [SKILL_CATALOG.venom_strike, null, null],
    });
    const enemy = makeEnemy({ hp: 200, atk: 20, spd: 8 });
    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, enemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(session.opening).toBe('preemptive');

    // Apply poison on turn 1; enemy should still take turn_start poison damage
    // while skipping its attack action.
    const next = CombatEngine.executeTurn(
      session,
      { type: 'skill', slotIndex: 0, targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(next.player.currentHp).toBe(100);
    expect(next.logs.some((l) => l.includes('毒'))).toBe(true);
    expect(next.logs.some((l) => l.includes('先制されて動けない'))).toBe(true);
  });

  it('triggers ambush before player acts when enemy is faster, even if player one-shots the enemy', () => {
    const lo = makeLoadout({
      weapon: WEAPON_CATALOG.obsidian_reaver, // ATK 27
    });
    const fastFragileEnemy = makeEnemy({ hp: 10, atk: 20, def: 0, spd: 15 });

    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, fastFragileEnemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(session.opening).toBe('ambush');
    // HP is not reduced at createBattleSession time
    expect(session.player.currentHp).toBe(100);
    expect(session.logs.some((l) => l.includes('不意打ち'))).toBe(true);

    // Player one-shots the enemy on turn 1, yet still took the ambush damage first
    const next = CombatEngine.executeTurn(
      session,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(next.status).toBe('victory');
    expect(next.player.currentHp).toBeLessThan(100);
  });

  it('ambush never inflicts status effects even from enemies whose only action applies a status', () => {
    const lo = makeLoadout({
      weapon: WEAPON_CATALOG.obsidian_reaver,
    });
    const statusOnlyEnemy = makeEnemy({
      hp: 10, // dies on player's turn 1 attack so only the ambush hits
      atk: 18,
      def: 0,
      spd: 16,
      phases: [
        {
          hpThresholdPercent: 100,
          actions: [
            {
              name: '猛毒の霧',
              type: 'debuff',
              weight: 100,
              damageMultiplier: 1.0,
              statusId: 'poison',
              statusValue: 5,
              statusDuration: 3,
              logMessage: '猛毒の霧を吹きかけた！',
            },
          ],
        },
      ],
    });

    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, statusOnlyEnemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(session.opening).toBe('ambush');

    const next = CombatEngine.executeTurn(
      session,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(next.status).toBe('victory');
    expect(next.player.currentHp).toBeLessThan(100);
    expect(next.player.statuses).toEqual([]);
  });

  it('shield absorbs ambush damage and prevented damage does not accrue wound', () => {
    const lo = makeLoadout({
      weapon: WEAPON_CATALOG.obsidian_reaver,
      // Battle-start shield relic
      relic: RELIC_CATALOG.guardian_crest_relic,
    });
    // Weak fast enemy so the battle-start shield completely absorbs the ambush
    const fastWeakEnemy = makeEnemy({ hp: 10, atk: 8, def: 0, spd: 16 });

    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, fastWeakEnemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(session.opening).toBe('ambush');
    const initialShield = session.player.statuses.find((s) => s.statusId === 'shield');
    expect(initialShield).toBeDefined();
    expect(initialShield!.value).toBeGreaterThanOrEqual(8);

    const next = CombatEngine.executeTurn(
      session,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(next.status).toBe('victory');
    expect(next.player.currentHp).toBe(100);
    expect(next.playerWound).toBe(0);
    expect(next.logs.some((l) => l.includes('障壁が'))).toBe(true);
  });

  it('accrues wound normally from unshielded ambush damage', () => {
    const lo = makeLoadout({
      weapon: WEAPON_CATALOG.obsidian_reaver,
    });
    const fastEnemy = makeEnemy({ hp: 10, atk: 20, def: 0, spd: 16 });

    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, fastEnemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    const next = CombatEngine.executeTurn(
      session,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    const hpLost = 100 - next.player.currentHp;
    expect(hpLost).toBeGreaterThan(0);
    expect(next.playerWound).toBe(Math.ceil(hpLost * WOUND_RATE));
  });

  it('defeats the player immediately if ambush drops player HP to 0', () => {
    const lo = makeLoadout();
    const fastStrongEnemy = makeEnemy({ hp: 100, atk: 50, def: 0, spd: 16 });

    const session = CombatEngine.createBattleSession(
      10, 100, 2, lo, fastStrongEnemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(session.opening).toBe('ambush');
    expect(session.status).toBe('ongoing');
    expect(session.player.currentHp).toBe(10);

    const next = CombatEngine.executeTurn(
      session,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(next.status).toBe('defeat');
    expect(next.player.currentHp).toBe(0);
    // Player did not get to attack the enemy
    expect(next.enemies[0].currentHp).toBe(100);
  });

  it('omitting opening sets opening to null and preserves legacy behavior', () => {
    const lo = makeLoadout();
    const fastEnemy = makeEnemy({ hp: 200, atk: 20, spd: 16 });

    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, fastEnemy, 1.0, 0, WOUND_RATE
    );
    expect(session.opening).toBeNull();
    expect(session.logs.some((l) => l.includes('先制') || l.includes('不意打ち'))).toBe(false);

    // Enemy acts normally on turn 1 (single hit, no ambush)
    const next = CombatEngine.executeTurn(
      session,
      { type: 'attack', targetIndex: 0 },
      lo,
      undefined,
      noCritRng
    );
    expect(next.logs.some((l) => l.includes('不意打ち'))).toBe(false);
    expect(next.player.currentHp).toBeLessThan(100);
  });

  it('uses raw enemy spd without statScale and compares against the fastest enemy in multi-enemy battles', () => {
    const lo = makeLoadout();
    const slowEnemy = ENEMY_REGISTRY.living_tome; // spd 7
    const fastEnemy = ENEMY_REGISTRY.astral_owl; // spd 16

    // Even with statScale 2.0, slowEnemy raw spd is still 7 -> player (10) wins
    const scaledSlow = CombatEngine.createBattleSession(
      100, 100, 2, lo, slowEnemy, 2.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(scaledSlow.opening).toBe('preemptive');

    // In a group with slow (7) + fast (16), fastest is 16 -> player (15) is ambushed
    const groupAmbush = CombatEngine.createBattleSession(
      100, 100, 2, lo, [slowEnemy, fastEnemy], 1.0, 0, WOUND_RATE, { playerSpd: 15 }
    );
    expect(groupAmbush.opening).toBe('ambush');

    // Player with 16 ties the fastest enemy -> preemptive
    const groupPreemptive = CombatEngine.createBattleSession(
      100, 100, 2, lo, [slowEnemy, fastEnemy], 1.0, 0, WOUND_RATE, { playerSpd: 16 }
    );
    expect(groupPreemptive.opening).toBe('preemptive');
  });

  it('combat preview does not mix in ambush damage or mutate opening state', () => {
    const lo = makeLoadout();
    const fastEnemy = makeEnemy({ hp: 100, atk: 20, spd: 16 });
    const session = CombatEngine.createBattleSession(
      100, 100, 2, lo, fastEnemy, 1.0, 0, WOUND_RATE, { playerSpd: 10 }
    );
    expect(session.opening).toBe('ambush');

    const preview = computeActionPreview(session, { type: 'attack', targetIndex: 0 }, lo);
    expect(preview).not.toBeNull();
    expect(preview!.player.currentHp).toBe(100);
    expect(preview!.player.afterHp).toBe(100);
    expect(session.player.currentHp).toBe(100);
  });
});
