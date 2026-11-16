import { FloorDefinition } from './realm_01_greenwood';

/**
 * Floors in this file are AUTHORED DATA.
 * Daily floors are added or changed by editing entries below — never by
 * procedural generation. Composition rules (Spec §5.2) are enforced by
 * tests/floor_structure.test.ts.
 */

export const REALM_03_FLOORS: FloorDefinition[] = [
  {
    floor: 51,
    realm: 2,
    title: '第51層：星なき書架の序章',
    subtitle: '静寂に沈む禁書庫への入口',
    encounters: [
      { type: 'battle', enemyId: 'living_tome', enemyStatScale: 1.05 },
      { type: 'battle', enemyId: 'ink_phantom', enemyStatScale: 1.05 },
      { type: 'event', eventId: 'apprentice_desk' },
      { type: 'battle', enemyId: 'brass_astrolabe', enemyStatScale: 1.05 },
      { type: 'battle', enemyIds: ['living_tome', 'ink_phantom'], enemyStatScale: 1.05 },
    ],
    rewardPool: {
      equipmentIds: ['stargazer_silver_sword', 'librarian_robe'],
      skillIds: ['chrono_flip', 'flame_wave', 'frost_lance', 'aegis_stance'],
      utilityIds: [
        'bookmark_charm_relic',
        'vampiric_fang_relic',
        'guardian_crest_relic',
        'berserker_idol_relic',
        'venom_gland_relic',
        'golden_compass_relic',
      ],
    },
  },
  {
    floor: 52,
    realm: 2,
    title: '第52層：彷徨える目録の回廊',
    subtitle: '宙を漂う羊皮紙の群れと時を刻む天球儀が侵入者を拒む、虚空の図書回廊',
    encounters: [
      { type: 'battle', enemyId: 'living_tome', enemyStatScale: 0.80 },
      { type: 'battle', enemyId: 'chronos_moth', enemyStatScale: 0.80 },
      { type: 'event', eventId: 'catalog_pedestal' },
      { type: 'battle', enemyIds: ['living_tome', 'ink_phantom'], enemyStatScale: 0.80 },
      { type: 'battle', enemyIds: ['chronos_moth', 'brass_astrolabe'], enemyStatScale: 0.80 },
    ],
    rewardPool: {
      equipmentIds: ['astral_quill', 'stargazer_silver_sword', 'librarian_robe'],
      skillIds: ['ink_burst', 'chrono_flip', 'flame_wave', 'frost_lance', 'aegis_stance'],
      utilityIds: [
        'guardian_crest_relic',
        'bookmark_charm_relic',
        'vampiric_fang_relic',
        'berserker_idol_relic',
        'venom_gland_relic',
        'golden_compass_relic',
      ],
    },
  },
  {
    floor: 53,
    realm: 2,
    title: '第53層：星図の閲覧室',
    subtitle: '宙に浮かぶ星図の合間に虚空の筆記者が潜み、旅人に束の間の休息をもたらす静寂の間',
    encounters: [
      { type: 'battle', enemyId: 'void_scribe', enemyStatScale: 0.82 },
      { type: 'battle', enemyIds: ['ink_phantom', 'chronos_moth'], enemyStatScale: 0.82 },
      { type: 'event', eventId: 'silent_alcove' },
      { type: 'battle', enemyIds: ['void_scribe', 'brass_astrolabe'], enemyStatScale: 0.82 },
      { type: 'battle', enemyIds: ['living_tome', 'ink_phantom'], enemyStatScale: 0.82 },
    ],
    rewardPool: {
      equipmentIds: ['starlight_robe', 'astral_quill', 'stargazer_silver_sword', 'librarian_robe'],
      skillIds: ['arcane_ward', 'ink_burst', 'chrono_flip', 'flame_wave', 'frost_lance', 'aegis_stance'],
      utilityIds: [
        'guardian_crest_relic',
        'bookmark_charm_relic',
        'vampiric_fang_relic',
        'berserker_idol_relic',
        'venom_gland_relic',
        'golden_compass_relic',
      ],
    },
  },
  {
    floor: 54,
    realm: 2,
    title: '第54層：星影の写字廊',
    subtitle: '音もなく滑空する星影のフクロウが、古の写字室へと続く書架の回廊を監視している',
    encounters: [
      { type: 'battle', enemyId: 'astral_owl', enemyStatScale: 0.75 },
      { type: 'battle', enemyIds: ['void_scribe', 'chronos_moth'], enemyStatScale: 0.75 },
      { type: 'event', eventId: 'forgotten_scriptorium' },
      { type: 'battle', enemyIds: ['astral_owl', 'brass_astrolabe'], enemyStatScale: 0.75 },
      { type: 'battle', enemyIds: ['void_scribe', 'astral_owl'], enemyStatScale: 0.75 },
    ],
    rewardPool: {
      equipmentIds: ['starlight_robe', 'astral_quill', 'stargazer_silver_sword', 'librarian_robe'],
      skillIds: ['star_rend', 'arcane_ward', 'ink_burst', 'chrono_flip', 'flame_wave', 'frost_lance', 'aegis_stance'],
      utilityIds: [
        'guardian_crest_relic',
        'bookmark_charm_relic',
        'vampiric_fang_relic',
        'berserker_idol_relic',
        'venom_gland_relic',
        'golden_compass_relic',
      ],
    },
  },
  {
    floor: 55,
    realm: 2,
    title: '第55層：禁書庫の封印門',
    subtitle: '虚空の図書館の中層へと続く重厚な扉の前に、巨大な甲冑の番人が立ち塞がる',
    encounters: [
      { type: 'battle', enemyId: 'chronos_moth', enemyStatScale: 0.80 },
      { type: 'event', eventId: 'catalog_pedestal' },
      { type: 'battle', enemyIds: ['brass_astrolabe', 'astral_owl'], enemyStatScale: 0.80 },
      { type: 'miniboss', enemyId: 'tome_warden', enemyStatScale: 1.05 },
    ],
    rewardPool: {
      equipmentIds: ['starlight_robe', 'astral_quill', 'stargazer_silver_sword', 'librarian_robe'],
      skillIds: ['void_spark', 'star_rend', 'arcane_ward', 'ink_burst', 'chrono_flip', 'flame_wave', 'frost_lance', 'aegis_stance'],
      utilityIds: [
        'guardian_crest_relic',
        'bookmark_charm_relic',
        'vampiric_fang_relic',
        'berserker_idol_relic',
        'venom_gland_relic',
        'golden_compass_relic',
      ],
      consumableIds: ['chronos_hourglass'],
    },
  },
  {
    floor: 56,
    realm: 2,
    title: '第56層：硝子鏡の書庫',
    subtitle: '結晶化した硝子の番兵が巡回し、虚空の光を屈折させながら中層への侵入者を阻む階層',
    encounters: [
      { type: 'battle', enemyId: 'glass_sentinel', enemyStatScale: 0.75 },
      { type: 'battle', enemyIds: ['void_scribe', 'glass_sentinel'], enemyStatScale: 0.75 },
      { type: 'event', eventId: 'catalog_pedestal' },
      { type: 'battle', enemyIds: ['astral_owl', 'glass_sentinel'], enemyStatScale: 0.75 },
    ],
    rewardPool: {
      equipmentIds: ['starlight_robe', 'astral_quill', 'stargazer_silver_sword', 'librarian_robe'],
      skillIds: ['void_barrier', 'void_spark', 'star_rend', 'arcane_ward', 'ink_burst', 'chrono_flip', 'flame_wave', 'frost_lance', 'aegis_stance'],
      utilityIds: [
        'guardian_crest_relic',
        'bookmark_charm_relic',
        'vampiric_fang_relic',
        'berserker_idol_relic',
        'venom_gland_relic',
        'golden_compass_relic',
      ],
    },
  },
  {
    floor: 57,
    realm: 2,
    title: '第57層：羊皮紙の吹き溜まり',
    subtitle: '剥がれ落ちた禁書の頁が渦を巻き、古の知識の残滓が亡霊となって漂う回廊',
    encounters: [
      { type: 'battle', enemyId: 'parchment_wraith', enemyStatScale: 0.60 },
      { type: 'battle', enemyIds: ['glass_sentinel', 'parchment_wraith'], enemyStatScale: 0.60 },
      { type: 'event', eventId: 'forgotten_scriptorium' },
      { type: 'battle', enemyIds: ['parchment_wraith', 'parchment_wraith'], enemyStatScale: 0.60 },
      { type: 'battle', enemyId: 'parchment_wraith', enemyStatScale: 0.60 },
    ],
  },
];
