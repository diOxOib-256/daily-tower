# リメイク Block 4 分割実装 — パート5：イベント3種・デビュー登録・フロア31〜40置換

## 共通ルール
- 変更は `src/extensible/` 配下のみ。完了条件：`npm test` 全件パス＋`npm run build` 成功＋main へ push。完了報告には変更ファイル一覧とテスト/ビルド結果、指示から変えた点があれば明記すること。
- このパートの最後に `scratch_remake_b4/` ディレクトリを削除する。
- 旧フロアの敵・アイテム・イベント定義は削除しない（プールと出現から外れるだけ）。

## 作業1：`src/extensible/events/eventRegistry.ts` にイベント3種を登録する
（形式は既存イベントの定義に合わせる。description は案の「説明」文を使う）
### amber_spring（琥珀の聖泉）category 'shrine', speakerSpriteId 'shrine', speakerPaletteId 'molten_iron'
説明「樹液が長い年月をかけて澄み渡った、黄金色に輝く小さな泉を見つけた。底には先人たちが捧げた硬貨が沈んでいる。」
- 選択肢1「泉の縁にこぼれた硬貨を拾う」説明「泉の周囲に落ちている硬貨だけを静かに回収する。」→ outcome { grantGold: 8 }
- 選択肢2「金貨を捧げて黄金の聖水を飲む」説明「泉に金貨を捧げ、澄んだ聖水で深い傷を癒やす。」→ cost { gold: 16 }, outcome { healHpPercent: 35 }
  ※浄化（cleanse）は付けない（確定仕様）。
### root_altar（根圏の古祭壇）category 'lore', speakerSpriteId 'shrine', speakerPaletteId 'ancient_bark'
説明「巨木の根が絡み合ってできた自然の祭壇に、古い時代から遺された護符と金貨が供えられている。」
- 選択肢1「供え物の傍らの金貨を譲り受ける」説明「祭壇に礼をして、旅の資金として金貨だけを受け取る。」→ outcome { grantGold: 10 }
- 選択肢2「生気を捧げて古代の護符を授かる」説明「自身の体力を対価に祈りを捧げ、祭壇に宿るレリックを一つ入手する。」→ cost { hpPercent: 15 }, outcome { grantItemType: 'relic', grantGold: 4 }
### root_hollow_camp（根洞の休息地）category 'rest', speakerSpriteId 'shrine', speakerPaletteId 'emerald_slime'
説明「巨大な木の根がアーチ状に組まれた、雨風も外敵も届かない静かな空洞を見つけた。ここで態勢を立て直すことができる。」
- 選択肢1「根洞の奥で深い休息をとる」説明「静寂の中で体を休め、体力を大きく回復する。」→ outcome { healHpPercent: 50 }
- 選択肢2「携帯用の回復具を補充する」説明「荷物を整え、消耗品チャージを1回分補充する。」→ outcome { consumableChargeDelta: 1 }

## 作業2：`src/extensible/items/rewardPoolDerivation.ts` の ITEM_DEBUT_OVERRIDES に15件追加する
rootbreaker_mace: 31, earthshatter_blow: 31, hornet_stinger: 31, amber_scale_mail: 32, briar_tempest: 32, warden_vitality: 33, root_medallion: 33, cinder_burst: 34, verdant_halberd: 35, amber_aegis: 35, royal_amber_jelly: 35, primal_surge: 36, rootguard_plate: 37, wraith_chill: 37, warden_sap_vial: 40

## 作業3：`src/extensible/realms/realm_01_greenwood.ts` のフロア31〜40を下記に置換する
- **rewardPool は書かない**（自動生成に移行）。敵の出現構成は下記のとおり（カメオ差し替え済みの確定版）。
- enemyStatScale は下記の初期値をそのまま使う（ボス階は戦闘とミニボスで別値）。

### Floor 31「琥珀の羽音鳴る樹洞」subtitle「黄金の樹液が壁を伝い、大型の琥珀バチが縄張りを飛び回る深奥の入口」scale 0.97
1. battle [amber_hornet] / 2. event amber_spring / 3. battle [sap_ooze] / 4. battle [amber_hornet, sap_ooze]
### Floor 32「亡霊と岩苔の廃道」subtitle「古い根に縛られた亡霊と苔むした岩の巨兵が道を塞ぐ静かな廃道」scale 0.85
1. battle [rootbound_wraith] / 2. battle [moss_golem] / 3. event root_altar / 4. battle [moss_golem, sap_ooze]
### Floor 33「根洞の安息所」subtitle「巨木の根が組まれた安全な空洞。前半の消耗を癒やし、女王バチの領域へ備える階層」scale 0.89
1. battle [dire_timberwolf] / 2. battle [rootbound_wraith, sap_ooze] / 3. event root_hollow_camp / 4. battle [amber_hornet, moss_golem]
### Floor 34「焦土と大狼の境界」subtitle「燻る焦土の樹精と飢えた深森のオオカミが交錯し、女王の巣が近づく階層」scale 1.099
1. battle [cinder_treant] / 2. battle [dire_timberwolf] / 3. event amber_spring / 4. battle [rootbound_wraith] / 5. battle [amber_hornet]
### Floor 35「琥珀女王の巣窟」subtitle「黄金の巣の奥にて、琥珀の女王バチが配下を従えて挑戦者を待ち受ける関門」scale 戦闘 1.121 / ミニボス 1.288
1. battle [moss_golem] / 2. event root_altar / 3. battle [cinder_treant] / 4. miniboss [amber_queen]
### Floor 36「茨と大ムカデの深淵」subtitle「鋭い茨の狩人と巨大なムカデが潜み、後半の新たな武具の力が試される深層」scale 1.132
1. battle [briar_stalker] / 2. event amber_spring / 3. battle [root_centipede] / 4. battle [rootbound_wraith]
### Floor 37「焦熱樹と狩人の密林」subtitle「炎を纏う樹精と猛毒の狩人が絶え間なく襲いかける過酷な連戦地帯」scale 1.132
1. battle [cinder_treant] / 2. battle [briar_stalker] / 3. event root_altar / 4. battle [dire_timberwolf] / 5. battle [ancient_watchman]（カメオ）
### Floor 38「深根の隠れ洞」subtitle「33F以来の安息の空洞。40Fの魔導樹との決戦に向け、体力と消耗品を整える階層」scale 1.154
1. battle [root_centipede] / 2. battle [briar_stalker] / 3. event root_hollow_camp / 4. battle [cinder_treant]
### Floor 39「魔導樹前の試練廊」subtitle「古代の魔力が濃密に渦巻き、聖域の番人へ挑む前の最終関門となる回廊」scale 1.45
1. battle [dire_timberwolf] / 2. battle [briar_stalker] / 3. event amber_spring / 4. battle [root_centipede] / 5. battle [blighted_lizard]（カメオ）
### Floor 40「古根の魔導聖域」subtitle「Block 4 を締めくくる古代の守護者「古根の魔導樹」が鎮座する蒼き聖域」scale 戦闘 1.42 / ミニボス 1.85
1. battle [canopy_stalker]（カメオ） / 2. event root_altar / 3. battle [root_centipede] / 4. miniboss [ancient_root_warden]

## コミット
`[CF-Pages-Skip] Remake Block 4 (5/5): events, debuts and floors 31-40`
