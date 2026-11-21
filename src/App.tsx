import { useEffect, useRef, useState } from 'react';
import { AreaEngine } from './core/AreaEngine';
import { BattleSessionState, PlayerCommand, calcPlayerSpd } from './core/CombatEngine';
import { EventEngine } from './core/EventEngine';
import { DropPacingEngine } from './core/DropPacingEngine';
import { BattleStage2D, CombatMotionState, HitFx } from './components/BattleStage2D';
import { BestiaryModal } from './components/BestiaryModal';
import { DataManagementModal } from './components/DataManagementModal';
import { HelpModal } from './components/HelpModal';
import { SaveSlotModal } from './components/SaveSlotModal';
import { TitleScreen } from './components/TitleScreen';
import { UpdateLogModal } from './components/UpdateLogModal';
import { WardrobeArchiveModal } from './components/WardrobeArchiveModal';
import { XShareButton } from './components/XShareButton';
import { PixelSpriteCanvas } from './components/PixelSpriteCanvas';
import { ACHIEVEMENTS } from './extensible/achievements/achievements';
import { LATEST_AUTHORED_FLOOR, isFloorAuthored } from './extensible/realms/realmIndex';
import { SALVAGE_GOLD } from './extensible/items/itemCatalog';
import { DEFEAT_TIPS } from './extensible/tips/defeatTips';
import { useGameStore } from './store/useGameStore';
import { applyHitFxEventToSession, extractTurnHitFx } from './utils/combatFx';
import { computeActionPreview } from './utils/combatPreview';
import { ELEMENT_META } from './utils/elements';
import {
  formatArchiveXShareText,
  formatDefeatXShareText,
  formatFrontierXShareText,
  formatProgressXShareText,
} from './utils/share';
import { isSfxMuted, playSfx, setSfxMuted, SfxName, unlockAudio } from './utils/sound';

/**
 * Label for a reward card's primary button. Equipment, relics and consumables
 * always replace the currently held item (the old equipment is auto-salvaged
 * for gold), and a skill replaces an existing one when all slots are full —
 * so the label says "exchange" instead of implying a pure gain.
 */
function rewardClaimLabel(
  card: { type: string; item?: { kind: string } | null },
  skillsFull: boolean
): string {
  if (card.type === 'potion_refill') return '補充する';
  if (card.type === 'gold_bonus') return '受け取る';
  switch (card.item?.kind) {
    case 'weapon':
      return '今の武器と交換する';
    case 'armor':
      return '今の防具と交換する';
    case 'relic':
      return '今のレリックと交換する';
    case 'consumable':
      return '今の消耗品と交換する';
    case 'skill':
      return skillsFull ? '今のスキルと交換する' : '手に入れる';
    default:
      return '手に入れる';
  }
}

function RealmSystemNotice({
  realm,
  onDismiss,
  className = '',
}: {
  realm: number;
  onDismiss?: () => void;
  className?: string;
}) {
  if (realm !== 2) return null;
  return (
    <div
      role="status"
      className={`rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-2.5 text-xs leading-relaxed text-amber-100 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex-1">
          <strong className="block text-amber-300">🆕 新システム解放：すばやさ</strong>
          第51層以降は、戦闘開始時にプレイヤーと最も速い敵の「すばやさ」を比べます。相手以上なら先制して敵は1ターン目に行動できず、下回ると不意打ちを受けます。武器・防具・レリック・スキルで高められます。
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              onDismiss();
            }}
            className="shrink-0 rounded-lg border border-amber-400/40 bg-amber-900/50 px-2.5 py-1 text-[11px] font-bold text-amber-200 transition hover:bg-amber-800/60 cursor-pointer"
          >
            確認
          </button>
        )}
      </div>
    </div>
  );
}

export function App() {
  const {
    activeSlotId,
    slotSummaries,
    unlockedStartRealm,
    realmStartNoticeRealm,
    dismissRealmStartNotice,
    saveData,
    playerMaxHp,
    floorDef,
    currentRealmMeta,
    resolvedEncounter,
    stage,
    battleSession,
    rewardCards,
    pendingSkillToEquip,
    pendingLeapSkills,
    chooseLeapSkill,
    systemBanner,
    storageError,
    dismissStorageError,
    cosmeticCatalog,
    performCombatCommand,
    proceedAfterCombatVictory,
    selectEventOption,
    selectFloorRewardCard,
    confirmSkillReplace,
    cancelSkillReplace,
    respawnFromCheckpoint,
    resetSave,
    completeDimensionalLeapModal,
    unlockOrEquipCosmetic,
    exportSaveJson,
    importSaveJson,
    switchSaveSlot,
    createNewSaveInSlot,
    deleteSaveSlot,
  } = useGameStore();

  const [motionState, setMotionState] = useState<CombatMotionState>('idle');
  const [activeSkillCallout, setActiveSkillCallout] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [showTitle, setShowTitle] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(() => isSfxMuted());
  const [mobileConsoleTab, setMobileConsoleTab] = useState<'commands' | 'log' | 'equipment'>('commands');

  // Header gold gain indicator (+N for ~2.8s when gold increases)
  const [goldGainDelta, setGoldGainDelta] = useState<number | null>(null);
  const prevGoldRef = useRef<number>(saveData.gold);
  const prevGoldContextRef = useRef<string>(`${activeSlotId}:${saveData.worldSeed}`);
  const goldGainTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const contextKey = `${activeSlotId}:${saveData.worldSeed}`;
    if (prevGoldContextRef.current !== contextKey) {
      prevGoldContextRef.current = contextKey;
      prevGoldRef.current = saveData.gold;
      setGoldGainDelta(null);
      if (goldGainTimerRef.current !== null) {
        window.clearTimeout(goldGainTimerRef.current);
        goldGainTimerRef.current = null;
      }
      return;
    }

    const diff = saveData.gold - prevGoldRef.current;
    prevGoldRef.current = saveData.gold;

    if (diff > 0) {
      setGoldGainDelta((prev) => (prev ?? 0) + diff);
      if (goldGainTimerRef.current !== null) {
        window.clearTimeout(goldGainTimerRef.current);
      }
      goldGainTimerRef.current = window.setTimeout(() => {
        setGoldGainDelta(null);
        goldGainTimerRef.current = null;
      }, 2800);
    }
  }, [saveData.gold, activeSlotId, saveData.worldSeed]);

  useEffect(() => {
    return () => {
      if (goldGainTimerRef.current !== null) {
        window.clearTimeout(goldGainTimerRef.current);
      }
    };
  }, []);

  // Achievement unlock toast queue
  const isFirstMountRef = useRef<boolean>(true);
  const prevAchievementsRef = useRef<Record<string, true>>(saveData.achievements ?? {});
  const [toastQueue, setToastQueue] = useState<string[]>([]);
  const [currentToast, setCurrentToast] = useState<string | null>(null);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevAchievementsRef.current = saveData.achievements ?? {};
      return;
    }

    const prev = prevAchievementsRef.current;
    const current = saveData.achievements ?? {};
    const newlyUnlockedIds = Object.keys(current).filter((id) => current[id] && !prev[id]);
    prevAchievementsRef.current = current;

    if (newlyUnlockedIds.length > 0) {
      const newNames = newlyUnlockedIds.map((id) => {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        return ach ? ach.name : id;
      });
      setToastQueue((q) => [...q, ...newNames]);
    }
  }, [saveData.achievements]);

  useEffect(() => {
    if (currentToast || toastQueue.length === 0) return;

    const [next, ...rest] = toastQueue;
    setCurrentToast(next);
    setToastQueue(rest);
    playSfx('unlock');

    const timer = setTimeout(() => {
      setCurrentToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentToast, toastQueue]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSfxMuted(next);
    if (!next) {
      playSfx('click');
    }
  };

  // Unlock Web Audio context on the first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudio();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Black fade flash whenever the floor changes (stairs, leaps, respawns)
  const [floorFade, setFloorFade] = useState(0);
  const prevFloorRef = useRef(saveData.midFloor.currentFloor);
  useEffect(() => {
    if (prevFloorRef.current !== saveData.midFloor.currentFloor) {
      prevFloorRef.current = saveData.midFloor.currentFloor;
      setFloorFade((n) => n + 1);
    }
  }, [saveData.midFloor.currentFloor]);

  const hasProgress =
    saveData.midFloor.currentFloor > 1 ||
    saveData.midFloor.currentEncounterIndex > 0 ||
    saveData.gold > 30 ||
    saveData.archive.length > 0;

  // Reset target selection whenever a new encounter begins
  useEffect(() => {
    setTargetIndex(0);
  }, [saveData.midFloor.currentFloor, saveData.midFloor.currentEncounterIndex]);

  // Battle victory sound effect
  const prevBattleStatusRef = useRef<string | undefined>(battleSession?.status);
  useEffect(() => {
    if (battleSession?.status === 'victory' && prevBattleStatusRef.current !== 'victory') {
      playSfx('victory');
    }
    prevBattleStatusRef.current = battleSession?.status;
  }, [battleSession?.status]);

  // Stage defeat sound effect + a random tip for the defeat screen
  const [defeatTip, setDefeatTip] = useState<string | null>(null);
  const prevStageRef = useRef<string>(stage);
  useEffect(() => {
    if (stage === 'defeat' && prevStageRef.current !== 'defeat') {
      playSfx('defeat');
      setDefeatTip(DEFEAT_TIPS[Math.floor(Math.random() * DEFEAT_TIPS.length)]);
    }
    prevStageRef.current = stage;
  }, [stage]);

  // Boss encounter sound effect (once per miniboss / apex_boss encounter)
  const playedBossEncounterKeyRef = useRef<string>('');
  useEffect(() => {
    const encounterKey = `${saveData.midFloor.currentFloor}:${saveData.midFloor.currentEncounterIndex}`;
    if (
      stage === 'combat' &&
      resolvedEncounter.kind === 'combat' &&
      (resolvedEncounter.encounterType === 'miniboss' ||
        resolvedEncounter.encounterType === 'apex_boss')
    ) {
      if (playedBossEncounterKeyRef.current !== encounterKey) {
        playedBossEncounterKeyRef.current = encounterKey;
        playSfx('boss');
      }
    }
  }, [
    stage,
    resolvedEncounter,
    saveData.midFloor.currentFloor,
    saveData.midFloor.currentEncounterIndex,
  ]);

  // Floating combat numbers & step-by-step displayed HP/shield state:
  // Each damage source (weapon, skill, relic, burn, poison, enemy attack, event)
  // is emitted separately with an explicit sourceLabel and staggered timing,
  // and displaySession updates HP/shield in sync with each FX popup.
  const [hitFx, setHitFx] = useState<HitFx[]>([]);
  const [displaySession, setDisplaySession] = useState<BattleSessionState | null>(battleSession);
  const [previewCommand, setPreviewCommand] = useState<PlayerCommand | null>(null);
  const prevSessionRef = useRef<typeof battleSession>(null);
  const prevBattleKeyRef = useRef<string>('');
  const fxKeyRef = useRef(0);
  const fxTimersRef = useRef<number[]>([]);
  const lastCombatCmdRef = useRef<PlayerCommand | undefined>(undefined);
  const eventFxActiveUntilRef = useRef<number>(0);

  const SFX_KNOWN_PRESETS = new Set<string>([
    'click',
    'attack',
    'hit',
    'critical',
    'weak',
    'shield',
    'heal',
    'buff',
    'debuff',
    'victory',
    'defeat',
    'reward',
    'event',
    'boss',
    'leap',
    'unlock',
  ]);

  const playHitFxSound = (fx: Omit<HitFx, 'key'>) => {
    if (fx.sourceType === 'burn' || fx.sourceType === 'poison' || fx.sourceType === 'status') {
      playSfx('debuff');
      return;
    }
    const kindStr = fx.kind as string;
    // Prefer preset matching the kind name if available (e.g. 'critical' / 'weak')
    if (kindStr !== 'damage' && SFX_KNOWN_PRESETS.has(kindStr)) {
      playSfx(kindStr as SfxName);
      return;
    }
    if (fx.kind === 'damage' || fx.kind === 'resist') {
      if (fx.side === 'enemy' || fx.sourceType === 'event') {
        playSfx('hit');
      }
    } else if (fx.kind === 'heal') {
      playSfx('heal');
    } else if (fx.kind === 'shield') {
      playSfx('shield');
    }
  };

  const spawnHitFx = (
    fx: Omit<HitFx, 'key'>,
    delayMs: number,
    onLand?: () => void
  ) => {
    const key = ++fxKeyRef.current;
    const entry: HitFx = { ...fx, key };
    const t1 = window.setTimeout(() => {
      onLand?.();
      setHitFx((cur) => [...cur.slice(-11), entry]);
      playHitFxSound(fx);
      const t2 = window.setTimeout(() => {
        setHitFx((cur) => cur.filter((f) => f.key !== key));
      }, 1350);
      fxTimersRef.current.push(t2);
    }, delayMs);
    fxTimersRef.current.push(t1);
  };

  useEffect(() => {
    return () => {
      for (const id of fxTimersRef.current) window.clearTimeout(id);
      fxTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const battleKey = `${saveData.midFloor.currentFloor}:${saveData.midFloor.currentEncounterIndex}`;
    const prev = prevSessionRef.current;
    const next = battleSession;
    if (!next || !prev || prev === next || prevBattleKeyRef.current !== battleKey) {
      for (const id of fxTimersRef.current) window.clearTimeout(id);
      fxTimersRef.current = [];
      if (prevBattleKeyRef.current !== battleKey && Date.now() >= eventFxActiveUntilRef.current) {
        setHitFx([]);
      }
      setDisplaySession(next);
      prevSessionRef.current = next;
      prevBattleKeyRef.current = battleKey;
      return;
    }
    prevSessionRef.current = next;

    // Keep previous HP & shield values at turn start, while updating logs/charges
    setDisplaySession({
      ...prev,
      logs: next.logs,
      skillCharges: next.skillCharges,
      consumableCharges: next.consumableCharges,
    });

    const events = extractTurnHitFx(prev, next, saveData.inventory, lastCombatCmdRef.current);
    let maxDelay = 0;
    for (const ev of events) {
      if (ev.delayMs > maxDelay) maxDelay = ev.delayMs;
      spawnHitFx(
        {
          side: ev.side,
          index: ev.index,
          amount: ev.amount,
          kind: ev.kind,
          sourceType: ev.sourceType,
          sourceLabel: ev.sourceLabel,
          shieldAbsorbed: ev.shieldAbsorbed,
        },
        ev.delayMs,
        () => {
          setDisplaySession((cur) => (cur ? applyHitFxEventToSession(cur, ev) : cur));
        }
      );
    }

    // Final sync after all staggered FX land (ensures status durations, victory/defeat, etc. match)
    const syncTimer = window.setTimeout(() => {
      setDisplaySession(next);
    }, maxDelay + 180);
    fxTimersRef.current.push(syncTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleSession, saveData.midFloor.currentFloor, saveData.midFloor.currentEncounterIndex]);

  const shownSession = stage === 'combat' ? (displaySession ?? battleSession) : null;

  const currentHp =
    stage === 'combat' && shownSession
      ? shownSession.player.currentHp
      : saveData.midFloor.playerCurrentHp;
  const maxConsCharges = saveData.inventory.consumable?.maxCharges ?? 2;

  const actionPreview =
    !isAnimating &&
    stage === 'combat' &&
    shownSession &&
    shownSession.status === 'ongoing' &&
    previewCommand
      ? computeActionPreview(shownSession, previewCommand, saveData.inventory)
      : null;

  const activeEvent =
    stage === 'event' && resolvedEncounter.kind === 'event'
      ? resolvedEncounter.eventDef
      : null;

  // Handle combat command with fluid sequential animations
  const handleCombatAction = (
    cmd:
      | { type: 'attack' }
      | { type: 'skill'; slotIndex: 0 | 1 | 2 }
      | { type: 'consumable' }
  ) => {
    if (isAnimating || !battleSession || battleSession.status !== 'ongoing') return;

    setPreviewCommand(null);
    setIsAnimating(true);

    let playerMotion: CombatMotionState = 'player_attack';
    let skillName: string | null = null;

    if (cmd.type === 'attack') {
      playerMotion = 'player_attack';
      playSfx('attack');
    } else if (cmd.type === 'skill') {
      const skill = saveData.inventory.skills[cmd.slotIndex];
      skillName = skill ? skill.name : null;
      if (skill?.category === 'heal') {
        playerMotion = 'player_skill_heal';
        playSfx('heal');
      } else if (skill?.category === 'buff') {
        playerMotion = 'player_skill_buff';
        playSfx('buff');
      } else if (skill?.category === 'debuff') {
        playerMotion = 'player_skill_debuff';
        playSfx('debuff');
      } else {
        playerMotion = 'player_skill_attack';
        playSfx('attack');
      }
    } else if (cmd.type === 'consumable') {
      playerMotion = 'player_skill_heal';
      skillName = saveData.inventory.consumable?.name ?? '秘薬使用';
      playSfx('heal');
    }

    // Step 1: Player Action Motion
    setMotionState(playerMotion);
    setActiveSkillCallout(skillName);

    setTimeout(() => {
      // Step 2: Enemy hit reaction if offensive action
      if (
        playerMotion === 'player_attack' ||
        playerMotion === 'player_skill_attack' ||
        playerMotion === 'player_skill_debuff'
      ) {
        setMotionState('enemy_hit');
      }

      // Execute actual combat calculations (with the selected target)
      const resolvedCmd: PlayerCommand =
        cmd.type === 'consumable' ? cmd : { ...cmd, targetIndex };
      lastCombatCmdRef.current = resolvedCmd;
      performCombatCommand(resolvedCmd);

      setTimeout(() => {
        // Step 3: Enemy retaliate motion if combat is still ongoing
        setActiveSkillCallout(null);

        // Check if battle still ongoing for enemy attack motion
        setMotionState('enemy_attack');

        setTimeout(() => {
          setMotionState('player_hit');

          setTimeout(() => {
            setMotionState('idle');
            setIsAnimating(false);
          }, 350);
        }, 350);
      }, 350);
    }, 450);
  };

  if (showTitle) {
    return (
      <TitleScreen
        hasProgress={hasProgress}
        floor={saveData.midFloor.currentFloor}
        realmName={currentRealmMeta.name}
        gold={saveData.gold}
        gems={saveData.cosmeticGems}
        archiveCount={saveData.archive.length}
        playerSpriteId={saveData.activeSkinSpriteId}
        playerPaletteId={saveData.activeSkinPaletteId}
        onContinue={() => {
          playSfx('click');
          setShowTitle(false);
        }}
        onReset={() => {
          playSfx('click');
          resetSave();
          setShowTitle(false);
        }}
        saveMenu={
          <SaveSlotModal
            activeSlotId={activeSlotId}
            slotSummaries={slotSummaries}
            unlockedStartRealm={unlockedStartRealm}
            onSwitchSlot={switchSaveSlot}
            onCreateNewSlot={(slotId, startRealm) => {
              createNewSaveInSlot(slotId, startRealm);
              setMobileConsoleTab('commands');
              setShowTitle(false);
            }}
            onDeleteSlot={deleteSaveSlot}
            triggerClassName="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-indigo-400/50 bg-indigo-950/60 px-4 py-3 text-sm font-extrabold text-indigo-100 shadow-lg transition hover:bg-indigo-900/70 cursor-pointer"
          />
        }
        metaMenu={
          <>
            <WardrobeArchiveModal
              variant="title"
              focusTab="wardrobe"
              triggerLabel="💎 挑戦者スキン"
              cosmeticGems={saveData.cosmeticGems}
              unlockedCosmetics={saveData.unlockedCosmetics}
              activeSkinSpriteId={saveData.activeSkinSpriteId}
              activeSkinPaletteId={saveData.activeSkinPaletteId}
              activeTitle={saveData.activeTitle}
              cosmeticCatalog={cosmeticCatalog}
              archive={saveData.archive}
              onSelectCosmetic={unlockOrEquipCosmetic}
            />
            <WardrobeArchiveModal
              variant="title"
              focusTab="archive"
              triggerLabel="📜 登頂記録"
              cosmeticGems={saveData.cosmeticGems}
              unlockedCosmetics={saveData.unlockedCosmetics}
              activeSkinSpriteId={saveData.activeSkinSpriteId}
              activeSkinPaletteId={saveData.activeSkinPaletteId}
              activeTitle={saveData.activeTitle}
              cosmeticCatalog={cosmeticCatalog}
              archive={saveData.archive}
              onSelectCosmetic={unlockOrEquipCosmetic}
            />
            <BestiaryModal
              variant="title"
              bestiary={saveData.bestiary}
              achievements={saveData.achievements}
            />
            <HelpModal variant="title" />
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? '効果音をONにする' : '効果音をミュートにする'}
              title={isMuted ? '効果音をONにする' : '効果音をミュートにする'}
              className="col-span-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-600/60 bg-slate-800/60 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-700/70 cursor-pointer"
            >
              <span aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
              効果音{isMuted ? ' OFF' : ' ON'}
            </button>
          </>
        }
        footerMenu={
          <>
            <UpdateLogModal variant="title" />
            <DataManagementModal
              activeSlotId={activeSlotId}
              onExportSave={exportSaveJson}
              onImportSave={importSaveJson}
            />
            <XShareButton
              text={formatProgressXShareText({
                floor: saveData.midFloor.currentFloor,
                realmName: currentRealmMeta.name,
                weaponName: saveData.inventory.weapon.name,
                activeTitle: saveData.activeTitle,
                maxFloorReached: saveData.playStats?.maxFloorReached,
              })}
              label="𝕏 進捗をポスト"
            />
          </>
        }
      />
    );
  }

  const isCurrentFloorAuthored = isFloorAuthored(saveData.midFloor.currentFloor);

  const equipmentStatusContent = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <span className="text-xs font-extrabold tracking-wider text-amber-300">
          現在の装備
        </span>
        {saveData.midFloor.currentFloor >= 51 && (
          <span className="text-[11px] font-bold text-cyan-300">
            すばやさ {calcPlayerSpd(saveData.inventory)}
          </span>
        )}
      </div>
      <div className="scrollable-log mt-2 flex min-h-0 flex-1 flex-col gap-2 pr-1 text-xs">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2">
          <span className="block text-[10px] text-slate-400">武器</span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold text-slate-100">
            <PixelSpriteCanvas
              spriteId={saveData.inventory.weapon.spriteId}
              scale={3}
              className="h-6 w-6 shrink-0"
            />
            <span className="truncate">{saveData.inventory.weapon.name}</span>
          </span>
          <span className="shrink-0 text-[10px] font-bold text-amber-300">
            ATK +{saveData.inventory.weapon.atk}
            {saveData.inventory.weapon.spd ? (
              <span className="text-cyan-300"> / すばやさ +{saveData.inventory.weapon.spd}</span>
            ) : null}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2">
          <span className="block text-[10px] text-slate-400">防具</span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold text-slate-100">
            <PixelSpriteCanvas
              spriteId={saveData.inventory.armor.spriteId}
              scale={3}
              className="h-6 w-6 shrink-0"
            />
            <span className="truncate">{saveData.inventory.armor.name}</span>
          </span>
          <span className="shrink-0 text-[10px] font-bold text-sky-300">
            DEF +{saveData.inventory.armor.def} / HP +{saveData.inventory.armor.maxHpBonus}
            {saveData.inventory.armor.atkDelta ? (
              <span className="text-red-300"> / ATK {saveData.inventory.armor.atkDelta}</span>
            ) : null}
            {saveData.inventory.armor.spd ? (
              <span className="text-cyan-300"> / すばやさ +{saveData.inventory.armor.spd}</span>
            ) : null}
          </span>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="block text-[10px] text-slate-400">レリック</span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold text-slate-100">
              {saveData.inventory.relic && (
                <PixelSpriteCanvas
                  spriteId={saveData.inventory.relic.spriteId}
                  scale={3}
                  className="h-6 w-6 shrink-0"
                />
              )}
              <span className="truncate">{saveData.inventory.relic?.name ?? 'なし'}</span>
            </span>
            {saveData.inventory.relic?.spd ? (
              <span className="shrink-0 text-[10px] font-bold text-cyan-300">
                すばやさ +{saveData.inventory.relic.spd}
              </span>
            ) : null}
          </div>
          {saveData.inventory.relic && (
            <p className="mt-1 text-[10px] font-bold leading-relaxed text-fuchsia-300">
              {saveData.inventory.relic.description}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2">
          <span className="block text-[10px] text-slate-400">スキル</span>
          <div className="mt-1.5 flex flex-col gap-2">
            {saveData.inventory.skills.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between gap-1.5 font-bold text-slate-100">
                  <span className="flex min-w-0 items-center gap-1.5">
                    {s && (
                      <PixelSpriteCanvas
                        spriteId={s.spriteId}
                        scale={3}
                        className="h-6 w-6 shrink-0"
                      />
                    )}
                    <span className="truncate">{s?.name ?? '（空き）'}</span>
                  </span>
                  {s?.spd ? (
                    <span className="shrink-0 text-[10px] font-bold text-cyan-300">
                      すばやさ +{s.spd}
                    </span>
                  ) : null}
                </div>
                {s && (
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
                    {s.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2">
          <div className="flex items-center justify-between gap-2">
            <span className="block text-[10px] text-slate-400">消耗品</span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 font-bold text-slate-100">
              {saveData.inventory.consumable && (
                <PixelSpriteCanvas
                  spriteId={saveData.inventory.consumable.spriteId}
                  scale={3}
                  className="h-6 w-6 shrink-0"
                />
              )}
              <span className="truncate">{saveData.inventory.consumable?.name ?? 'なし'}</span>
            </span>
            {saveData.inventory.consumable && (
              <span className="shrink-0 text-[10px] font-bold text-emerald-300">
                残り {saveData.midFloor.consumableCharges} 回
              </span>
            )}
          </div>
          {saveData.inventory.consumable && (
            <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
              {saveData.inventory.consumable.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const equipmentRailContent = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <span className="text-xs font-extrabold tracking-wider text-amber-300">
          現在の装備
        </span>
        {saveData.midFloor.currentFloor >= 51 && (
          <span className="text-[11px] font-bold text-cyan-300">
            すばやさ {calcPlayerSpd(saveData.inventory)}
          </span>
        )}
      </div>
      <div className="scrollable-log mt-2 flex min-h-0 flex-1 flex-col gap-2 pr-1 xl:mt-2.5 xl:gap-2.5">
        {/* Weapon Card */}
        <div className="flex min-h-[64px] flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-1.5 xl:px-3.5 xl:py-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-800/90 bg-slate-900/80 xl:h-14 xl:w-14">
            <PixelSpriteCanvas
              spriteId={saveData.inventory.weapon.spriteId}
              scale={5}
              className="h-9 w-9 xl:h-12 xl:w-12"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400">武器</span>
              <span className="text-[11px] font-bold text-amber-300">
                ATK +{saveData.inventory.weapon.atk}
                {saveData.inventory.weapon.spd ? (
                  <span className="text-cyan-300"> / すばやさ +{saveData.inventory.weapon.spd}</span>
                ) : null}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-extrabold text-slate-100 xl:text-sm">
              {saveData.inventory.weapon.name}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-400 xl:mt-1 xl:line-clamp-2">
              {saveData.inventory.weapon.description}
            </p>
          </div>
        </div>

        {/* Armor Card */}
        <div className="flex min-h-[64px] flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-1.5 xl:px-3.5 xl:py-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-800/90 bg-slate-900/80 xl:h-14 xl:w-14">
            <PixelSpriteCanvas
              spriteId={saveData.inventory.armor.spriteId}
              scale={5}
              className="h-9 w-9 xl:h-12 xl:w-12"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400">防具</span>
              <span className="text-[11px] font-bold text-sky-300">
                DEF +{saveData.inventory.armor.def} / HP +{saveData.inventory.armor.maxHpBonus}
                {saveData.inventory.armor.atkDelta ? (
                  <span className="text-red-300"> / ATK {saveData.inventory.armor.atkDelta}</span>
                ) : null}
                {saveData.inventory.armor.spd ? (
                  <span className="text-cyan-300"> / すばやさ +{saveData.inventory.armor.spd}</span>
                ) : null}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs font-extrabold text-slate-100 xl:text-sm">
              {saveData.inventory.armor.name}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-slate-400 xl:mt-1 xl:line-clamp-2">
              {saveData.inventory.armor.description}
            </p>
          </div>
        </div>

        {/* Relic Card */}
        <div className="flex min-h-[64px] flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/90 px-3 py-1.5 xl:px-3.5 xl:py-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-800/90 bg-slate-900/80 xl:h-14 xl:w-14">
            {saveData.inventory.relic ? (
              <PixelSpriteCanvas
                spriteId={saveData.inventory.relic.spriteId}
                scale={5}
                className="h-9 w-9 xl:h-12 xl:w-12"
              />
            ) : (
              <span className="text-base font-bold text-slate-600" aria-hidden="true">
                —
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400">レリック</span>
              {saveData.inventory.relic?.spd ? (
                <span className="text-[11px] font-bold text-cyan-300">
                  すばやさ +{saveData.inventory.relic.spd}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs font-extrabold text-slate-100 xl:text-sm">
              {saveData.inventory.relic?.name ?? 'なし'}
            </p>
            <p
              className={`mt-0.5 line-clamp-1 text-[11px] leading-snug xl:mt-1 xl:line-clamp-2 ${
                saveData.inventory.relic ? 'font-semibold text-fuchsia-300' : 'text-slate-500'
              }`}
            >
              {saveData.inventory.relic?.description ?? 'レリックを未装着です'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const isFittedStage = stage === 'combat' || stage === 'floor_reward';
  const hasBoss = shownSession?.enemyDefs.some((d) => d.isBoss) ?? false;

  return (
    <div className="anim-fade-in h-dvh overflow-hidden flex flex-col bg-slate-950 text-slate-100">
      {/* Compact RPG Header */}
      <header className="shrink-0 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1760px] flex-wrap items-center justify-between gap-1.5 px-2.5 py-1.5 sm:gap-3 sm:px-5 sm:py-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-base font-extrabold tracking-wider text-amber-400">
              DAILY TOWER
            </h1>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
              Slot {activeSlotId}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-slate-200">
              {currentRealmMeta.name}（第{saveData.midFloor.currentFloor}層）
            </span>
            {!isCurrentFloorAuthored && (
              <span
                title={`第${LATEST_AUTHORED_FLOOR}層まで固有フロアが実装されています。次回の更新をお待ちください。`}
                className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-200"
              >
                🏁 最前線待機中
              </span>
            )}
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-bold sm:gap-3 sm:px-3">
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <span>💰 {saveData.gold} G</span>
                {goldGainDelta !== null && (
                  <span
                    role="status"
                    aria-live="polite"
                    className="anim-fade-in rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-extrabold text-emerald-300"
                  >
                    +{goldGainDelta}
                  </span>
                )}
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-fuchsia-300">💎 {saveData.cosmeticGems}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setShowTitle(true);
                }}
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-600/60 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700/70 cursor-pointer sm:gap-1.5 sm:px-3"
              >
                <span>🏠 タイトル</span>
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? '効果音をONにする' : '効果音をミュートにする'}
                title={isMuted ? '効果音をONにする' : '効果音をミュートにする'}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-600/60 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700/70 cursor-pointer"
              >
                <span aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
              </button>
              <HelpModal />
              <BestiaryModal
                bestiary={saveData.bestiary}
                achievements={saveData.achievements}
              />
              <WardrobeArchiveModal
              cosmeticGems={saveData.cosmeticGems}
              unlockedCosmetics={saveData.unlockedCosmetics}
              activeSkinSpriteId={saveData.activeSkinSpriteId}
              activeSkinPaletteId={saveData.activeSkinPaletteId}
              activeTitle={saveData.activeTitle}
              cosmeticCatalog={cosmeticCatalog}
              archive={saveData.archive}
              onSelectCosmetic={unlockOrEquipCosmetic}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main 2D RPG Screen */}
      <main
        className={`mx-auto flex w-full max-w-[1760px] flex-1 min-h-0 flex-col ${
          isFittedStage
            ? 'gap-2 overflow-hidden px-3 py-2 sm:gap-2.5 sm:px-5 sm:py-2.5'
            : 'gap-3 overflow-y-auto px-3 py-3 sm:px-5'
        }`}
      >
        {storageError && (
          <div
            role="alert"
            className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-500/50 bg-rose-950/70 px-4 py-2 text-xs font-bold text-rose-100"
          >
            <span>⚠️ {storageError}</span>
            <button
              type="button"
              onClick={dismissStorageError}
              className="rounded-lg border border-rose-400/40 bg-rose-900/60 px-2.5 py-1 text-[11px] font-bold text-rose-100 transition hover:bg-rose-800/70 cursor-pointer"
            >
              閉じる
            </button>
          </div>
        )}

        {/* Realm Start System Notice */}
        {realmStartNoticeRealm !== null && (
          <RealmSystemNotice
            realm={realmStartNoticeRealm}
            onDismiss={dismissRealmStartNotice}
            className="shrink-0"
          />
        )}

        {/* Notification Toast Bar */}
        {systemBanner && (
          <div
            role="status"
            aria-live="polite"
            className="shrink-0 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-1.5 text-center text-xs font-bold text-amber-200"
          >
            {systemBanner}
          </div>
        )}

        {/* 1. Stage + PC Equipment Rail (same height, side-by-side on lg+) */}
        <div
          className={`grid grid-cols-1 grid-rows-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-3 ${
            isFittedStage
              ? 'min-h-[200px] flex-1'
              : 'h-[15rem] shrink-0 sm:h-[18rem] lg:h-[clamp(18rem,36dvh,24rem)]'
          }`}
        >
          {/* 2D RPG Stage Viewport (Background + Facing Characters + Overlays) */}
          <div className="relative min-h-0 h-full">
            <BattleStage2D
              realm={floorDef.realm}
              floor={floorDef.floor}
              floorTitle={floorDef.title}
              encounters={floorDef.encounters}
              currentEncounterIndex={saveData.midFloor.currentEncounterIndex}
              playerSpriteId={saveData.activeSkinSpriteId}
              playerPaletteId={saveData.activeSkinPaletteId}
              playerTitle={saveData.activeTitle}
              playerCurrentHp={currentHp}
              playerWound={saveData.midFloor.playerWound}
              playerMaxHp={playerMaxHp}
              playerAtk={saveData.inventory.weapon.atk + (saveData.inventory.armor.atkDelta ?? 0)}
              playerDef={saveData.inventory.armor.def}
              playerSpd={
                saveData.midFloor.currentFloor >= 51
                  ? calcPlayerSpd(saveData.inventory)
                  : undefined
              }
              battleSession={shownSession}
              hitFx={hitFx}
              actionPreview={actionPreview}
              activeEvent={activeEvent}
              motionState={motionState}
              activeSkillName={activeSkillCallout}
              selectedTargetIndex={targetIndex}
              onSelectTarget={setTargetIndex}
            />

            {/* Floor Clear Reward Overlay */}
            {stage === 'floor_reward' && rewardCards && (
              <div
                role="region"
                aria-label={`第${saveData.midFloor.currentFloor}層 踏破報酬`}
                className="anim-fade-in absolute inset-0 z-30 flex flex-col overflow-y-auto rounded-2xl bg-slate-950/80 p-3 backdrop-blur-xs sm:p-4"
              >
                <div className="mx-auto my-auto flex w-full max-w-3xl flex-col gap-2.5 sm:gap-3">
                  <h2 className="text-center text-sm font-extrabold tracking-wide text-amber-300 sm:text-base">
                    第{saveData.midFloor.currentFloor}層 踏破報酬（1つ選択）
                  </h2>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
                    {rewardCards.map((card) => (
                      <div
                        key={card.slot}
                        className="flex flex-col justify-between rounded-xl border border-slate-600/80 bg-slate-900/95 p-2.5 shadow-xl sm:p-3"
                      >
                        <div>
                          {card.item && (
                            <div className="mb-1.5 flex justify-center">
                              <PixelSpriteCanvas
                                spriteId={card.item.spriteId}
                                scale={5}
                                className="h-10 w-10 sm:h-12 sm:w-12"
                              />
                            </div>
                          )}
                          <h3 className="text-center text-xs font-extrabold text-slate-100 sm:text-sm">
                            {card.title}
                          </h3>
                          <p className="mt-0.5 text-center text-[11px] font-semibold text-indigo-300">
                            {card.subtitle}
                          </p>
                          {card.item && (
                            <p className="mt-1.5 text-[11px] leading-snug text-slate-300">
                              {card.item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-2.5 flex flex-col gap-1.5 border-t border-slate-800 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              playSfx('reward');
                              selectFloorRewardCard(card, 'equip');
                            }}
                            className="w-full rounded-lg bg-amber-500 py-1.5 text-xs font-extrabold text-slate-950 transition hover:bg-amber-400 cursor-pointer"
                          >
                            {rewardClaimLabel(
                              card,
                              saveData.inventory.skills.every((s) => s !== null)
                            )}
                          </button>
                          {card.item && 'salvageGold' in card.item && (
                            <button
                              type="button"
                              onClick={() => {
                                playSfx('reward');
                                selectFloorRewardCard(card, 'salvage');
                              }}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-800 cursor-pointer"
                            >
                              分解 (+{SALVAGE_GOLD} G)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {stage === 'defeat' && !isAnimating && (
              <div className="defeat-pulse pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-slate-950/60">
                <div className="anim-rise-in px-4 text-center">
                  <p className="text-4xl" aria-hidden="true">💀</p>
                  <p className="mt-1 text-2xl font-black tracking-widest text-rose-400">
                    力尽きた…
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-300">
                    {currentRealmMeta.name}（第{saveData.midFloor.currentFloor}層）で倒れた
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PC Equipment Rail (Weapon, Armor, Relic only — same height as Stage) */}
          <aside
            aria-label="現在の装備"
            className="hidden min-h-0 h-full flex-col rounded-2xl border-2 border-slate-700/90 bg-slate-900/95 px-4 py-2.5 shadow-xl lg:flex xl:py-3"
          >
            {equipmentRailContent}
          </aside>
        </div>

        {/* 2. Consoles & Panels (grid-placed on PC, tabbed on mobile) */}
        <div className="flex shrink-0 gap-1.5 lg:hidden" role="tablist" aria-label="操作・メッセージ・装備の切り替え">
          <button
            type="button"
            role="tab"
            aria-selected={mobileConsoleTab === 'commands'}
            onClick={() => {
              playSfx('click');
              setMobileConsoleTab('commands');
            }}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-extrabold transition cursor-pointer ${
              mobileConsoleTab === 'commands'
                ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚔️ コマンド
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileConsoleTab === 'log'}
            onClick={() => {
              playSfx('click');
              setMobileConsoleTab('log');
            }}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-extrabold transition cursor-pointer ${
              mobileConsoleTab === 'log'
                ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            📜 メッセージ
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileConsoleTab === 'equipment'}
            onClick={() => {
              playSfx('click');
              setMobileConsoleTab('equipment');
            }}
            className={`flex-1 rounded-xl border px-2 py-2 text-xs font-extrabold transition cursor-pointer ${
              mobileConsoleTab === 'equipment'
                ? 'border-amber-400/70 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            🛡️ 装備
          </button>
        </div>

          {/* COMMANDS CONSOLE: Commands / Event Choices / Rewards */}
          <div
            aria-label="コマンドとメッセージウィンドウ"
            className={`${
              mobileConsoleTab === 'commands' ? 'flex' : 'hidden lg:flex'
            } flex-col rounded-2xl border-2 border-slate-700/90 bg-slate-900/95 px-3 py-2.5 shadow-xl sm:px-4 sm:py-3 ${
              isFittedStage
                ? 'max-lg:h-[44dvh] max-lg:max-h-[380px] max-lg:shrink max-lg:overflow-y-auto lg:shrink-0'
                : 'shrink-0'
            }`}
          >
            {/* COMBAT COMMANDS */}
            {(stage === 'combat' || stage === 'floor_reward') && battleSession && (
              <>
                {battleSession.status === 'victory' && stage === 'combat' ? (
                  <div className="anim-rise-in flex flex-1 flex-col items-center justify-center py-4 text-center">
                    <p className="text-base font-extrabold text-emerald-300">
                      🏆 {battleSession.enemyDefs.map((d) => d.name).join(' と ')} を倒した！
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        proceedAfterCombatVictory();
                      }}
                      className="mt-3 rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-emerald-400 cursor-pointer"
                    >
                      先へ進む ➔
                    </button>
                  </div>
                ) : (
                  <div inert={stage === 'floor_reward'} className={`flex flex-1 flex-col gap-2.5 ${stage === 'floor_reward' ? 'pointer-events-none' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-xs font-extrabold tracking-wider text-amber-300">
                        コマンド
                      </span>
                      {stage === 'floor_reward' ? (
                        <span className="rounded-md border border-amber-400/40 bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                          🔒 踏破報酬の選択中はコマンドをロックしています
                        </span>
                      ) : actionPreview ? (
                        <span className="rounded-md border border-sky-400/40 bg-sky-950/60 px-2 py-0.5 text-[11px] font-bold text-sky-200">
                          🔮 プレビュー（{actionPreview.label}）：{actionPreview.summaryText}
                        </span>
                      ) : (
                        <span className="rounded-md border border-transparent px-2 py-0.5 text-[11px] text-slate-400">
                          {isAnimating ? '行動中…' : '行動を選択してください（カーソルで効果プレビュー）'}
                        </span>
                      )}
                    </div>

                    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5 ${stage === 'floor_reward' ? 'opacity-70' : ''}`}>
                      {/* Attack Button */}
                      <button
                        type="button"
                        disabled={isAnimating}
                        onMouseEnter={() => setPreviewCommand({ type: 'attack', targetIndex })}
                        onMouseLeave={() => setPreviewCommand(null)}
                        onFocus={() => setPreviewCommand({ type: 'attack', targetIndex })}
                        onBlur={() => setPreviewCommand(null)}
                        onClick={() => handleCombatAction({ type: 'attack' })}
                        className="col-span-2 flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-left transition hover:border-amber-400 hover:bg-slate-800/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer sm:col-span-1"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <PixelSpriteCanvas
                            spriteId={saveData.inventory.weapon.spriteId}
                            scale={3}
                            className="h-6 w-6 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="block font-extrabold text-sm text-amber-300">
                              たたかう
                            </span>
                            <p className="truncate text-[11px] text-slate-400">
                              {saveData.inventory.weapon.name}（ATK {saveData.inventory.weapon.atk}）
                            </p>
                          </div>
                        </div>
                        <span className="ml-2 shrink-0 whitespace-nowrap rounded bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-300">
                          回数無制限
                        </span>
                      </button>

                      {/* 3 Skill Buttons */}
                      {([0, 1, 2] as const).map((slotIdx) => {
                        const skill = saveData.inventory.skills[slotIdx];
                        const remaining = battleSession.skillCharges[slotIdx];
                        const disabled = isAnimating || !skill || remaining <= 0;

                        return (
                          <button
                            key={slotIdx}
                            type="button"
                            disabled={disabled}
                            onMouseEnter={() =>
                              !disabled &&
                              setPreviewCommand({ type: 'skill', slotIndex: slotIdx, targetIndex })
                            }
                            onMouseLeave={() => setPreviewCommand(null)}
                            onFocus={() =>
                              !disabled &&
                              setPreviewCommand({ type: 'skill', slotIndex: slotIdx, targetIndex })
                            }
                            onBlur={() => setPreviewCommand(null)}
                            onClick={() =>
                              handleCombatAction({ type: 'skill', slotIndex: slotIdx })
                            }
                            className="flex flex-col justify-between rounded-xl border border-indigo-500/35 bg-indigo-950/35 px-3.5 py-2 text-left transition hover:border-indigo-400 hover:bg-indigo-900/45 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="flex min-w-0 items-center gap-1.5 font-bold text-xs text-slate-100">
                                {skill && (
                                  <PixelSpriteCanvas
                                    spriteId={skill.spriteId}
                                    scale={3}
                                    className="h-6 w-6 shrink-0"
                                  />
                                )}
                                <span className="truncate">{skill ? skill.name : '―'}</span>
                              </span>
                              {skill?.targetScope === 'all_enemies' && (
                                <span className="shrink-0 rounded bg-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-200">
                                  全体
                                </span>
                              )}
                              {skill && (
                                <span
                                  className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                                    remaining > 0
                                      ? 'bg-indigo-500/30 text-indigo-200'
                                      : 'bg-rose-900/50 text-rose-300'
                                  }`}
                                >
                                  {remaining}/{skill.maxChargesPerBattle}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] leading-snug text-slate-400">
                              {skill ? skill.description : '空きスロット'}
                            </p>
                          </button>
                        );
                      })}

                      {/* Consumable Button */}
                      <button
                        type="button"
                        disabled={
                          isAnimating ||
                          !saveData.inventory.consumable ||
                          battleSession.consumableCharges <= 0
                        }
                        onMouseEnter={() => setPreviewCommand({ type: 'consumable' })}
                        onMouseLeave={() => setPreviewCommand(null)}
                        onFocus={() => setPreviewCommand({ type: 'consumable' })}
                        onBlur={() => setPreviewCommand(null)}
                        onClick={() => handleCombatAction({ type: 'consumable' })}
                        className="flex flex-col justify-between rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-3.5 py-2 text-left transition hover:border-emerald-400 hover:bg-emerald-900/40 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex min-w-0 items-center gap-1.5 font-bold text-xs text-emerald-200">
                            {saveData.inventory.consumable && (
                              <PixelSpriteCanvas
                                spriteId={saveData.inventory.consumable.spriteId}
                                scale={3}
                                className="h-6 w-6 shrink-0"
                              />
                            )}
                            <span className="truncate">
                              {saveData.inventory.consumable?.name ?? '秘薬なし'}
                            </span>
                          </span>
                          <span className="shrink-0 rounded bg-emerald-500/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-200">
                            {battleSession.consumableCharges}/{maxConsCharges}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-400">
                          {saveData.inventory.consumable?.description ?? '―'}
                        </p>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {stage === 'floor_reward' && !battleSession && (
              <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
                <span className="rounded-md border border-amber-400/40 bg-amber-950/60 px-3 py-1.5 text-xs font-bold text-amber-200">
                  🔒 ステージ上のカードから踏破報酬を選択してください
                </span>
              </div>
            )}

            {/* EVENT DIALOGUE & CHOICES */}
            {stage === 'event' && activeEvent && (
              <div key={activeEvent.id} className="anim-rise-in mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-amber-300">
                    {activeEvent.title}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    {activeEvent.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {activeEvent.options.map((opt) => {
                    const affordable = EventEngine.canAffordOption(
                      {
                        currentHp: saveData.midFloor.playerCurrentHp,
                        maxHp: playerMaxHp,
                        gold: saveData.gold,
                        consumableCharges: saveData.midFloor.consumableCharges,
                        consumableMaxCharges: maxConsCharges,
                        currentFloor: saveData.midFloor.currentFloor,
                      },
                      opt
                    );
                    const grantItem = EventEngine.previewGrant(
                      opt,
                      saveData.midFloor.currentFloor,
                      saveData.worldSeed ?? 0,
                      saveData.midFloor.currentEncounterIndex
                    );
                    const grantDominated =
                      grantItem?.kind === 'weapon'
                        ? DropPacingEngine.isWeaponDominated(grantItem, {
                            atk: saveData.inventory.weapon.atk,
                            element: saveData.inventory.weapon.element,
                          })
                        : grantItem?.kind === 'armor'
                          ? DropPacingEngine.isArmorDominated(grantItem, {
                              def: saveData.inventory.armor.def,
                              maxHpBonus: saveData.inventory.armor.maxHpBonus,
                            })
                          : false;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={!affordable}
                        onClick={() => {
                          playSfx('event');
                          const hpCost = opt.cost?.hpPercent
                            ? Math.floor((playerMaxHp * opt.cost.hpPercent) / 100)
                            : 0;
                          const hpHeal = opt.outcome.healHpPercent
                            ? Math.floor((playerMaxHp * opt.outcome.healHpPercent) / 100)
                            : 0;
                          if (hpCost > 0) {
                            eventFxActiveUntilRef.current = Date.now() + 1400;
                            spawnHitFx(
                              {
                                side: 'player',
                                index: 0,
                                amount: hpCost,
                                kind: 'damage',
                                sourceType: 'event',
                                sourceLabel: `📜 ${activeEvent.title}`,
                              },
                              0
                            );
                          }
                          if (hpHeal > 0) {
                            eventFxActiveUntilRef.current = Date.now() + 1400;
                            spawnHitFx(
                              {
                                side: 'player',
                                index: 0,
                                amount: hpHeal,
                                kind: 'heal',
                                sourceType: 'heal',
                                sourceLabel: `📜 ${activeEvent.title}`,
                              },
                              hpCost > 0 ? 220 : 0
                            );
                          }
                          selectEventOption(opt);
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-left transition hover:border-amber-400 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-xs text-amber-200">{opt.label}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {opt.description}
                          </p>
                          {grantItem && (
                            <>
                              <p className="mt-1 text-[11px] font-bold text-emerald-300">
                                🎁 獲得：{grantItem.name}
                                {grantItem.kind === 'weapon' &&
                                  `（ATK ${grantItem.atk}・${ELEMENT_META[grantItem.element].icon}${ELEMENT_META[grantItem.element].name}属性）`}
                                {grantItem.kind === 'armor' &&
                                  `（DEF ${grantItem.def}・HP+${grantItem.maxHpBonus}）`}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {grantDominated
                                  ? `今の装備より弱いため、受け取ると分解（${SALVAGE_GOLD}G）になります`
                                  : grantItem.description}
                              </p>
                            </>
                          )}
                        </div>
                        <span className="ml-3 flex shrink-0 items-center gap-2">
                          {opt.cost?.gold ? (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-200">
                              {EventEngine.scaledGoldCost(
                                opt.cost.gold,
                                saveData.midFloor.currentFloor
                              )}{' '}
                              G
                            </span>
                          ) : null}
                          <span className="text-xs font-bold text-amber-300">
                            {affordable ? '▶' : '不足'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SKILL REPLACE PROMPT */}
            {stage === 'skill_replace_prompt' && pendingSkillToEquip && (
              <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-indigo-300">
                    入れ替えるスキルを選択してください
                  </h2>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-300">
                    <PixelSpriteCanvas
                      spriteId={pendingSkillToEquip.spriteId}
                      scale={3}
                      className="h-6 w-6 shrink-0"
                    />
                    <span>
                      新スキル：<strong className="text-amber-300">{pendingSkillToEquip.name}</strong>（{pendingSkillToEquip.description}）
                    </span>
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {([0, 1, 2] as const).map((idx) => {
                    const existing = saveData.inventory.skills[idx];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playSfx('click');
                          confirmSkillReplace(idx);
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-left transition hover:border-indigo-400 cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          {existing && (
                            <PixelSpriteCanvas
                              spriteId={existing.spriteId}
                              scale={3}
                              className="mt-0.5 h-6 w-6 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-100">
                              {existing?.name ?? '空き'}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {existing?.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      cancelSkillReplace();
                    }}
                    className="w-full rounded-xl border border-indigo-500/50 bg-indigo-950/60 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-900/70 cursor-pointer"
                  >
                    ⬅ 選び直す（報酬に戻る）
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      confirmSkillReplace('salvage');
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
                  >
                    習得せず分解する (+{SALVAGE_GOLD} G)
                  </button>
                </div>
              </div>
            )}

            {/* LEAP SKILL CHOICE */}
            {stage === 'leap_skill_choice' && (
              <div className="anim-rise-in flex flex-1 flex-col items-center justify-center py-4">
                <h2 className="text-center text-lg font-extrabold text-fuchsia-300">
                  🌀 次元跳躍：持ち越すスキルを選んでください
                </h2>
                <p className="mt-2 max-w-md text-center text-xs leading-relaxed text-slate-300">
                  新しい領域へ持ち越せるスキルは
                  <strong className="text-slate-100">1つだけ</strong>
                  です。選ばなかったスキルは失われます。武器・防具は新しい領域の基準装備に置き換わり、レリック・所持金・ジェムはそのまま引き継がれます。
                </p>
                <div className="mt-4 grid w-full max-w-lg gap-2 sm:grid-cols-3">
                  {pendingLeapSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        playSfx('click');
                        chooseLeapSkill(skill.id);
                      }}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-left transition hover:border-fuchsia-400 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <PixelSpriteCanvas
                          spriteId={skill.spriteId}
                          scale={3}
                          className="mt-0.5 h-6 w-6 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-100">
                            {skill.name}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {skill.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DIMENSIONAL LEAP */}
            {stage === 'dimensional_leap' && (
              <div className="anim-rise-in flex flex-1 flex-col items-center justify-center py-4 text-center">
                <h2 className="text-lg font-extrabold text-amber-300">
                  領域制覇！次なる領域への扉が開かれた
                </h2>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-300">
                  ここまでの戦いの記録が聖堂に刻まれ、報酬として{' '}
                  <strong className="text-fuchsia-300">💎 ジェム +15</strong> と{' '}
                  <strong className="text-emerald-300">🧪 秘薬 +1回分</strong> を獲得しました。
                </p>
                {saveData.midFloor.currentFloor === 51 && (
                  <RealmSystemNotice realm={2} className="mt-3 max-w-md" />
                )}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('leap');
                      completeDimensionalLeapModal();
                    }}
                    className="rounded-xl bg-fuchsia-500 px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-fuchsia-400 cursor-pointer"
                  >
                    第{saveData.midFloor.currentFloor}層へ進む ➔
                  </button>
                  {saveData.archive[0] && (
                    <XShareButton
                      text={formatArchiveXShareText(saveData.archive[0], saveData.activeTitle)}
                      label="𝕏 制覇記録をポスト"
                      className="rounded-xl border border-sky-500/40 bg-sky-950/60 px-4 py-2.5 text-sm font-bold text-sky-200 transition hover:bg-sky-900/70 cursor-pointer"
                    />
                  )}
                </div>
              </div>
            )}

            {/* FRONTIER REACHED (Latest Authored Floor Cleared) */}
            {stage === 'frontier_reached' && (
              <div className="anim-rise-in flex flex-1 flex-col items-center justify-center py-4 text-center">
                <p className="text-[11px] font-extrabold tracking-widest text-emerald-300">
                  FRONTIER REACHED
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-amber-300">
                  🚩 最新実装フロア（第{LATEST_AUTHORED_FLOOR}層）を踏破！
                </h2>
                <p className="mt-2 max-w-lg text-xs leading-relaxed text-slate-300">
                  現時点で実装されている塔の最前線に到達しました。新しい階層は日々追加されていきます！
                  <br />
                  現在は <strong className="text-slate-100">スロット {activeSlotId}（第{saveData.midFloor.currentFloor}層）</strong> の入口で自動保存されています。
                  このまま次の更新をお待ちいただくか、別スロットに新規セーブデータを作成して新しい冒険をお楽しみください。
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <SaveSlotModal
                    activeSlotId={activeSlotId}
                    slotSummaries={slotSummaries}
                    unlockedStartRealm={unlockedStartRealm}
                    onSwitchSlot={switchSaveSlot}
                    onCreateNewSlot={createNewSaveInSlot}
                    onDeleteSlot={deleteSaveSlot}
                    triggerLabel="📁 新規セーブ作成・切替"
                    triggerClassName="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      setShowTitle(true);
                    }}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-5 py-2.5 text-sm font-extrabold text-emerald-200 transition hover:bg-emerald-900/70 cursor-pointer"
                  >
                    🏠 タイトルへ戻る
                  </button>
                  <XShareButton
                    text={formatFrontierXShareText({
                      clearedFloor: LATEST_AUTHORED_FLOOR,
                      realmName: currentRealmMeta.name,
                      weaponName: saveData.inventory.weapon.name,
                      activeTitle: saveData.activeTitle,
                    })}
                    label="𝕏 最前線到達をポスト"
                    className="rounded-xl border border-sky-500/40 bg-sky-950/60 px-4 py-2.5 text-sm font-bold text-sky-200 transition hover:bg-sky-900/70 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* DEFEAT */}
            {stage === 'defeat' && (
              <div className="anim-rise-in flex flex-1 flex-col items-center justify-center py-4 text-center">
                <h2 className="text-lg font-extrabold text-rose-400">
                  💀 力尽きてしまった…
                </h2>
                <p className="mt-1.5 text-xs text-slate-300">
                  所持金や装備を保ったまま、第
                  {AreaEngine.calculateRespawnFloor(saveData.midFloor.currentFloor)}
                  層から再び挑むことができます。
                </p>
                {defeatTip && (
                  <div className="mt-4 w-full max-w-md rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-amber-300">
                      💡 ヒント
                    </span>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-100/90">
                      {defeatTip}
                    </p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      respawnFromCheckpoint();
                    }}
                    className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-rose-500 cursor-pointer"
                  >
                    第{AreaEngine.calculateRespawnFloor(saveData.midFloor.currentFloor)}層から再挑戦する
                  </button>
                  <XShareButton
                    text={formatDefeatXShareText({
                      floor: saveData.midFloor.currentFloor,
                      realmName: currentRealmMeta.name,
                      activeTitle: saveData.activeTitle,
                      respawnFloor: AreaEngine.calculateRespawnFloor(saveData.midFloor.currentFloor),
                    })}
                    label="𝕏 敗北をポスト"
                    className="rounded-xl border border-sky-500/40 bg-sky-950/60 px-4 py-2.5 text-sm font-bold text-sky-200 transition hover:bg-sky-900/70 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

        {/* 3. Bottom strip: full-width message log on PC; tabbed message/equipment on mobile */}
        <div
          className={`${
            mobileConsoleTab === 'commands' ? 'hidden lg:flex' : 'flex'
          } min-h-0 flex-col ${
            isFittedStage
              ? `max-lg:h-[44dvh] max-lg:max-h-[380px] max-lg:shrink lg:min-h-[140px] lg:grow-0 lg:shrink ${
                  hasBoss
                    ? 'lg:basis-[22dvh] lg:max-h-[260px]'
                    : 'lg:basis-[26dvh] lg:max-h-[295px]'
                }`
              : 'max-lg:h-[320px] shrink-0 lg:h-[240px]'
          }`}
        >
          {/* Message Log Panel */}
          <div
            className={`${
              mobileConsoleTab === 'log' ? 'flex' : 'hidden lg:flex'
            } min-h-0 flex-1 flex-col rounded-2xl border-2 border-slate-700/90 bg-slate-900/95 px-4 py-3 shadow-xl`}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <span className="shrink-0 text-xs font-extrabold tracking-wider text-amber-300">
                メッセージ
              </span>
              <ul className="scrollable-log mt-2 min-h-0 flex-1 space-y-1 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-slate-200">
                {battleSession ? (
                  [...battleSession.logs].reverse().map((line, i) => (
                    <li
                      key={i}
                      className={
                        line.startsWith('──')
                          ? 'text-amber-400 font-bold pt-1'
                          : line.includes('撃破') || line.includes('回復') || line.includes('倒した')
                          ? 'text-emerald-300'
                          : line.includes('🩸') || line.includes('💀')
                          ? 'text-rose-300'
                          : 'text-slate-200'
                      }
                    >
                      {line}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">
                    {activeEvent ? `${activeEvent.title}に到達した。` : '次の階層へ進む準備を整えている…'}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Mobile Equipment Status Panel (PC uses the right rail next to the stage) */}
          <div
            className={`${
              mobileConsoleTab === 'equipment' ? 'flex lg:hidden' : 'hidden'
            } min-h-0 flex-1 flex-col rounded-2xl border-2 border-slate-700/90 bg-slate-900/95 px-4 py-3 shadow-xl`}
          >
            {equipmentStatusContent}
          </div>
        </div>
      </main>
      {/* Achievement Unlock Toast */}
      {currentToast && (
        <div
          role="status"
          aria-live="polite"
          className="anim-rise-in pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-amber-500/60 bg-slate-900/95 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-2xl backdrop-blur"
        >
          <span className="text-base" aria-hidden="true">🏆</span>
          <span>実績解除「{currentToast}」</span>
        </div>
      )}

      {floorFade > 0 && (
        <div
          key={floorFade}
          className="anim-floor-fade pointer-events-none fixed inset-0 z-[80] bg-slate-950"
        />
      )}
    </div>
  );
}
