export type EncounterType = 'battle' | 'event' | 'miniboss' | 'apex_boss';

export interface Encounter {
  type: EncounterType;
  enemyId?: string;
  /**
   * Multi-enemy battle (1-3 enemies). When present, takes precedence over
   * enemyId: the player fights all listed enemies at once, selecting a
   * target for single-target attacks/skills. Boss encounters stay solo.
   */
  enemyIds?: string[];
  eventId?: string;
  enemyStatScale?: number; // Multiplier for enemy HP/ATK/DEF on higher floors within the realm
}

export interface FloorRewardPool {
  equipmentIds: string[];  // Card 1 candidates (Weapon / Armor)
  skillIds: string[];      // Card 2 candidates (Skill)
  utilityIds: string[];    // Card 3 candidates (Relic, or Consumable on Miniboss/Apex per §3.1)
  consumableIds?: string[]; // Optional Card 3 Consumable candidates
}

export interface FloorDefinition {
  floor: number;
  realm: number;
  title: string;
  subtitle: string;
  encounters: Encounter[];
  /**
   * Optional: when omitted, the pool is derived from item debut floors
   * (own block + previous block, band-filtered) by rewardPoolDerivation.
   */
  rewardPool?: FloorRewardPool;
}

/**
 * Floors in this file are AUTHORED DATA.
 * Daily floors are added or changed by editing entries below — never by
 * procedural generation. Composition rules (Spec §5.2) are enforced by
 * tests/floor_structure.test.ts.
 */

export const REALM_01_FLOORS: FloorDefinition[] = [
  {
    floor: 1,
    realm: 1,
    title: '苔むした樹海の入口',
    subtitle: '木漏れ日が差す石畳の回廊で、樹海に住まう小動物やスライムと初めて対峙する導入階',
    encounters: [
      { type: 'battle', enemyIds: ['moss_slime'], enemyStatScale: 1.08 },
      { type: 'event', eventId: 'verdant_shrine' },
      { type: 'battle', enemyIds: ['forest_goblin'], enemyStatScale: 1.08 },
      { type: 'battle', enemyIds: ['moss_slime', 'thorn_sprout'], enemyStatScale: 1.08 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'travelers_leather'],
      skillIds: ['quick_slash', 'ember_toss', 'forest_breath'],
      utilityIds: ['hunters_badge'],
      consumableIds: [],
    },
  },
  {
    floor: 2,
    realm: 1,
    title: '棘と毒の茂み',
    subtitle: '毒を帯びたスライムや棘の新芽が群生する、薄暗い樹海の小道',
    encounters: [
      { type: 'battle', enemyIds: ['thorn_sprout'], enemyStatScale: 0.865 },
      { type: 'battle', enemyIds: ['toxic_slime'], enemyStatScale: 0.865 },
      { type: 'event', eventId: 'wandering_herbalist' },
      { type: 'battle', enemyIds: ['toxic_slime', 'forest_goblin'], enemyStatScale: 0.865 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'travelers_leather'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath'],
      utilityIds: ['hunters_badge'],
      consumableIds: [],
    },
  },
  {
    floor: 3,
    realm: 1,
    title: '木漏れ日の野営地',
    subtitle: '巨木の根元に差し込む穏やかな光の下で、旅人が息を整える安息の階層',
    encounters: [
      { type: 'battle', enemyIds: ['bark_beetle'], enemyStatScale: 0.72 },
      { type: 'battle', enemyIds: ['shadow_wolf'], enemyStatScale: 0.72 },
      { type: 'event', eventId: 'sunlit_clearing' },
      { type: 'battle', enemyIds: ['bark_beetle'], enemyStatScale: 0.72 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'travelers_leather'],
      skillIds: ['quick_slash', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot'],
      utilityIds: ['hunters_badge'],
      consumableIds: [],
    },
  },
  {
    floor: 4,
    realm: 1,
    title: '妖光揺らめく深緑',
    subtitle: '青白い鬼火と蔦の徘徊者が縄張りを守り、中ボス前の連戦が待ち受ける密林の奥',
    encounters: [
      { type: 'battle', enemyIds: ['forest_wisp'], enemyStatScale: 0.765 },
      { type: 'battle', enemyIds: ['vine_stalker'], enemyStatScale: 0.765 },
      { type: 'event', eventId: 'verdant_shrine' },
      { type: 'battle', enemyIds: ['shadow_wolf'], enemyStatScale: 0.765 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'travelers_leather'],
      skillIds: ['ember_toss', 'sweeping_arc', 'bark_guard', 'sap_shot', 'venom_sting'],
      utilityIds: ['hunters_badge'],
      consumableIds: [],
    },
  },
  {
    floor: 5,
    realm: 1,
    title: 'ゴブリン頭領の砦',
    subtitle: '樹海の第一関門を統べる森ゴブリンの頭領が、配下を従えて待ち受ける木造の砦',
    encounters: [
      { type: 'battle', enemyIds: ['forest_goblin', 'moss_slime'], enemyStatScale: 0.62 },
      { type: 'event', eventId: 'wandering_herbalist' },
      { type: 'battle', enemyIds: ['thorn_sprout', 'bark_beetle'], enemyStatScale: 0.62 },
      { type: 'miniboss', enemyIds: ['goblin_chieftain'], enemyStatScale: 0.62 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'travelers_leather'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting'],
      utilityIds: ['hunters_badge'],
      consumableIds: ['herbal_poultice'],
    },
  },
  {
    floor: 6,
    realm: 1,
    title: '棘木の深道',
    subtitle: '樹皮カブトと棘の新芽が道を塞ぎ、新たな自然属性の武具が解禁される中盤の入口',
    encounters: [
      { type: 'battle', enemyIds: ['toxic_slime'], enemyStatScale: 0.67 },
      { type: 'event', eventId: 'verdant_shrine' },
      { type: 'battle', enemyIds: ['forest_wisp'], enemyStatScale: 0.67 },
      { type: 'battle', enemyIds: ['vine_stalker'], enemyStatScale: 0.67 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'travelers_leather', 'mossweave_vest'],
      skillIds: ['quick_slash', 'sweeping_arc', 'bark_guard'],
      utilityIds: ['hunters_badge', 'verdant_brooch'],
      consumableIds: [],
    },
  },
  {
    floor: 7,
    realm: 1,
    title: '樹液滴る古道',
    subtitle: '毒と妖光が交錯する薄暗い古道で、状態異常への対処力が試される階層',
    encounters: [
      { type: 'battle', enemyIds: ['moss_slime'], enemyStatScale: 0.67 },
      { type: 'event', eventId: 'wandering_herbalist' },
      { type: 'battle', enemyIds: ['bark_beetle'], enemyStatScale: 0.67 },
      { type: 'battle', enemyIds: ['shadow_wolf'], enemyStatScale: 0.67 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'travelers_leather', 'mossweave_vest'],
      skillIds: ['ember_toss', 'forest_breath', 'sap_shot', 'venom_sting'],
      utilityIds: ['hunters_badge', 'verdant_brooch'],
      consumableIds: [],
    },
  },
  {
    floor: 8,
    realm: 1,
    title: '巨樹の根の休息所',
    subtitle: '3F以来の安息の地。10Fの琥珀の巨兵との決戦を前に、体力と消耗品を整える階層',
    encounters: [
      { type: 'battle', enemyIds: ['forest_goblin'], enemyStatScale: 0.68 },
      { type: 'battle', enemyIds: ['thorn_sprout'], enemyStatScale: 0.68 },
      { type: 'event', eventId: 'sunlit_clearing' },
      { type: 'battle', enemyIds: ['toxic_slime'], enemyStatScale: 0.68 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'travelers_leather', 'mossweave_vest'],
      skillIds: ['quick_slash', 'sweeping_arc', 'forest_breath', 'bark_guard'],
      utilityIds: ['verdant_brooch'],
      consumableIds: [],
    },
  },
  {
    floor: 9,
    realm: 1,
    title: '琥珀の回廊',
    subtitle: '樹液が結晶化した琥珀が壁面を覆い、Block 1 の集大成となる関門が近づく回廊',
    encounters: [
      { type: 'battle', enemyIds: ['shadow_wolf'], enemyStatScale: 0.72 },
      { type: 'event', eventId: 'verdant_shrine' },
      { type: 'battle', enemyIds: ['forest_wisp'], enemyStatScale: 0.72 },
      { type: 'battle', enemyIds: ['vine_stalker'], enemyStatScale: 0.72 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'travelers_leather', 'mossweave_vest'],
      skillIds: ['ember_toss', 'bark_guard', 'sap_shot', 'venom_sting'],
      utilityIds: ['hunters_badge', 'verdant_brooch'],
      consumableIds: [],
    },
  },
  {
    floor: 10,
    realm: 1,
    title: '琥珀の祭壇',
    subtitle: '黄金色の結晶に守られた祭壇にて、Block 1 を締めくくる琥珀の巨兵が立ち塞がる',
    encounters: [
      { type: 'battle', enemyIds: ['forest_wisp'], enemyStatScale: 0.86 },
      { type: 'event', eventId: 'wandering_herbalist' },
      { type: 'battle', enemyIds: ['vine_stalker'], enemyStatScale: 0.86 },
      { type: 'miniboss', enemyIds: ['amber_golem'], enemyStatScale: 0.58 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'travelers_leather', 'mossweave_vest'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting'],
      utilityIds: ['hunters_badge', 'verdant_brooch'],
      consumableIds: ['amber_tonic'],
    },
  },
  {
    floor: 11,
    realm: 1,
    title: '霧立ち込める樹林',
    subtitle: '冷たい朝霧が視界を遮り、Block 1 の魔物たちが最後の縄張り争いを繰り広げる中盤の入口',
    encounters: [
      { type: 'battle', enemyIds: ['moss_slime', 'forest_goblin'], enemyStatScale: 0.55 },
      { type: 'event', eventId: 'forest_spring' },
      { type: 'battle', enemyIds: ['mist_wolf'], enemyStatScale: 0.55 },
      { type: 'battle', enemyIds: ['thorn_sprout', 'toxic_slime'], enemyStatScale: 0.55 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm'],
      consumableIds: [],
    },
  },
  {
    floor: 12,
    realm: 1,
    title: '胞子舞う古鍛冶跡',
    subtitle: '毒胞子を撒くゴブリンや霧オオカミが徘徊し、打ち捨てられた鍛冶場の跡が点在する階層',
    encounters: [
      { type: 'battle', enemyIds: ['bark_beetle', 'shadow_wolf'], enemyStatScale: 0.47 },
      { type: 'battle', enemyIds: ['spore_goblin'], enemyStatScale: 0.47 },
      { type: 'event', eventId: 'mossy_forge' },
      { type: 'battle', enemyIds: ['mist_wolf', 'spore_goblin'], enemyStatScale: 0.47 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm'],
      consumableIds: [],
    },
  },
  {
    floor: 13,
    realm: 1,
    title: '木漏れ日の小休止',
    subtitle: '8F以来の安息の空き地。Block 1 最後のカメオ敵を退け、後半戦へ向けて態勢を立て直す階層',
    encounters: [
      { type: 'battle', enemyIds: ['forest_wisp', 'vine_stalker'], enemyStatScale: 0.52 },
      { type: 'battle', enemyIds: ['canopy_spider'], enemyStatScale: 0.52 },
      { type: 'event', eventId: 'sunlit_clearing' },
      { type: 'battle', enemyIds: ['frost_slime'], enemyStatScale: 0.52 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm'],
      consumableIds: [],
    },
  },
  {
    floor: 14,
    realm: 1,
    title: '朽木と焦土の境界',
    subtitle: '蒼い霊気を放つ朽木の精霊と焦げ木の幼体が縄張りを接し、15Fの関門が迫る密林',
    encounters: [
      { type: 'battle', enemyIds: ['hollow_dryad'], enemyStatScale: 0.65 },
      { type: 'event', eventId: 'verdant_shrine' },
      { type: 'battle', enemyIds: ['charred_sapling'], enemyStatScale: 0.65 },
      { type: 'battle', enemyIds: ['canopy_spider', 'frost_slime'], enemyStatScale: 0.65 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm'],
      consumableIds: [],
    },
  },
  {
    floor: 15,
    realm: 1,
    title: '紅蓮鬼火の玉座',
    subtitle: '紅蓮の炎を纏う古の鬼火王が、石像の守護者と大蛇を従えて待ち受ける中盤の関門',
    encounters: [
      { type: 'battle', enemyIds: ['mossy_gargoyle', 'spore_goblin'], enemyStatScale: 0.52 },
      { type: 'event', eventId: 'wandering_herbalist' },
      { type: 'battle', enemyIds: ['deepwood_viper'], enemyStatScale: 0.52 },
      { type: 'miniboss', enemyIds: ['ancient_wisp_lord'], enemyStatScale: 0.5 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm'],
      consumableIds: ['frost_draught'],
    },
  },
  {
    floor: 16,
    realm: 1,
    title: '霊気と焦熱の密林',
    subtitle: '精霊の魔力と焦げ木の火の粉が交錯し、step 4 の新たな武具とスキルが解禁される階層',
    encounters: [
      { type: 'battle', enemyIds: ['hollow_dryad', 'frost_slime'], enemyStatScale: 0.4 },
      { type: 'event', eventId: 'forest_spring' },
      { type: 'battle', enemyIds: ['charred_sapling', 'spore_goblin'], enemyStatScale: 0.4 },
      { type: 'battle', enemyIds: ['mossy_gargoyle'], enemyStatScale: 0.4 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak', 'elder_bow', 'ironbark_mail'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward', 'spirit_breeze', 'verdant_focus', 'toxic_mist'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm', 'amber_heart'],
      consumableIds: [],
    },
  },
  {
    floor: 17,
    realm: 1,
    title: '大蛇の潜む古道',
    subtitle: '深緑の大蛇や樹冠グモが獲物を待ち構え、持久戦への備えが試される密林の奥地',
    encounters: [
      { type: 'battle', enemyIds: ['deepwood_viper'], enemyStatScale: 0.36 },
      { type: 'battle', enemyIds: ['canopy_spider', 'mist_wolf'], enemyStatScale: 0.36 },
      { type: 'event', eventId: 'mossy_forge' },
      { type: 'battle', enemyIds: ['hollow_dryad', 'frost_slime'], enemyStatScale: 0.36 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak', 'elder_bow', 'ironbark_mail'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward', 'spirit_breeze', 'verdant_focus', 'toxic_mist'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm', 'amber_heart'],
      consumableIds: [],
    },
  },
  {
    floor: 18,
    realm: 1,
    title: '木漏れ日の隠れ里',
    subtitle: '13F以来の安息の空き地。20Fの鉄樹の守護者との決戦に備え、消耗品と体力を整える階層',
    encounters: [
      { type: 'battle', enemyIds: ['charred_sapling'], enemyStatScale: 0.48 },
      { type: 'battle', enemyIds: ['hollow_dryad'], enemyStatScale: 0.48 },
      { type: 'event', eventId: 'sunlit_clearing' },
      { type: 'battle', enemyIds: ['mist_wolf', 'canopy_spider'], enemyStatScale: 0.48 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak', 'elder_bow', 'ironbark_mail'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward', 'spirit_breeze', 'verdant_focus', 'toxic_mist'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm', 'amber_heart'],
      consumableIds: [],
    },
  },
  {
    floor: 19,
    realm: 1,
    title: '鉄樹の回廊',
    subtitle: '鋼のように硬い樹根が通路を覆い、守護者の気配が色濃く漂う決戦前夜の回廊',
    encounters: [
      { type: 'battle', enemyIds: ['charred_sapling'], enemyStatScale: 0.65 },
      { type: 'event', eventId: 'verdant_shrine' },
      { type: 'battle', enemyIds: ['mossy_gargoyle'], enemyStatScale: 0.65 },
      { type: 'battle', enemyIds: ['deepwood_viper'], enemyStatScale: 0.65 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak', 'elder_bow', 'ironbark_mail'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward', 'spirit_breeze', 'verdant_focus', 'toxic_mist'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm', 'amber_heart'],
      consumableIds: [],
    },
  },
  {
    floor: 20,
    realm: 1,
    title: '鉄樹の聖域',
    subtitle: 'Block 2 を締めくくる鉄樹の守護者が、聖域の最奥で挑戦者を待ち受ける決戦の場',
    encounters: [
      { type: 'battle', enemyIds: ['mossy_gargoyle'], enemyStatScale: 0.55 },
      { type: 'event', eventId: 'wandering_herbalist' },
      { type: 'battle', enemyIds: ['deepwood_viper'], enemyStatScale: 0.55 },
      { type: 'miniboss', enemyIds: ['ironbark_sentinel'], enemyStatScale: 0.5 },
    ],
    rewardPool: {
      equipmentIds: ['hunters_shortblade', 'thornwood_spear', 'iron_hatchet', 'travelers_leather', 'mossweave_vest', 'spider_silk_cloak', 'elder_bow', 'ironbark_mail'],
      skillIds: ['quick_slash', 'ember_toss', 'sweeping_arc', 'forest_breath', 'bark_guard', 'sap_shot', 'venom_sting', 'iron_cleave', 'gale_sweep', 'crimson_fireball', 'ironbark_ward', 'spirit_breeze', 'verdant_focus', 'toxic_mist'],
      utilityIds: ['hunters_badge', 'verdant_brooch', 'mist_charm', 'amber_heart'],
      consumableIds: ['dryad_elixir'],
    },
  },
  {
    floor: 21,
    realm: 1,
    title: '第21層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'glen_elk', enemyStatScale: 0.932 },
      { type: 'event', eventId: 'marsh_reed_shrine' },
      { type: 'battle', enemyId: 'needle_porcupine', enemyStatScale: 0.932 },
      { type: 'battle', enemyId: 'bark_chameleon', enemyStatScale: 0.932 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 22,
    realm: 1,
    title: '第22層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'mist_moth', enemyStatScale: 1.06 },
      { type: 'battle', enemyId: 'canopy_spider', enemyStatScale: 1.06 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'battle', enemyId: 'swamp_croc', enemyStatScale: 1.06 },
      { type: 'battle', enemyId: 'amber_wisp', enemyStatScale: 1.06 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 23,
    realm: 1,
    title: '第23層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'moss_owl', enemyStatScale: 1.02 },
      { type: 'battle', enemyId: 'thorn_trapper', enemyStatScale: 1.02 },
      { type: 'event', eventId: 'sunken_mirror_stele' },
      { type: 'battle', enemyId: 'ivy_creeper', enemyStatScale: 1.02 },
      { type: 'battle', enemyId: 'moss_crab', enemyStatScale: 1.02 },
      { type: 'battle', enemyId: 'amber_wisp', enemyStatScale: 1.02 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 24,
    realm: 1,
    title: '第24層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'needle_porcupine', enemyStatScale: 0.966 },
      { type: 'event', eventId: 'lotus_spring_pool' },
      { type: 'battle', enemyId: 'thorn_mantis', enemyStatScale: 0.966 },
      { type: 'battle', enemyId: 'bloom_mandragora', enemyStatScale: 0.966 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 25,
    realm: 1,
    title: '第25層：古樹の結界回廊',
    subtitle: 'フロア最奥に領域の守護ミニボスが立ち塞がる',
    encounters: [
      { type: 'battle', enemyId: 'swamp_croc', enemyStatScale: 1.02 },
      { type: 'battle', enemyId: 'mist_moth', enemyStatScale: 1.02 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'miniboss', enemyId: 'elder_oak_warden', enemyStatScale: 1.56 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 26,
    realm: 1,
    title: '第26層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'moss_tortoise', enemyStatScale: 0.95 },
      { type: 'battle', enemyId: 'thorn_mantis', enemyStatScale: 0.95 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'battle', enemyId: 'needle_porcupine', enemyStatScale: 0.95 },
      { type: 'battle', enemyId: 'bloom_mandragora', enemyStatScale: 0.95 },
      { type: 'battle', enemyIds: ['mist_moth', 'swamp_croc'], enemyStatScale: 0.95 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'emberbrand_shortsword', 'marsh_shell_cuirass', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 27,
    realm: 1,
    title: '第27層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'verdant_falcon', enemyStatScale: 1.01 },
      { type: 'event', eventId: 'starlight_archive' },
      { type: 'battle', enemyId: 'moss_tortoise', enemyStatScale: 1.01 },
      { type: 'battle', enemyId: 'thorn_mantis', enemyStatScale: 1.01 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'emberbrand_shortsword', 'marsh_shell_cuirass', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 28,
    realm: 1,
    title: '第28層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'spirit_fox', enemyStatScale: 0.817 },
      { type: 'battle', enemyId: 'needle_porcupine', enemyStatScale: 0.817 },
      { type: 'event', eventId: 'emerald_spring' },
      { type: 'battle', enemyId: 'bloom_mandragora', enemyStatScale: 0.817 },
      { type: 'battle', enemyIds: ['verdant_falcon', 'moss_tortoise'], enemyStatScale: 0.817 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'emberbrand_shortsword', 'marsh_shell_cuirass', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 29,
    realm: 1,
    title: '第29層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'spirit_fox', enemyStatScale: 0.698 },
      { type: 'battle', enemyId: 'thorn_mantis', enemyStatScale: 0.698 },
      { type: 'event', eventId: 'crimson_pact_altar' },
      { type: 'battle', enemyId: 'swamp_croc', enemyStatScale: 0.698 },
      { type: 'battle', enemyId: 'verdant_falcon', enemyStatScale: 0.698 },
      { type: 'battle', enemyIds: ['spirit_fox', 'bloom_mandragora'], enemyStatScale: 0.698 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'emberbrand_shortsword', 'marsh_shell_cuirass', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 30,
    realm: 1,
    title: '第30層：古樹の結界回廊',
    subtitle: 'フロア最奥に領域の守護ミニボスが立ち塞がる',
    encounters: [
      { type: 'battle', enemyIds: ['needle_porcupine', 'mist_moth'], enemyStatScale: 0.9 },
      { type: 'battle', enemyIds: ['moss_tortoise', 'verdant_falcon'], enemyStatScale: 0.9 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'miniboss', enemyId: 'verdant_gryphon', enemyStatScale: 0.98 },
    ],
    rewardPool: {
      equipmentIds: ['ancient_bark_mail', 'elder_thorn_sword', 'emberbrand_shortsword', 'marsh_shell_cuirass', 'mistweave_cloak', 'mistwood_glaive', 'reed_harpoon', 'reed_scale_jerkin'],
      skillIds: ['aegis_stance', 'ancient_trunk_cleave', 'armor_crush', 'bog_miasma', 'briar_lash', 'elder_bark_resonance', 'fen_frost_mist', 'hollow_root_pierce', 'marsh_lunge', 'mist_rend', 'moss_ward', 'venom_strike', 'water_mirror_grace', 'worldtree_sap_elixir'],
      utilityIds: ['ancient_amber_relic', 'golden_compass_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ancient_sap_vial', 'hollow_stone_elixir', 'lotus_dew_phial', 'sylvan_tonic'],
    },
  },
  {
    floor: 31,
    realm: 1,
    title: '第31層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'bog_toad', enemyStatScale: 0.97 },
      { type: 'battle', enemyId: 'mist_moth', enemyStatScale: 0.97 },
      { type: 'event', eventId: 'mossy_ruin_tablet' },
      { type: 'battle', enemyId: 'fungal_strider', enemyStatScale: 0.97 },
      { type: 'battle', enemyIds: ['bog_toad', 'swamp_croc'], enemyStatScale: 0.97 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 32,
    realm: 1,
    title: '第32層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'lichen_ape', enemyStatScale: 0.85 },
      { type: 'battle', enemyId: 'thorn_centipede', enemyStatScale: 0.85 },
      { type: 'event', eventId: 'hollow_root_basin' },
      { type: 'battle', enemyId: 'bloom_mandragora', enemyStatScale: 0.85 },
      { type: 'battle', enemyId: 'spirit_fox', enemyStatScale: 0.85 },
      { type: 'battle', enemyIds: ['thorn_centipede', 'thorn_mantis'], enemyStatScale: 0.85 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 33,
    realm: 1,
    title: '第33層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyIds: ['ancient_scarab', 'verdant_falcon'], enemyStatScale: 0.89 },
      { type: 'event', eventId: 'ancient_root_altar' },
      { type: 'battle', enemyId: 'spirit_fox', enemyStatScale: 0.89 },
      { type: 'battle', enemyId: 'moss_tortoise', enemyStatScale: 0.89 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 34,
    realm: 1,
    title: '第34層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'dusk_crow', enemyStatScale: 1.099 },
      { type: 'battle', enemyId: 'ancient_scarab', enemyStatScale: 1.099 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'battle', enemyId: 'bog_toad', enemyStatScale: 1.099 },
      { type: 'battle', enemyIds: ['lichen_ape', 'fungal_strider'], enemyStatScale: 1.099 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 35,
    realm: 1,
    title: '第35層：古樹の結界回廊',
    subtitle: 'フロア最奥に領域の守護ミニボスが立ち塞がる',
    encounters: [
      { type: 'battle', enemyId: 'thorn_centipede', enemyStatScale: 1.121 },
      { type: 'battle', enemyIds: ['dusk_crow', 'bog_toad'], enemyStatScale: 1.121 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'miniboss', enemyId: 'sylvan_hydra', enemyStatScale: 1.288 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 36,
    realm: 1,
    title: '第36層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'vine_stalker', enemyStatScale: 1.132 },
      { type: 'event', eventId: 'hollow_root_basin' },
      { type: 'battle', enemyId: 'ancient_scarab', enemyStatScale: 1.132 },
      { type: 'battle', enemyIds: ['dusk_crow', 'lichen_ape'], enemyStatScale: 1.132 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 37,
    realm: 1,
    title: '第37層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'moss_gargoyle', enemyStatScale: 1.132 },
      { type: 'battle', enemyId: 'vine_stalker', enemyStatScale: 1.132 },
      { type: 'event', eventId: 'ancient_root_altar' },
      { type: 'battle', enemyId: 'fungal_strider', enemyStatScale: 1.132 },
      { type: 'battle', enemyId: 'thorn_centipede', enemyStatScale: 1.132 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 38,
    realm: 1,
    title: '第38層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'bog_toad', enemyStatScale: 1.154 },
      { type: 'battle', enemyId: 'dusk_crow', enemyStatScale: 1.154 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'battle', enemyId: 'ancient_scarab', enemyStatScale: 1.154 },
      { type: 'battle', enemyId: 'vine_stalker', enemyStatScale: 1.154 },
      { type: 'battle', enemyId: 'moss_gargoyle', enemyStatScale: 1.154 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 39,
    realm: 1,
    title: '第39層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'fungal_strider', enemyStatScale: 1.45 },
      { type: 'event', eventId: 'mossy_ruin_tablet' },
      { type: 'battle', enemyId: 'thorn_centipede', enemyStatScale: 1.45 },
      { type: 'battle', enemyId: 'moss_gargoyle', enemyStatScale: 1.45 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 40,
    realm: 1,
    title: '第40層：古樹の結界回廊',
    subtitle: 'フロア最奥に領域の守護ミニボスが立ち塞がる',
    encounters: [
      { type: 'battle', enemyId: 'moss_gargoyle', enemyStatScale: 1.42 },
      { type: 'battle', enemyId: 'vine_stalker', enemyStatScale: 1.42 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'miniboss', enemyId: 'verdant_basilisk', enemyStatScale: 1.85 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'emberbrand_shortsword', 'hollow_bough_blade', 'marsh_shell_cuirass', 'mirror_lotus_blade', 'moss_stone_cuirass', 'reed_harpoon', 'reed_scale_jerkin', 'rootstone_mace'],
      skillIds: ['amber_sap_surge', 'armor_crush', 'bog_miasma', 'bog_venom_strike', 'elder_bark_resonance', 'fen_frost_mist', 'moss_stone_bastion', 'moss_ward', 'root_breaker_smash', 'seed_of_bastion', 'war_cry', 'water_mirror_grace', 'worldtree_sap_elixir', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'rootstone_ember_seal_relic', 'vampiric_fang_relic', 'venom_gland_relic'],
      consumableIds: ['ambrosia_flask', 'ancient_sap_vial', 'hollow_stone_elixir', 'root_marrow_draught'],
    },
  },
  {
    floor: 41,
    realm: 1,
    title: '第41層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'chasm_moss_core', enemyStatScale: 1.199 },
      { type: 'battle', enemyId: 'ancient_mask_spirit', enemyStatScale: 1.199 },
      { type: 'event', eventId: 'worldtree_sap_altar' },
      { type: 'battle', enemyId: 'abyssal_mycelium', enemyStatScale: 1.199 },
      { type: 'battle', enemyId: 'fungal_strider', enemyStatScale: 1.199 },
      { type: 'battle', enemyId: 'worldtree_sprout', enemyStatScale: 1.199 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_branch_spear'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 42,
    realm: 1,
    title: '第42層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'runic_hollow', enemyStatScale: 1.5 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'battle', enemyId: 'silicified_wraith', enemyStatScale: 1.5 },
      { type: 'battle', enemyId: 'vine_stalker', enemyStatScale: 1.5 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_branch_spear'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 43,
    realm: 1,
    title: '第43層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'amber_crystal_idol', enemyStatScale: 1.169 },
      { type: 'battle', enemyId: 'rootbound_armor', enemyStatScale: 1.169 },
      { type: 'event', eventId: 'canopy_seed_stele' },
      { type: 'battle', enemyId: 'moss_gargoyle', enemyStatScale: 1.169 },
      { type: 'battle', enemyIds: ['chasm_moss_core', 'worldtree_sprout'], enemyStatScale: 1.169 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_branch_spear'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 44,
    realm: 1,
    title: '第44層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'abyssal_mycelium', enemyStatScale: 1.232 },
      { type: 'battle', enemyId: 'ancient_mask_spirit', enemyStatScale: 1.232 },
      { type: 'event', eventId: 'yggdrasil_golden_spring' },
      { type: 'battle', enemyId: 'runic_hollow', enemyStatScale: 1.232 },
      { type: 'battle', enemyId: 'amber_crystal_idol', enemyStatScale: 1.232 },
      { type: 'battle', enemyId: 'silicified_wraith', enemyStatScale: 1.232 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_branch_spear'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 45,
    realm: 1,
    title: '第45層：古樹の結界回廊',
    subtitle: 'フロア最奥に領域の守護ミニボスが立ち塞がる',
    encounters: [
      { type: 'battle', enemyId: 'worldtree_sprout', enemyStatScale: 1.45 },
      { type: 'battle', enemyId: 'rootbound_armor', enemyStatScale: 1.45 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'miniboss', enemyId: 'verdant_archon', enemyStatScale: 1.94 },
    ],
    rewardPool: {
      equipmentIds: ['dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_branch_spear'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 46,
    realm: 1,
    title: '第46層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'silicified_wraith', enemyStatScale: 1.442 },
      { type: 'battle', enemyId: 'abyssal_mycelium', enemyStatScale: 1.442 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'battle', enemyId: 'runic_hollow', enemyStatScale: 1.442 },
      { type: 'battle', enemyId: 'ancient_mask_spirit', enemyStatScale: 1.442 },
    ],
    rewardPool: {
      equipmentIds: ['canopy_seed_cuirass', 'dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_bark_plate', 'worldtree_branch_spear', 'yggdrasil_sap_blade'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 47,
    realm: 1,
    title: '第47層：樹海の迷宮回廊',
    subtitle: '5連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'worldtree_sprout', enemyStatScale: 1.45 },
      { type: 'battle', enemyId: 'rootbound_armor', enemyStatScale: 1.45 },
      { type: 'event', eventId: 'canopy_seed_stele' },
      { type: 'battle', enemyId: 'amber_crystal_idol', enemyStatScale: 1.45 },
      { type: 'battle', enemyId: 'chasm_moss_core', enemyStatScale: 1.45 },
      { type: 'battle', enemyId: 'silicified_wraith', enemyStatScale: 1.45 },
    ],
    rewardPool: {
      equipmentIds: ['canopy_seed_cuirass', 'dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_bark_plate', 'worldtree_branch_spear', 'yggdrasil_sap_blade'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 48,
    realm: 1,
    title: '第48層：樹海の迷宮回廊',
    subtitle: '3連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'ancient_mask_spirit', enemyStatScale: 1.401 },
      { type: 'event', eventId: 'yggdrasil_golden_spring' },
      { type: 'battle', enemyId: 'chasm_moss_core', enemyStatScale: 1.401 },
      { type: 'battle', enemyId: 'runic_hollow', enemyStatScale: 1.401 },
    ],
    rewardPool: {
      equipmentIds: ['canopy_seed_cuirass', 'dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_bark_plate', 'worldtree_branch_spear', 'yggdrasil_sap_blade'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 49,
    realm: 1,
    title: '第49層：樹海の迷宮回廊',
    subtitle: '4連戦と1つの邂逅が待つ樹海エリア',
    encounters: [
      { type: 'battle', enemyId: 'abyssal_mycelium', enemyStatScale: 1.185 },
      { type: 'battle', enemyId: 'rootbound_armor', enemyStatScale: 1.185 },
      { type: 'event', eventId: 'worldtree_sap_altar' },
      { type: 'battle', enemyId: 'amber_crystal_idol', enemyStatScale: 1.185 },
      { type: 'battle', enemyId: 'worldtree_sprout', enemyStatScale: 1.185 },
    ],
    rewardPool: {
      equipmentIds: ['canopy_seed_cuirass', 'dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_bark_plate', 'worldtree_branch_spear', 'yggdrasil_sap_blade'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
  {
    floor: 50,
    realm: 1,
    title: '第50層：世界樹の頂・神域',
    subtitle: '領域裁定者「始原の世界樹・ユグドラ」が待ち受ける最終試練',
    encounters: [
      { type: 'battle', enemyId: 'rootbound_armor', enemyStatScale: 1.201 },
      { type: 'event', eventId: 'sanctuary_campfire' },
      { type: 'apex_boss', enemyId: 'primordial_treant', enemyStatScale: 0.697 },
    ],
    rewardPool: {
      equipmentIds: ['canopy_seed_cuirass', 'dewdrinker_rapier', 'elder_root_brigandine', 'hollow_bough_blade', 'ironwood_plate', 'mirror_lotus_blade', 'moss_stone_cuirass', 'oathbound_plate', 'rootstone_mace', 'thorn_halberd', 'worldtree_bark_plate', 'worldtree_branch_spear', 'yggdrasil_sap_blade'],
      skillIds: ['amber_sap_surge', 'ancient_root_bind', 'bog_venom_strike', 'hollow_spring_blessing', 'lichen_ember_strike', 'moss_stone_bastion', 'power_slash', 'root_breaker_smash', 'root_crush_break', 'seed_of_bastion', 'war_cry', 'worldtree_seed_ward', 'worldtree_spore_sting', 'yggdrasil_canopy_cleave'],
      utilityIds: ['berserker_idol_relic', 'canopy_crown_relic', 'rootstone_ember_seal_relic', 'worldtree_seed_heart_relic'],
      consumableIds: ['ambrosia_flask', 'canopy_seed_balm', 'root_marrow_draught', 'worldtree_nectar'],
    },
  },
];
