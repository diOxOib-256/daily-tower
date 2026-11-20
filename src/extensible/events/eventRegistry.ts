import { GameEventDefinition } from './types';

export const EVENT_REGISTRY: Record<string, GameEventDefinition> = {
  sanctuary_campfire: {
    id: 'sanctuary_campfire',
    title: '微睡みの篝火',
    category: 'rest',
    isRestEvent: true,
    description:
      '静かな空洞に蒼い篝火が揺れている。ここでは敵の気配はなく、傷を癒やすか、秘薬の力を充填することができる。',
    speakerSpriteId: 'shrine',
    palette: 'golden_shrine',
    options: [
      {
        id: 'rest_heal',
        label: '篝火のそばで休息する（HP 50%回復）',
        description: '最大HPの50%を回復する。',
        outcome: {
          healHpPercent: 50,
          logMessage: '篝火の温もりに包まれ、HPが50%回復した！',
        },
      },
      {
        id: 'rest_refill',
        label: '霊薬の器に魔力を注ぐ（秘薬 +1回分）',
        description: '秘薬の使用回数を 1 補充する。',
        outcome: {
          refillConsumable: 1,
          logMessage: '篝火の魔力を器に集め、秘薬を 1回分 補充した！',
        },
      },
    ],
  },

  emerald_spring: {
    id: 'emerald_spring',
    title: '翠玉の湧水',
    category: 'shrine',
    description:
      '樹海の奥深くで、魔力を帯びた湧水が滾々と溢れている。水底には古の冒険者が残した金貨も光っている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_spring',
        label: '湧水を飲む（HP 35%回復）',
        description: '清らかな水で傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '清涼な湧水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_coins',
        label: '水底の金貨を拾う（+7 G）',
        description: '濡れるのを厭わず金貨を回収する。',
        outcome: {
          grantGold: 7,
          logMessage: '水底から輝く金貨を拾い上げ、7 G を手に入れた！',
        },
      },
    ],
  },

  crimson_pact_altar: {
    id: 'crimson_pact_altar',
    title: '紅の契約祭壇',
    category: 'shrine',
    description:
      '「血か黄金を捧げよ。さすれば汝に新たな武具か秘術を授けん」――古びた石碑に文字が浮かび上がっている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'blood_for_relic',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '紅の祭壇に生命力を捧げ、古代のレリックを授かった！',
        },
      },
      {
        id: 'gold_for_skill',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を奉納し、新たな秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '黄金が光へと変わり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'respectful_prayer',
        label: '静かに一礼し、供え分けを受け取る（8G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 8,
          logMessage: '供え分けとして8Gを受け取った。',
        },
      },
    ],
  },

  wandering_blacksmith: {
    id: 'wandering_blacksmith',
    title: '彷徨う鍛冶師の工房',
    category: 'forge',
    description:
      '塔の狭間で槌を振るう老鍛冶師と出会った。「いい目をしているな。金貨があれば良い武具を譲ってやろう」',
    speakerSpriteId: 'hero_knight',
    palette: 'steel_knight',
    options: [
      {
        id: 'buy_weapon',
        label: '業物の武器を購入する（武器獲得）',
        description: '代金を支払い、より強力な武器を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'weapon',
          logMessage: '老鍛冶師から鍛え抜かれた武器を受け取った！',
        },
      },
      {
        id: 'buy_armor',
        label: '堅牢な防具を購入する（防具獲得）',
        description: '代金を支払い、より堅牢な防具を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'armor',
          logMessage: '老鍛冶師から重厚な防具を受け取った！',
        },
      },
      {
        id: 'assist_bellows',
        label: 'ふいご作業を手伝う（+25 G）',
        description: '鍛冶作業を手伝い、手間賃を受け取る。',
        outcome: {
          grantGold: 25,
          logMessage: '鍛冶師の作業を手伝い、礼として 25 G を受け取った！',
        },
      },
    ],
  },

  starlight_archive: {
    id: 'starlight_archive',
    title: '星光の碑文',
    category: 'lore',
    description:
      '塔の歴史を記した光の碑文が宙に浮いている。文字を読み解けば戦いの知恵が身につくという。',
    speakerSpriteId: 'hero_mage',
    palette: 'astral_mage',
    options: [
      {
        id: 'decipher_tactics',
        label: '戦術の章を解読する（HP 15%消費 ➔ スキル習得）',
        description: '集中力を極限まで使い（HP15%消費）、秘伝の技を習得する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '碑文の奥義を解読し、新たなスキルを習得した！',
        },
      },
      {
        id: 'meditate_under_light',
        label: '先人の置き土産を探す（8G）',
        description: 'かつての探求者が残した硬貨が、片隅に積まれていた。',
        outcome: {
          grantGold: 8,
          logMessage: '置き土産の硬貨を8G分見つけた。',
        },
      },
    ],
  },

  apprentice_desk: {
    id: 'apprentice_desk',
    title: '司書の見習いの机',
    category: 'lore',
    description:
      '静まり返った書架の片隅に、見習い司書が使っていた机が残されている。書きかけの羊皮紙と散らばった銀貨、そして魔力を帯びたインク壺が置かれている。',
    speakerSpriteId: 'tome',
    palette: 'arcane_tome',
    options: [
      {
        id: 'collect_silver',
        label: '散らばった銀貨を整理して受け取る',
        description: '机の上の銀貨を拾い集める（+25 G）。',
        outcome: {
          grantGold: 15,
          logMessage: '机の上に散らばっていた銀貨を整理し、15 G を受け取った！',
        },
      },
      {
        id: 'transcribe_forbidden_margin',
        label: '指先をインクに浸し、禁書の余白を書き写す',
        description: '最大HPの12%を代償に、秘術の知識を書き写し銀貨も回収する（スキル習得 + 15 G）。',
        cost: {
          hpPercent: 12,
        },
        outcome: {
          grantItemType: 'skill',
          grantGold: 15,
          logMessage: '魔力のインクに生命力を吸われつつも、禁書の術式を書き写し新たなスキルと 15 G を得た！',
        },
      },
      {
        id: 'close_page_and_leave',
        label: '静かにページを閉じて立ち去る',
        description: '深追いをせず、静寂の中で一息つく（HP 10%回復）。',
        outcome: {
          grantGold: 10,
          logMessage: 'ページを閉じた拍子に、栞代わりの硬貨が10G落ちてきた。',
        },
      },
    ],
  },

  catalog_pedestal: {
    id: 'catalog_pedestal',
    title: '目録の台座',
    category: 'shrine',
    description:
      '回廊の中央に、青く発光する水晶が埋め込まれた石造りの目録台座が佇んでいる。触れると古代文字の索引が虚空に浮かび上がる。',
    speakerSpriteId: 'tome',
    palette: 'arcane_tome',
    options: [
      {
        id: 'take_safe_call_number',
        label: '安全な索書票を抜き取る',
        description: '保守的な記録を選び取り、即座に換金可能な価値を得る（+20 G）。',
        outcome: {
          grantGold: 10,
          logMessage: '安全な索書票を抜き取り、10 G を得た！',
        },
      },
      {
        id: 'infuse_forbidden_index',
        label: '禁書の索引に生気を注ぐ',
        description: '最大HPの15%を代償に、秘匿された装備の記録を具現化する（防具獲得 + 10 G）。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'armor',
          grantGold: 10,
          logMessage: '禁書の索引に生気を注ぎ、防具の記録を具現化して 10 G を得た！',
        },
      },
    ],
  },

  silent_alcove: {
    id: 'silent_alcove',
    title: '星灯りの小部屋',
    category: 'rest',
    isRestEvent: true,
    description:
      '閲覧室の片隅に、柔らかな星明かりが灯る小さな休憩所を見つけた。魔力の残滓が傷を癒やし、携行品を整える時間を与えてくれる。',
    speakerSpriteId: 'tome',
    palette: 'arcane_tome',
    options: [
      {
        id: 'silent_rest',
        label: '星灯りの下で休息する（HP 50%回復）',
        description: '静寂の中で呼吸を整え、体力を大きく回復する。',
        outcome: {
          healHpPercent: 50,
          logMessage: '星灯りの下で休息し、HPが50%回復した！',
        },
      },
      {
        id: 'silent_refill',
        label: '魔導インクの瓶を補充する（秘薬 +1回分）',
        description: '机に残された純粋な魔導インクを移し替え、消耗品の使用回数を1回分補充する。',
        outcome: {
          refillConsumable: 1,
          logMessage: '魔導インクの瓶を補充し、秘薬を 1回分 補充した！',
        },
      },
    ],
  },

  mossy_stump_shrine: {
    id: 'mossy_stump_shrine',
    title: '苔むした切り株の祠',
    category: 'shrine',
    description:
      '樹海の小道に、古い大樹の切り株をくり抜いた小さな祠が佇んでいる。木肌のくぼみには、森の精霊への捧げ物を求める文字が刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'ancient_bark',
    options: [
      {
        id: 'offer_vitality_to_stump',
        label: '森の精霊に血の契りを捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、切り株の奥に納められた森のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '切り株の祠に生命力を捧げ、森の精霊から古のレリックを授かった！',
        },
      },
      {
        id: 'offer_gold_to_stump',
        label: '旅の金貨を祠に納める（スキル習得）',
        description: '黄金を納め、木霊が囁く森の戦闘術を習得する。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '木霊の囁きが風に乗って響き、新たなスキルの極意を習得した！',
        },
      },
      {
        id: 'rest_by_stump',
        label: '静かに一礼し、供え分けを受け取る（8G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 8,
          logMessage: '供え分けとして8Gを受け取った。',
        },
      },
    ],
  },

  carved_worldtree_bark: {
    id: 'carved_worldtree_bark',
    title: '古樹の刻み文',
    category: 'lore',
    description:
      '巨木の幹に、かつて樹海を踏破した先人たちの戦術図と狩りの心得が深く刻み込まれている。読み解けば新たな技が身につくかもしれない。',
    speakerSpriteId: 'treant',
    palette: 'ancient_bark',
    options: [
      {
        id: 'trace_carved_tactics',
        label: '幹の刻み文を指で辿り読み解く（HP 15%消費 ➔ スキル習得）',
        description: '樹皮の魔力に集中力を削られつつも（HP15%消費）、先人の秘術を習得する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '古樹に刻まれた狩人の技を読み解き、新たなスキルを習得した！',
        },
      },
      {
        id: 'breathe_forest_air',
        label: '先人の置き土産を探す（8G）',
        description: 'かつての探求者が残した硬貨が、片隅に積まれていた。',
        outcome: {
          grantGold: 8,
          logMessage: '置き土産の硬貨を8G分見つけた。',
        },
      },
    ],
  },

  misty_totem_stone: {
    id: 'misty_totem_stone',
    title: '霧深き古樹の石碑',
    category: 'lore',
    description:
      '濃霧に包まれた古木の根元に、苔むした石碑が静かに佇んでいる。霧の合間に浮かび上がる古代文字には、森を生き抜く戦技が記されているようだ。',
    speakerSpriteId: 'treant',
    palette: 'ancient_bark',
    options: [
      {
        id: 'decipher_mist_tactics',
        label: '霧の戦技を解読する（HP 15%消費 ➔ スキル習得）',
        description: '集中力を極限まで使い（HP15%消費）、古樹林の秘伝技を習得する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '霧に浮かぶ石碑の奥義を解読し、新たなスキルを習得した！',
        },
      },
      {
        id: 'rest_in_silent_mist',
        label: '先人の置き土産を探す（8G）',
        description: 'かつての探求者が残した硬貨が、片隅に積まれていた。',
        outcome: {
          grantGold: 8,
          logMessage: '置き土産の硬貨を8G分見つけた。',
        },
      },
    ],
  },

  foggy_hollow_spring: {
    id: 'foggy_hollow_spring',
    title: '霧隠れの古泉',
    category: 'shrine',
    description:
      '古木のうろの奥、白い霧が立ち込める静かな泉を見つけた。澄み切った水面の底には、かつての探索者が落とした金貨が淡く光っている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_foggy_spring',
        label: '古泉の水を掬って飲む（HP 35%回復）',
        description: '冷たく清らかな泉の水で傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '霧隠れの古泉を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'gather_sunken_coins',
        label: '水底の金貨を拾い集める（+7 G）',
        description: '冷たい水に手を伸ばし、沈んだ金貨を回収する。',
        outcome: {
          grantGold: 7,
          logMessage: '古泉の底から輝く金貨を拾い上げ、7 G を手に入れた！',
        },
      },
    ],
  },

  marsh_reed_shrine: {
    id: 'marsh_reed_shrine',
    title: '葦原の水辺祠',
    category: 'shrine',
    description:
      '背の高い葦に囲まれた湿地の中に、水鏡のように澄んだ石盤の祠が建っている。「命の雫か黄金を捧げよ。さすれば水辺の秘宝か戦技を授けん」と刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'offer_vitality_to_marsh',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、水辺に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '水辺の祠に生命力を捧げ、古代のレリックを授かった！',
        },
      },
      {
        id: 'offer_gold_to_marsh',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を水盤に沈め、沼地を踏破する秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '水盤に沈めた黄金が光の波紋となり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'bow_to_reed_shrine',
        label: '静かに一礼し、供え分けを受け取る（8G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 8,
          logMessage: '供え分けとして8Gを受け取った。',
        },
      },
    ],
  },

  sunken_mirror_stele: {
    id: 'sunken_mirror_stele',
    title: '水鏡の沈み石碑',
    category: 'lore',
    description:
      '浅瀬の水面に、星と葦の紋様が彫られた石碑が半分沈んでいる。水鏡に映る文字を辿れば、湿地を生き抜く戦術の奥義が読み解けそうだ。',
    speakerSpriteId: 'hero_mage',
    palette: 'astral_mage',
    options: [
      {
        id: 'decipher_mirror_tactics',
        label: '水鏡の文字を解読する（HP 15%消費 ➔ スキル習得）',
        description: '集中力を極限まで使い（HP15%消費）、水辺の秘伝技を習得する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '水鏡に映る石碑の奥義を解読し、新たなスキルを習得した！',
        },
      },
      {
        id: 'rest_by_mirror_water',
        label: '先人の置き土産を探す（8G）',
        description: 'かつての探求者が残した硬貨が、片隅に積まれていた。',
        outcome: {
          grantGold: 8,
          logMessage: '置き土産の硬貨を8G分見つけた。',
        },
      },
    ],
  },

  lotus_spring_pool: {
    id: 'lotus_spring_pool',
    title: '睡蓮の湧き水',
    category: 'shrine',
    description:
      '湿地の奥に、大輪の睡蓮が浮かぶ澄んだ湧き水を見つけた。清涼な水が傷を癒やすだけでなく、水底には古の旅人が落とした金貨もきらめいている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_lotus_pool',
        label: '睡蓮の湧水を飲む（HP 35%回復）',
        description: '清らかな水で傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '睡蓮の湧水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_lotus_coins',
        label: '水底の金貨を拾う（+7 G）',
        description: '浅瀬に手を伸ばし、沈んだ金貨を回収する。',
        outcome: {
          grantGold: 7,
          logMessage: '睡蓮の池底から輝く金貨を拾い上げ、7 G を手に入れた！',
        },
      },
    ],
  },

  mossy_ruin_tablet: {
    id: 'mossy_ruin_tablet',
    title: '苔石遺跡の古碑',
    category: 'lore',
    description:
      '古樹の根に抱かれた遺跡の奥で、苔に覆われた石碑を見つけた。刻まれた古代文字には、樹洞と根の回廊を生き抜くための戦技が記されているようだ。',
    speakerSpriteId: 'treant',
    palette: 'ancient_bark',
    options: [
      {
        id: 'decipher_ruin_tactics',
        label: '苔石の戦技を解読する（HP 15%消費 ➔ スキル習得）',
        description: '集中力を極限まで使い（HP15%消費）、古樹遺跡の秘伝技を習得する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '苔石の古碑に刻まれた奥義を解読し、新たなスキルを習得した！',
        },
      },
      {
        id: 'rest_by_ruin_tablet',
        label: '先人の置き土産を探す（8G）',
        description: 'かつての探求者が残した硬貨が、片隅に積まれていた。',
        outcome: {
          grantGold: 8,
          logMessage: '置き土産の硬貨を8G分見つけた。',
        },
      },
    ],
  },

  hollow_root_basin: {
    id: 'hollow_root_basin',
    title: '樹洞の石盤泉',
    category: 'shrine',
    description:
      '太い古根が組み合わさってできた樹洞の中に、苔石の盤へ澄んだ雫が滴り落ちる泉がある。底にはかつての探索者が残した金貨も淡く光っている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_hollow_basin',
        label: '石盤の雫を飲む（HP 35%回復）',
        description: '清らかな雫で傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '樹洞の清らかな雫を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_hollow_coins',
        label: '石盤の底の金貨を拾う（+7 G）',
        description: '冷たい水に手を伸ばし、沈んだ金貨を回収する。',
        outcome: {
          grantGold: 7,
          logMessage: '石盤泉の底から輝く金貨を拾い上げ、7 G を手に入れた！',
        },
      },
    ],
  },

  ancient_root_altar: {
    id: 'ancient_root_altar',
    title: '古根の石祭壇',
    category: 'shrine',
    description:
      '古樹の根が石柱を貫く祭壇が佇んでいる。「命の鼓動か黄金を捧げよ。さすれば樹洞に眠る秘宝か戦技を授けん」と苔石に刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'offer_vitality_to_roots',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、古樹の根に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '古根の祭壇に生命力を捧げ、古代のレリックを授かった！',
        },
      },
      {
        id: 'offer_gold_to_roots',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を石皿に納め、樹洞の遺跡を踏破する秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '石皿に納めた黄金が緑光へと変わり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'bow_to_root_altar',
        label: '静かに一礼し、供え分けを受け取る（8G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 8,
          logMessage: '供え分けとして8Gを受け取った。',
        },
      },
    ],
  },

  worldtree_sap_altar: {
    id: 'worldtree_sap_altar',
    title: '世界樹液の契約祭壇',
    category: 'shrine',
    description:
      '黄金の樹液が脈打つ世界樹の根元に、古代の祭壇が鎮座している。「命の鼓動か黄金を捧げよ。さすれば樹冠に伝わる秘宝か秘術を授けん」と刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'offer_vitality_to_worldtree',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、世界樹の根に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '世界樹の祭壇に生命力を捧げ、古代のレリックを授かった！',
        },
      },
      {
        id: 'offer_gold_to_worldtree',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を樹液の器に納め、新たな秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '黄金の樹液が光へと変わり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'bow_to_worldtree_altar',
        label: '静かに一礼し、供え分けを受け取る（8G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 8,
          logMessage: '供え分けとして8Gを受け取った。',
        },
      },
    ],
  },

  canopy_seed_stele: {
    id: 'canopy_seed_stele',
    title: '樹冠種子の碑文',
    category: 'lore',
    description:
      '天を突く世界樹の枝葉の合間に、光の種子を象った石碑が浮かんでいる。刻まれた古代文字を読み解けば、神域を生き抜く戦いの知恵が身につくという。',
    speakerSpriteId: 'hero_mage',
    palette: 'astral_mage',
    options: [
      {
        id: 'decipher_canopy_tactics',
        label: '種子の戦技を解読する（HP 15%消費 ➔ スキル習得）',
        description: '集中力を極限まで使い（HP15%消費）、秘伝の技を習得する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '樹冠の碑文に記された奥義を解読し、新たなスキルを習得した！',
        },
      },
      {
        id: 'meditate_under_canopy',
        label: '先人の置き土産を探す（8G）',
        description: 'かつての探求者が残した硬貨が、片隅に積まれていた。',
        outcome: {
          grantGold: 8,
          logMessage: '置き土産の硬貨を8G分見つけた。',
        },
      },
    ],
  },

  yggdrasil_golden_spring: {
    id: 'yggdrasil_golden_spring',
    title: '世界樹の黄金泉',
    category: 'shrine',
    description:
      '巨樹の幹が抱く神域の泉から、樹液を溶かした黄金の湧水が滾々と溢れている。水底にはかつて頂を目指した冒険者の金貨もきらめいている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_yggdrasil_spring',
        label: '黄金泉の水を飲む（HP 35%回復）',
        description: '清らかな樹液の泉で傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '黄金泉の霊水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_yggdrasil_coins',
        label: '水底の金貨を拾う（+7 G）',
        description: '濡れるのを厭わず金貨を回収する。',
        outcome: {
          grantGold: 7,
          logMessage: '黄金泉の底から輝く金貨を拾い上げ、7 G を手に入れた！',
        },
      },
    ],
  },

  twilight_anvil_forge: {
    id: 'twilight_anvil_forge',
    title: '黄昏の金床鍛冶場',
    category: 'forge',
    description:
      '製鉄所の入口に据えられた巨大な金床の前で、煤にまみれた鍛冶師が赤熱の鉄を打っている。「黄昏の炉は絶えぬ。金貨を出すなら、業物の武具を譲ってやろう」',
    speakerSpriteId: 'hero_knight',
    palette: 'steel_knight',
    options: [
      {
        id: 'buy_forge_weapon',
        label: '炉鍛えの武器を購入する（武器獲得）',
        description: '代金を支払い、鍛冶場で打ち上げられた武器を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'weapon',
          logMessage: '金床の鍛冶師から炉熱を帯びた業物の武器を受け取った！',
        },
      },
      {
        id: 'buy_forge_armor',
        label: '厚鉄の防具を購入する（防具獲得）',
        description: '代金を支払い、鍛冶場で叩き締めた堅牢な防具を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'armor',
          logMessage: '金床の鍛冶師から煤鉄の重厚な防具を受け取った！',
        },
      },
      {
        id: 'assist_forge_bellows',
        label: '炉のふいごを手伝う（+25 G）',
        description: '炉に風を送り火力を保ち、手間賃を受け取る。',
        outcome: {
          grantGold: 25,
          logMessage: '炉のふいご作業を手伝い、礼として 25 G を受け取った！',
        },
      },
    ],
  },

  twilight_slag_spring: {
    id: 'twilight_slag_spring',
    title: '鍛冶場の冷却水槽',
    category: 'shrine',
    description:
      '製鉄所の片隅に、焼き入れ用の澄んだ地下水が湛えられた石槽がある。冷気を含んだ水面は熱気を和らげ、底には古い金貨が沈んでいる。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_cooling_water',
        label: '清涼な湧水を飲む（HP 35%回復）',
        description: '冷たい水で渇きを癒やし、煤と疲労を洗い流す。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '冷却槽の澄んだ湧水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_slag_coins',
        label: '槽の底の金貨を拾う（+15 G）',
        description: '底に沈んだ金貨を素早く掬い上げる。',
        outcome: {
          grantGold: 15,
          logMessage: '水槽の底から輝く金貨を拾い上げ、15 G を手に入れた！',
        },
      },
    ],
  },

  molten_pact_crucible: {
    id: 'molten_pact_crucible',
    title: '溶鉄の契約坩堝',
    category: 'shrine',
    description:
      '溶岩流が注ぎ込む鋳造ラインの傍らに、赤熱した巨大な坩堝が鎮座している。「血か黄金を炉に投じよ。さすれば鋳造の秘宝か戦技を授けん」と炉壁に刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'blood_for_crucible_relic',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、坩堝の底に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '溶鉄の坩堝に生命力を捧げ、灼熱の鍛造レリックを授かった！',
        },
      },
      {
        id: 'gold_for_crucible_skill',
        label: '黄金を投じる（スキル習得）',
        description: '黄金を坩堝に投じ、鋳造ラインの秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '溶けた黄金が蒸気の閃光となり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'respectful_crucible_bow',
        label: '静かに一礼し、供え分けを受け取る（15G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 15,
          logMessage: '供え分けとして15Gを受け取った。',
        },
      },
    ],
  },

  steam_condenser_basin: {
    id: 'steam_condenser_basin',
    title: '蒸気凝縮の冷却泉',
    category: 'shrine',
    description:
      '鋳造ラインの配管から立ち昇る蒸気が、冷たい岩盤に触れて澄んだ水盤を作っている。水底にはかつて炉を守った鍛冶師たちの金貨が沈んでいる。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_condenser_water',
        label: '凝縮水を飲む（HP 35%回復）',
        description: '清涼な蒸留水で喉を潤し、傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '冷却泉の清らかな水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_basin_coins',
        label: '水底の金貨を拾う（+15 G）',
        description: '水盤の底に沈んだ金貨を素早く回収する。',
        outcome: {
          grantGold: 15,
          logMessage: '水盤の底から輝く金貨を拾い上げ、15 G を手に入れた！',
        },
      },
    ],
  },

  obsidian_tunnel_forge: {
    id: 'obsidian_tunnel_forge',
    title: '黒曜坑道の野鍛冶場',
    category: 'forge',
    description:
      '黒曜石の岩盤をくり抜いた坑道の奥で、灰を被った老鍛冶師が残り火の炉を守っている。「黒曜の刃も灰鉄の鎧も、金貨さえ積めば惜しみなく譲ろう」',
    speakerSpriteId: 'hero_knight',
    palette: 'steel_knight',
    options: [
      {
        id: 'buy_obsidian_weapon',
        label: '黒曜鍛えの武器を購入する（武器獲得）',
        description: '代金を支払い、坑道の残り火で鍛え上げた武器を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'weapon',
          logMessage: '老鍛冶師から黒曜の鋭気を帯びた業物の武器を受け取った！',
        },
      },
      {
        id: 'buy_obsidian_armor',
        label: '灰鉄の重鎧を購入する（防具獲得）',
        description: '代金を支払い、火山灰と黒曜石を打ち合わせた防具を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'armor',
          logMessage: '老鍛冶師から黒曜石の堅牢な防具を受け取った！',
        },
      },
      {
        id: 'assist_ash_bellows',
        label: '残り火の灰掻きを手伝う（+25 G）',
        description: '炉の灰を掻き出して火勢を整え、手間賃を受け取る。',
        outcome: {
          grantGold: 25,
          logMessage: '炉の灰掻きを手伝い、礼として 25 G を受け取った！',
        },
      },
    ],
  },

  ashen_geothermal_spring: {
    id: 'ashen_geothermal_spring',
    title: '灰荒野の温水溜まり',
    category: 'shrine',
    description:
      '灰の荒野に穿たれた黒曜石の窪みに、地中から湧き出した澄んだ湯が湛えられている。湯気立つ水底には、かつての探索者が残した金貨が鈍く光っている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_geothermal_spring',
        label: '澄んだ湧水を飲む（HP 35%回復）',
        description: '温かな湧水で渇きを潤し、傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '温水溜まりの澄んだ水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_ashen_coins',
        label: '水底の金貨を拾う（+15 G）',
        description: '灰の積もった水底から金貨を回収する。',
        outcome: {
          grantGold: 15,
          logMessage: '黒曜の窪みの底から金貨を拾い上げ、15 G を手に入れた！',
        },
      },
    ],
  },

  obsidian_ember_altar: {
    id: 'obsidian_ember_altar',
    title: '黒曜熾火の契約祭壇',
    category: 'shrine',
    description:
      '漆黒の黒曜石を削り出した祭壇の中央で、消えぬ残り火が静かに脈打っている。「命の火か黄金を捧げよ。さすれば黒曜の秘宝か秘術を授けん」と刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'blood_for_obsidian_relic',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、黒曜の祭壇に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '黒曜の祭壇に生命力を捧げ、残り火を宿すレリックを授かった！',
        },
      },
      {
        id: 'gold_for_obsidian_skill',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を灰盤に奉納し、荒野を踏破する秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '黄金が熾火の閃光へと変わり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'bow_to_obsidian_altar',
        label: '静かに一礼し、供え分けを受け取る（15G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 15,
          logMessage: '供え分けとして15Gを受け取った。',
        },
      },
    ],
  },

  steam_boiler_spring: {
    id: 'steam_boiler_spring',
    title: '蒸気釜の冷却水盤',
    category: 'shrine',
    description:
      '巨大な圧力釜の傍らに、凝縮した蒸気が澄んだ水盤を作っている。清涼な水は傷を癒やし、水底には機関技師が残した金貨が沈んでいる。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_boiler_spring',
        label: '冷却水を飲む（HP 35%回復）',
        description: '清らかな蒸留水で渇きを潤し、傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '冷却水盤の澄んだ水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_boiler_coins',
        label: '水底の金貨を拾う（+15 G）',
        description: '水盤の底に沈んだ金貨を素早く回収する。',
        outcome: {
          grantGold: 15,
          logMessage: '冷却水盤の底から金貨を拾い上げ、15 G を手に入れた！',
        },
      },
    ],
  },

  gearwork_pact_furnace: {
    id: 'gearwork_pact_furnace',
    title: '歯車炉心の契約壇',
    category: 'shrine',
    description:
      '噛み合う黄金の歯車が炉心を囲む祭壇が鎮座している。「命の鼓動か黄金を捧げよ。さすれば外殻に眠る秘宝か戦技を授けん」と銘板に刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'blood_for_gearwork_relic',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、歯車炉心の奥に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '歯車炉心の祭壇に生命力を捧げ、機関の秘宝レリックを授かった！',
        },
      },
      {
        id: 'gold_for_gearwork_skill',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を歯車の受け皿に納め、炉心外殻を踏破する秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '黄金の歯車が輝きを放ち、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'bow_to_gearwork_furnace',
        label: '静かに一礼し、供え分けを受け取る（15G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 15,
          logMessage: '供え分けとして15Gを受け取った。',
        },
      },
    ],
  },

  boiler_engineer_forge: {
    id: 'boiler_engineer_forge',
    title: '蒸気機関の整備工房',
    category: 'forge',
    description:
      '圧力配管と歯車が壁を覆う工房で、煤まみれの機関鍛冶師が蒸気槌を振るっている。「炉心外殻に挑むなら、圧力鍛えの武具を持っていけ」',
    speakerSpriteId: 'hero_knight',
    palette: 'steel_knight',
    options: [
      {
        id: 'buy_boiler_weapon',
        label: '蒸気鍛えの武器を購入する（武器獲得）',
        description: '代金を支払い、高圧蒸気槌で鍛え上げた武器を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'weapon',
          logMessage: '機関鍛冶師から蒸気機関の力を宿した業物の武器を受け取った！',
        },
      },
      {
        id: 'buy_boiler_armor',
        label: '圧力外殻の防具を購入する（防具獲得）',
        description: '代金を支払い、炉心外殻用の耐熱重装防具を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'armor',
          logMessage: '機関鍛冶師から重厚な圧力外殻の防具を受け取った！',
        },
      },
      {
        id: 'assist_steam_valves',
        label: '圧力弁の調整を手伝う（+25 G）',
        description: '蒸気配管の圧力弁を調整し、手間賃を受け取る。',
        outcome: {
          grantGold: 25,
          logMessage: '圧力弁の調整作業を手伝い、礼として 25 G を受け取った！',
        },
      },
    ],
  },

  core_crucible_forge: {
    id: 'core_crucible_forge',
    title: '終焉炉心の神鍛冶場',
    category: 'forge',
    description:
      '領域の最深部に据えられた終焉の金床の前で、白熱する鋼を打つ神鍛冶師が待ち構えている。「ここが最後の鍛造場だ。金貨を積むなら、炉心鍛えの武具を譲ろう」',
    speakerSpriteId: 'hero_knight',
    palette: 'steel_knight',
    options: [
      {
        id: 'buy_core_weapon',
        label: '終焉鍛えの武器を購入する（武器獲得）',
        description: '代金を支払い、炉心の業火で鍛え上げた武器を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'weapon',
          logMessage: '神鍛冶師から終焉の炉熱を宿した業物の武器を受け取った！',
        },
      },
      {
        id: 'buy_core_armor',
        label: '炉心鋼の重鎧を購入する（防具獲得）',
        description: '代金を支払い、最終焼入れを施した堅牢な防具を受け取る。',
        cost: {
          gold: 45,
        },
        outcome: {
          grantItemType: 'armor',
          logMessage: '神鍛冶師から終焉炉心の重厚な防具を受け取った！',
        },
      },
      {
        id: 'assist_core_bellows',
        label: '炉心のふいごを手伝う（+25 G）',
        description: '終焉炉に風を送り火力を保ち、手間賃を受け取る。',
        outcome: {
          grantGold: 25,
          logMessage: '炉心のふいご作業を手伝い、礼として 25 G を受け取った！',
        },
      },
    ],
  },

  core_cooling_spring: {
    id: 'core_cooling_spring',
    title: '終焉炉の焼入れ泉',
    category: 'shrine',
    description:
      '炉心の岩盤から湧き出した清冽な地下水が、焼入れ用の澄んだ泉を作っている。水底にはかつて最深部へ挑んだ鍛冶師たちの金貨が輝いている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_core_spring',
        label: '焼入れ泉の水を飲む（HP 35%回復）',
        description: '冷たく澄んだ泉水で渇きを癒やし、傷を癒やす。 泉の守り人への謝礼が必要だ。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '焼入れ泉の澄んだ水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_core_coins',
        label: '水底の金貨を拾う（+15 G）',
        description: '泉の底に沈んだ金貨を素早く回収する。',
        outcome: {
          grantGold: 15,
          logMessage: '焼入れ泉の底から輝く金貨を拾い上げ、15 G を手に入れた！',
        },
      },
    ],
  },

  doomsday_pact_furnace: {
    id: 'doomsday_pact_furnace',
    title: '終焉炉心の契約壇',
    category: 'shrine',
    description:
      '白熱する炉心の真上に、古代の鍛造紋様が刻まれた契約壇が鎮座している。「命の火か黄金を炉に捧げよ。さすれば終焉の秘宝か秘術を授けん」と刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'crimson_knight',
    options: [
      {
        id: 'blood_for_doomsday_relic',
        label: '生命力を捧げる（HP 20%消費 ➔ レリック獲得）',
        description: '最大HPの20%を代償に、終焉炉心に眠る古代のレリックを授かる。',
        cost: {
          hpPercent: 20,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '終焉炉心の契約壇に生命力を捧げ、古代のレリックを授かった！',
        },
      },
      {
        id: 'gold_for_doomsday_skill',
        label: '黄金を捧げる（スキル習得）',
        description: '黄金を炉心に投じ、最終決戦を生き抜く秘伝スキルを得る。',
        cost: {
          gold: 40,
        },
        outcome: {
          grantItemType: 'skill',
          logMessage: '黄金が炉心の閃光へと変わり、新たなスキルの知識が脳裏に刻まれた！',
        },
      },
      {
        id: 'bow_to_doomsday_furnace',
        label: '静かに一礼し、供え分けを受け取る（15G）',
        description: '敬意を示した旅人への、ささやかな分け前が置かれている。',
        outcome: {
          grantGold: 15,
          logMessage: '供え分けとして15Gを受け取った。',
        },
      },
    ],
  },

  forgotten_scriptorium: {
    id: 'forgotten_scriptorium',
    title: '忘れられた写字室',
    category: 'lore',
    description:
      '書架の奥に、埃をかぶった古い写字台が残されている。机の上には封蝋された小瓶と、金箔で装飾された古文書が置かれている。',
    speakerSpriteId: 'tome',
    palette: 'arcane_tome',
    options: [
      {
        id: 'peel_gold_leaf',
        label: '金箔の装飾を丁寧に剥がして回収する',
        description: '古文書を傷つけないよう金箔だけを回収し、確実な資金を得る（+22 G）。',
        outcome: {
          grantGold: 22,
          logMessage: '金箔の装飾を丁寧に剥がし、22 G を得た！',
        },
      },
      {
        id: 'break_starlight_seal',
        label: '封蝋を解き、星明かりのインク瓶を手に入れる',
        description:
          '封印を解く代償として魔力に体力を吸われるが、貴重な携帯用インク瓶を確保する（最大HPの15%を消費し、星明かりのインク瓶を獲得）。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          specificItemId: 'starlight_ink_vial',
          logMessage: '封蝋を解き、星明かりのインク瓶を手に入れた！',
        },
      },
    ],
  },

  verdant_shrine: {
    id: 'verdant_shrine',
    title: '樹海の古祠',
    category: 'shrine',
    description:
      '巨木の根元に、苔むした小さな石造りの祠が佇んでいる。賽銭箱の脇には古びた武具の紋章が刻まれている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'clean_shrine_coins',
        label: '祠の苔を払い、供えられた銀貨を受け取る',
        description: '丁寧に掃除をした礼として、わずかな資金を得る。',
        outcome: {
          grantGold: 8,
          logMessage: '祠の苔を払い、供えられた銀貨（+8 G）を受け取った！',
        },
      },
      {
        id: 'offer_vitality_weapon',
        label: '生気を捧げて古い武具の加護を得る',
        description: '自身の体力を対価に、祠に宿る武器を一つ授かる。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'weapon',
          grantGold: 4,
          logMessage: '生気を捧げ、祠に宿る武器と +4 G を授かった！',
        },
      },
    ],
  },

  wandering_herbalist: {
    id: 'wandering_herbalist',
    title: '森の薬草商',
    category: 'merchant',
    description:
      '大きな背負い籠を抱えた旅の薬草商と出会った。珍しい森の薬草や古い護符を取り扱っているようだ。',
    speakerSpriteId: 'shrine',
    palette: 'golden_shrine',
    options: [
      {
        id: 'sell_herb_pouch',
        label: '薬草の小袋を譲って対価を得る',
        description: '商人が欲しがっていた乾燥薬草を譲り、わずかな金貨を得る。',
        outcome: {
          grantGold: 7,
          logMessage: '乾燥薬草の小袋を譲り、7 G を得た！',
        },
      },
      {
        id: 'buy_herbalist_relic',
        label: '秘蔵の護符を買い取る',
        description: '手持ちの金貨を支払い、商人が見つけた珍しいレリックを購入する。',
        cost: {
          gold: 15,
        },
        outcome: {
          grantItemType: 'relic',
          logMessage: '金貨を支払い、珍しいレリックを買い取った！',
        },
      },
    ],
  },

  sunlit_clearing: {
    id: 'sunlit_clearing',
    title: '木漏れ日の空き地',
    category: 'rest',
    isRestEvent: true,
    description:
      '樹海の奥に、柔らかな木漏れ日が差し込む静かな空き地を見つけた。ここで一息つき、旅支度を整えることができる。',
    speakerSpriteId: 'shrine',
    palette: 'golden_shrine',
    options: [
      {
        id: 'rest_in_shade',
        label: '木陰で深い休息をとる',
        description: '穏やかな光の中で体を休め、体力を大きく回復する。',
        outcome: {
          healHpPercent: 50,
          logMessage: '木陰で深い休息をとり、HPが50%回復した！',
        },
      },
      {
        id: 'refill_consumable_kit',
        label: '携帯用の回復具を補充する',
        description: '荷物を点検し、消耗品チャージを1回分補充する。',
        outcome: {
          refillConsumable: 1,
          logMessage: '旅支度を整え、消耗品チャージを 1回分 補充した！',
        },
      },
    ],
  },

  forest_spring: {
    id: 'forest_spring',
    title: '樹海の湧水',
    category: 'shrine',
    description:
      '清らかな水が湧き出る小さな泉を見つけた。泉の底には旅人たちが投げ入れた硬貨がわずかに光っている。',
    speakerSpriteId: 'shrine',
    palette: 'frost_blue',
    options: [
      {
        id: 'pick_spring_coins',
        label: '泉の縁に落ちた小銭を拾う',
        description: '水を汚さないよう縁に落ちた硬貨だけを拾い集める。',
        outcome: {
          grantGold: 6,
          logMessage: '泉の縁から小銭を拾い集め、6 G を手に入れた！',
        },
      },
      {
        id: 'drink_spring_water',
        label: '金貨を捧げて湧水を飲む',
        description: '泉の精霊に金貨を捧げ、清らかな水で傷を癒やす。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '金貨を捧げて湧水を飲み、HPが35%回復した！',
        },
      },
    ],
  },

  mossy_forge: {
    id: 'mossy_forge',
    title: '苔むした古鍛冶場',
    category: 'forge',
    description:
      '森の中に打ち捨てられた古い鍛冶場の跡。炉の傍らにはまだ使えそうな鉄材や防具の欠片が残っている。',
    speakerSpriteId: 'shrine',
    palette: 'ancient_bark',
    options: [
      {
        id: 'collect_iron_scrap',
        label: '使えそうな鉄屑を集めて換金する',
        description: '傷んでいない金属部品を回収し、手堅く資金にする。',
        outcome: {
          grantGold: 8,
          logMessage: '使えそうな鉄屑を回収し、8 G に換金した！',
        },
      },
      {
        id: 'reforge_ancient_armor',
        label: '生気を注いで古炉の防具を鍛え直す',
        description: '自身の体力を対価に、残されていた防具を一つ修復して入手する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'armor',
          grantGold: 4,
          logMessage: '生気を注いで古炉の防具を鍛え直し、防具と +4 G を手に入れた！',
        },
      },
    ],
  },

  sylvan_basin: {
    id: 'sylvan_basin',
    title: '森の霊泉',
    category: 'shrine',
    description:
      '静かな森の窪地に、淡く光る水が満ちた石造りの泉がある。泉の縁には先人たちが置いた硬貨が並んでいる。',
    speakerSpriteId: 'shrine',
    palette: 'frost_blue',
    options: [
      {
        id: 'pick_basin_coins',
        label: '泉の縁に残された硬貨を拾う',
        description: '水には触れず、縁に落ちている硬貨だけを回収する。',
        outcome: {
          grantGold: 7,
          logMessage: '泉の縁に落ちていた硬貨を回収し、7 G を手に入れた！',
        },
      },
      {
        id: 'drink_basin_water',
        label: '金貨を捧げて霊泉の水を飲む',
        description: '泉に金貨を投げ入れ、清浄な水で体力を癒やす。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '金貨を捧げて霊泉の水を飲み、HPが35%回復した！',
        },
      },
    ],
  },

  hollow_armory: {
    id: 'hollow_armory',
    title: '古樹の武器庫',
    category: 'forge',
    description:
      '巨大な空洞の中に、かつての探索者たちが残した武具や砥石が保管されている。',
    speakerSpriteId: 'shrine',
    palette: 'ancient_bark',
    options: [
      {
        id: 'collect_metal_scraps',
        label: '残された金属片を集めて換金する',
        description: 'まだ価値のある部品だけを選び出し、資金として持ち歩く。',
        outcome: {
          grantGold: 9,
          logMessage: '価値のある金属片を集めて換金し、9 G を手に入れた！',
        },
      },
      {
        id: 'sharpen_ancient_weapon',
        label: '生気を注いで古の武器を研ぎ直す',
        description: '自身の体力を対価に魔力を込め、残されていた武器を一つ入手する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'weapon',
          grantGold: 4,
          logMessage: '生気を注いで古の武器を研ぎ直し、武器と +4 G を手に入れた！',
        },
      },
    ],
  },

  canopy_camp: {
    id: 'canopy_camp',
    title: '緑陰のキャンプ',
    category: 'rest',
    isRestEvent: true,
    description:
      '大きな樹冠が外敵の目を遮る安全な野営地を見つけた。ここで休息をとるか、手持ちの道具を整えることができる。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'rest_under_canopy',
        label: '木陰で深い休息をとる',
        description: '穏やかな空気の中で体を休め、体力を大きく回復する。',
        outcome: {
          healHpPercent: 50,
          logMessage: '木陰で深い休息をとり、HPが50%回復した！',
        },
      },
      {
        id: 'restock_camp_supplies',
        label: '携帯用の回復具を補充する',
        description: '荷物を点検し、消耗品チャージを1回分補充する。',
        outcome: {
          refillConsumable: 1,
          logMessage: '荷物を点検して回復具を整え、消耗品チャージを 1回分 補充した！',
        },
      },
    ],
  },

  amber_spring: {
    id: 'amber_spring',
    title: '琥珀の聖泉',
    category: 'shrine',
    description:
      '樹液が長い年月をかけて澄み渡った、黄金色に輝く小さな泉を見つけた。底には先人たちが捧げた硬貨が沈んでいる。',
    speakerSpriteId: 'shrine',
    palette: 'molten_iron',
    options: [
      {
        id: 'collect_amber_coins',
        label: '泉の縁にこぼれた硬貨を拾う',
        description: '泉の周囲に落ちている硬貨だけを静かに回収する。',
        outcome: {
          grantGold: 8,
          logMessage: '泉の周囲にこぼれていた硬貨を拾い、8 G を手に入れた！',
        },
      },
      {
        id: 'offer_gold_for_amber_water',
        label: '金貨を捧げて黄金の聖水を飲む',
        description: '泉に金貨を捧げ、澄んだ聖水で深い傷を癒やす。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '金貨を捧げて黄金の聖水を飲み、HPが35%回復した！',
        },
      },
    ],
  },

  root_altar: {
    id: 'root_altar',
    title: '根圏の古祭壇',
    category: 'lore',
    description:
      '巨木の根が絡み合ってできた自然の祭壇に、古い時代から遺された護符と金貨が供えられている。',
    speakerSpriteId: 'shrine',
    palette: 'ancient_bark',
    options: [
      {
        id: 'take_altar_offerings',
        label: '供え物の傍らの金貨を譲り受ける',
        description: '祭壇に礼をして、旅の資金として金貨だけを受け取る。',
        outcome: {
          grantGold: 10,
          logMessage: '祭壇に一礼し、供え物の傍らの 10 G を受け取った！',
        },
      },
      {
        id: 'offer_vitality_for_relic',
        label: '生気を捧げて古代の護符を授かる',
        description: '自身の体力を対価に祈りを捧げ、祭壇に宿るレリックを一つ入手する。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'relic',
          grantGold: 4,
          logMessage: '生気を捧げて祈りを捧げ、古代の護符と +4 G を授かった！',
        },
      },
    ],
  },

  root_hollow_camp: {
    id: 'root_hollow_camp',
    title: '根洞の休息地',
    category: 'rest',
    isRestEvent: true,
    description:
      '巨大な木の根がアーチ状に組まれた、雨風も外敵も届かない静かな空洞を見つけた。ここで態勢を立て直すことができる。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'rest_in_root_hollow',
        label: '根洞の奥で深い休息をとる',
        description: '静寂の中で体を休め、体力を大きく回復する。',
        outcome: {
          healHpPercent: 50,
          logMessage: '根洞の奥で深い休息をとり、HPが50%回復した！',
        },
      },
      {
        id: 'refill_root_hollow_supplies',
        label: '携帯用の回復具を補充する',
        description: '荷物を整え、消耗品チャージを1回分補充する。',
        outcome: {
          refillConsumable: 1,
          logMessage: '荷物を整えて回復具を補充し、消耗品チャージを 1回分 回復した！',
        },
      },
    ],
  },

  worldtree_font: {
    id: 'worldtree_font',
    title: '世界樹の霊泉',
    category: 'shrine',
    description:
      '世界樹の太い根の合間に、淡い翠色の光を湛えた神秘的な泉が湧き出ている。泉の縁には先人たちが捧げた金貨が静かに輝いている。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'take_font_coins',
        label: '泉の縁に供えられた金貨を譲り受ける',
        description: '霊泉を乱さぬよう、縁に置かれた金貨だけを謹んで回収する。',
        outcome: {
          grantGold: 9,
          logMessage: '泉の縁に供えられた金貨を譲り受け、9 G を手に入れた！',
        },
      },
      {
        id: 'drink_font_water',
        label: '金貨を捧げて世界樹の霊水を飲む',
        description: '泉に金貨を捧げ、生命力に満ちた霊水で傷を癒やす。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '金貨を捧げて世界樹の霊水を飲み、HPが35%回復した！',
        },
      },
    ],
  },

  elder_reliquary: {
    id: 'elder_reliquary',
    title: '古代樹の宝物庫',
    category: 'lore',
    description:
      '大樹の幹に穿たれた古い宝物庫を見つけた。台座の上には古代の魔力を宿した武具や護符が厳かに安置されている。',
    speakerSpriteId: 'shrine',
    palette: 'ancient_bark',
    options: [
      {
        id: 'take_reliquary_coins',
        label: '台座の傍らの古金貨を回収する',
        description: '武具には触れず、周囲に納められていた資金だけを持ち帰る。',
        outcome: {
          grantGold: 11,
          logMessage: '台座の傍らに納められていた古金貨を回収し、11 G を手に入れた！',
        },
      },
      {
        id: 'inherit_reliquary_weapon',
        label: '生気を捧げて古代の武器を継承する',
        description: '自身の体力を対価に誓いを立て、宝物庫の武器を一つ授かる。',
        cost: {
          hpPercent: 15,
        },
        outcome: {
          grantItemType: 'weapon',
          grantGold: 5,
          logMessage: '生気を捧げて古代の武器を継承し、さらに5 G を手に入れた！',
        },
      },
    ],
  },

  worldtree_sanctuary_camp: {
    id: 'worldtree_sanctuary_camp',
    title: '世界樹の根の野営地',
    category: 'rest',
    isRestEvent: true,
    description:
      '巨大な根が天蓋のように覆う静謐な空間を見つけた。頂上決戦を前に、ここで最後の休息と装備の点検を行うことができる。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'rest_at_sanctuary',
        label: '聖域の静寂の中で深い休息をとる',
        description: '穏やかな霊気に包まれて体を休め、体力を大きく回復する。',
        outcome: {
          healHpPercent: 50,
          logMessage: '聖域の静寂の中で深い休息をとり、HPが50%回復した！',
        },
      },
      {
        id: 'refill_at_sanctuary',
        label: '携帯用の回復具を補充する',
        description: '荷物を点検し、消耗品チャージを1回分補充する。',
        outcome: {
          refillConsumable: 1,
          logMessage: '携帯用の回復具を補充し、消耗品チャージが1回復した！',
        },
      },
    ],
  },
  sun_dapple_market: {
    id: 'sun_dapple_market',
    title: '木漏れ日の露店',
    category: 'merchant',
    description:
      '木漏れ日の広場に、小さな露店が開かれている。旅の商人が秘薬の充填や古い防具を取り扱っている。',
    speakerSpriteId: 'shrine',
    palette: 'golden_shrine',
    options: [
      {
        id: 'buy_refill',
        label: '秘薬の充填を買い取る',
        description: '秘薬の使用回数を 1 補充する。',
        cost: { gold: 25 },
        outcome: {
          refillConsumable: 1,
          logMessage: '金貨を支払い、秘薬を 1回分 補充した！',
        },
      },
      {
        id: 'buy_old_armor',
        label: '古い防具を買い取る（防具獲得）',
        description: '金貨を支払い、防具を受け取る。',
        cost: { gold: 35 },
        outcome: {
          grantItemType: 'armor',
          logMessage: '金貨を支払い、使い込まれた防具を受け取った！',
        },
      },
      {
        id: 'help_carry',
        label: '荷運びを手伝う（+8 G）',
        description: '商人の荷運びを手伝い、礼を受け取る。',
        outcome: {
          grantGold: 8,
          logMessage: '荷運びを手伝い、礼として 8 G を受け取った！',
        },
      },
    ],
  },
  mist_guide: {
    id: 'mist_guide',
    title: '霧の案内人',
    category: 'lore',
    description:
      '霧の中から、古い地図を手にした案内人が現れた。塔の抜け道と、戦いの型を知っているという。',
    speakerSpriteId: 'hero_mage',
    palette: 'astral_mage',
    options: [
      {
        id: 'learn_from_guide',
        label: '礼を払い、戦いの型を授かる（スキル習得）',
        description: '金貨を支払い、スキルを習得する。',
        cost: { gold: 20 },
        outcome: {
          grantItemType: 'skill',
          logMessage: '案内人に礼を払い、新たなスキルの型を授かった！',
        },
      },
      {
        id: 'carry_maps',
        label: '地図の束を運ぶ（+10 G）',
        description: '案内人の地図の束を運び、礼を受け取る。',
        outcome: {
          grantGold: 10,
          logMessage: '地図の束を運び、礼として 10 G を受け取った！',
        },
      },
    ],
  },
  mycelium_exchange: {
    id: 'mycelium_exchange',
    title: '菌糸の交易所',
    category: 'merchant',
    description:
      '巨大な菌糸の網が壁一面を覆い、その結節点に交易所の札が下がっている。胞子の香りが漂う。',
    speakerSpriteId: 'shrine',
    palette: 'ancient_bark',
    options: [
      {
        id: 'buy_mycelium_relic',
        label: '菌糸の護符を買い取る（レリック獲得）',
        description: '金貨を支払い、レリックを受け取る。',
        cost: { gold: 30 },
        outcome: {
          grantItemType: 'relic',
          logMessage: '金貨を支払い、菌糸に守られたレリックを買い取った！',
        },
      },
      {
        id: 'sell_spores',
        label: '集めた胞子を売る（+10 G）',
        description: '道中で集めた胞子を交易所に売る。',
        outcome: {
          grantGold: 10,
          logMessage: '集めた胞子を売り、10 G を得た！',
        },
      },
    ],
  },
  amber_appraiser: {
    id: 'amber_appraiser',
    title: '琥珀の鑑定士',
    category: 'merchant',
    description:
      '琥珀の欠片を並べた鑑定士の小屋。秘薬の充填から掘り出し物の武器まで、値付けは確かだという。',
    speakerSpriteId: 'shrine',
    palette: 'golden_shrine',
    options: [
      {
        id: 'buy_refill',
        label: '秘薬の充填を依頼する',
        description: '秘薬の使用回数を 1 補充する。',
        cost: { gold: 20 },
        outcome: {
          refillConsumable: 1,
          logMessage: '金貨を支払い、秘薬を 1回分 補充した！',
        },
      },
      {
        id: 'buy_dug_weapon',
        label: '掘り出し物の武器を購入する（武器獲得）',
        description: '金貨を支払い、武器を受け取る。',
        cost: { gold: 40 },
        outcome: {
          grantItemType: 'weapon',
          logMessage: '金貨を支払い、掘り出し物の武器を受け取った！',
        },
      },
      {
        id: 'sell_sap_crystal',
        label: '樹液の結晶を買い取ってもらう（+12 G）',
        description: '樹液の結晶を鑑定士に買い取ってもらう。',
        outcome: {
          grantGold: 12,
          logMessage: '樹液の結晶を買い取ってもらい、12 G を得た！',
        },
      },
    ],
  },
  worldtree_pilgrim_merchant: {
    id: 'worldtree_pilgrim_merchant',
    title: '世界樹の巡礼商人',
    category: 'merchant',
    description:
      '世界樹への巡礼路を往く商人が、聖なる品々を広げている。どれも巡礼の加護を帯びているという。',
    speakerSpriteId: 'hero_mage',
    palette: 'astral_mage',
    options: [
      {
        id: 'buy_pilgrim_relic',
        label: '巡礼の護符を買い取る（レリック獲得）',
        description: '金貨を支払い、レリックを受け取る。',
        cost: { gold: 50 },
        outcome: {
          grantItemType: 'relic',
          logMessage: '金貨を支払い、巡礼の護符を買い取った！',
        },
      },
      {
        id: 'buy_old_scripture',
        label: '古い聖典を買い取る（スキル習得）',
        description: '金貨を支払い、聖典に記されたスキルを習得する。',
        cost: { gold: 35 },
        outcome: {
          grantItemType: 'skill',
          logMessage: '金貨を支払い、古い聖典に記されたスキルを習得した！',
        },
      },
      {
        id: 'help_pilgrims',
        label: '巡礼者の荷運びを手伝う（+7 G）',
        description: '巡礼者の荷運びを手伝い、礼を受け取る。',
        outcome: {
          grantGold: 7,
          logMessage: '巡礼者の荷運びを手伝い、礼として 7 G を受け取った！',
        },
      },
    ],
  },
  astral_pedlar: {
    id: 'astral_pedlar',
    title: '星屑の行商人',
    category: 'merchant',
    description:
      '星屑をちりばめた外套の行商人が、図書館の回廊にひっそりと店を広げている。',
    speakerSpriteId: 'tome',
    palette: 'arcane_tome',
    options: [
      {
        id: 'buy_astral_relic',
        label: '星屑の護符を買い取る（レリック獲得）',
        description: '金貨を支払い、レリックを受け取る。',
        cost: { gold: 45 },
        outcome: {
          grantItemType: 'relic',
          logMessage: '金貨を支払い、星屑の護符を買い取った！',
        },
      },
      {
        id: 'buy_forbidden_copy',
        label: '禁書の写しを買い取る（スキル習得）',
        description: '金貨を支払い、禁書の写しからスキルを習得する。',
        cost: { gold: 30 },
        outcome: {
          grantItemType: 'skill',
          logMessage: '金貨を支払い、禁書の写しからスキルを習得した！',
        },
      },
      {
        id: 'sell_stardust',
        label: '集めた星屑を売る（+7 G）',
        description: '道中で集めた星屑を行商人に売る。',
        outcome: {
          grantGold: 7,
          logMessage: '集めた星屑を売り、7 G を得た！',
        },
      },
    ],
  },
  index_spring: {
    id: 'index_spring',
    title: '索引の泉',
    category: 'shrine',
    description:
      '書架の合間に、索引の文字が浮かぶ小さな泉が湧いている。水は星明かりのように微かに光る。',
    speakerSpriteId: 'shrine',
    palette: 'emerald_slime',
    options: [
      {
        id: 'drink_index_water',
        label: '霊水を飲む（HP 35%回復）',
        description: '最大HPの35%を回復する。',
        cost: { gold: 150 },
        outcome: {
          healHpPercent: 35,
          logMessage: '索引の泉の霊水を飲み干し、HPが35%回復した！',
        },
      },
      {
        id: 'collect_index_coins',
        label: '水底の金貨を拾う（+10 G）',
        description: '泉の底の金貨を拾う。',
        outcome: {
          grantGold: 10,
          logMessage: '泉の底から輝く金貨を拾い上げ、10 G を手に入れた！',
        },
      },
    ],
  },
  astral_archive: {
    id: 'astral_archive',
    title: '星図の書庫棚',
    category: 'lore',
    description:
      '廊下の壁面に、鍵の掛かっていない古びた星図の書庫棚が並んでいる。棚の奥には古い金貨袋と、魔力を帯びた羊皮紙の巻物が収められている。',
    speakerSpriteId: 'tome',
    palette: 'arcane_tome',
    options: [
      {
        id: 'collect_forgotten_coins',
        label: '散逸した金貨を回収する',
        description: '棚の隅に忘れられた古金貨を安全に持ち帰る。',
        outcome: {
          grantGold: 28,
          logMessage: '書庫棚の隅に忘れられていた古金貨を回収し、28Gを手に入れた！',
        },
      },
      {
        id: 'decipher_forbidden_manuscript',
        label: '禁呪の写本を解読する',
        description: '魔力の逆流で体力を消耗しながらも、眠っていた戦闘技法の記録を習得する。',
        cost: { hpPercent: 15 },
        outcome: {
          grantItemType: 'skill',
          grantGold: 12,
          logMessage: '禁呪の写本を解読し、新たなスキルと12Gを得た！',
        },
      },
    ],
  },
};
