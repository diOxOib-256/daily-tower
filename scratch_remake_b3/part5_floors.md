# リメイク Block 3 分割実装（全5パート）

Daily Tower のフロア21〜30をリメイク案の内容に置き換える作業を、5パートに分けて実装しています。このファイルがあなたの担当パートの指示です。書かれていることだけを実行してください。

共通ルール：
- 変更は src/extensible/ 配下のみ。**src/core/ は変更禁止**（パート4で明示する CombatEngine.ts の1箇所だけ例外）。
- ゲーム内UIに開発者向けの文言や更新履歴を入れないこと。
- 完了条件：npm test 全件パス、npm run build 成功、その状態で main へ push すること。
- 完了報告に、変更ファイル一覧・テスト／ビルド結果・指示から変えた点（あれば全部）を書くこと。

新規スプライトの描画ルール（案にはマトリクスがなく、見た目の説明文とパレットだけがある）：
- 32行×32要素のマトリクス（値 0〜3）を説明文から描き起こす。パレットは案の4色のうち透明（#00000000）を除いた3色を [輪郭, 主色, ハイライト] として登録し、マトリクスの値 1=輪郭、2=主色、3=ハイライト、0=透明 に対応させる。
- 輪郭線だけの線画にしない。シルエット内部を主色（2）でしっかり塗りつぶし、被写体の幅は22セル以上、塗り面積は全体の35%以上を目安にする。文字や記号は描かない。

## パート5/5（最終）：イベント登録・アイテムデビュー登録とフロア21〜30の置き換え

前提：パート1〜4で敵10種・アイテム15種・新規効果が登録済みのはず。着手前に registry / catalog を確認すること。

### A. イベント3種（src/extensible/events/eventRegistry.ts）
既存イベント（emerald_spring / mossy_forge / sunlit_clearing 等）と同じ形式で登録する。speakerSpriteId は全種 'shrine'、palette は sylvan_basin が 'frost_blue'、hollow_armory が 'ancient_bark'、canopy_camp が 'emerald_slime' とする。
- sylvan_basin（森の霊泉 / shrine）：選択肢1は効果 grantGold: 7。選択肢2は cost: { gold: 14 }、outcome は healHpPercent: 35 のみ（**イベント効果に cleanse の仕組みはないため、案にあったデバフ全解除は付けない**。完了報告にその旨を明記すること）。
- hollow_armory（古樹の武器庫 / forge）：選択肢1は grantGold: 9。選択肢2は cost: { hpPercent: 15 }、outcome は grantItemType: 'weapon' と grantGold: 4。
- canopy_camp（緑陰のキャンプ / rest）：選択肢1は healHpPercent: 50、選択肢2は consumableCharges の +1（sunlit_clearing と同じ outcome 形式）。

### B. アイテムデビュー登録（src/extensible/items/rewardPoolDerivation.ts）
フロア21〜30では rewardPool を**省略**し（エンジンがデビュー階から自動生成する）、代わりに ITEM_DEBUT_OVERRIDES へ次の15件を登録する：
verdant_battleaxe: 21, rending_cleave: 21, mycelial_crystal: 21, carapace_cuirass: 22, whirlwind_slash: 22, elder_regrowth: 23, spirit_crest: 23, spore_ignition: 24, ancient_staff: 25, shell_fortress: 25, sovereign_nectar: 25, verdant_war_cry: 26, deepwood_plate: 27, corrosive_haze: 27, colossus_draught: 30

### C. フロア21〜30の置き換え（src/extensible/realms/realm_01_greenwood.ts）
下記の構成（タイトル・サブタイトルは末尾の案データ参照）で置き換える。1〜20Fと31F以降は一切変更しない。**rewardPool フィールドは付けない**（Bの自動生成に任せる）。
- **enemyStatScale**：バトルは現行フロアの調整値をフロアごとに流用し、ミニボスは 1.0 とする。
  21F: 0.932 / 22F: 1.06 / 23F: 1.02 / 24F: 0.966 / 25F: バトル 1.02・ミニボス 1.0 / 26F: 0.95 / 27F: 1.01 / 28F: 0.817 / 29F: 0.698 / 30F: バトル 0.9・ミニボス 1.0
- **エンカウンター構成**（[A, B] は複数体バトル。出現回数の上限調整のため、案から4箇所だけ Block 2 の敵に差し替えてある。この指示が正）：
  - 21F: [fungal_shaman] / event sylvan_basin / [humus_slime] / [stag_carapace, humus_slime]
  - 22F: [rime_sprite] / [stag_carapace] / event hollow_armory / [fungal_shaman, rime_sprite]
  - 23F: [feral_hound] / [humus_slime] / event canopy_camp（Rest） / [rime_sprite]
  - 24F: [ancient_watchman] / [feral_hound] / event sylvan_basin / [fungal_shaman, stag_carapace] / [hollow_dryad]
  - 25F: [fungal_shaman, humus_slime] / event hollow_armory / [rime_sprite] / miniboss [myconid_sovereign]
  - 26F: [feral_hound] / event sylvan_basin / [ancient_watchman, mist_wolf] / [deepwood_viper]
  - 27F: [canopy_stalker] / [blighted_lizard] / event hollow_armory / [canopy_stalker] / [stag_carapace]
  - 28F: [blighted_lizard] / [frost_slime] / event canopy_camp（Rest） / [ancient_watchman]
  - 29F: [canopy_stalker] / [feral_hound] / event sylvan_basin / [blighted_lizard] / [canopy_stalker]
  - 30F: [blighted_lizard] / event hollow_armory / [ancient_watchman] / miniboss [verdant_colossus]
- 旧フロア21〜30で使われていた旧敵・旧アイテム・旧イベントの定義は削除しない（セーブ・図鑑互換のため残す）。
- 最後に、作業用フォルダ scratch_remake_b3/ をリポジトリから削除すること（このファイルを含む全ファイル）。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 3 (5/5): events, debuts and floors 21-30`（**デプロイ無効**。公開はユーザーの合図があるまで行わない）

## イベントデータ

1. 森の霊泉 (sylvan_basin)【通常イベント / Goldコスト必須の泉系】
カテゴリ: shrine
タイトル: 森の霊泉
説明: 静かな森の窪地に、淡く光る水が満ちた石造りの泉がある。泉の縁には先人たちが置いた硬貨が並んでいる。
選択肢1:
ラベル: 「泉の縁に残された硬貨を拾う」
説明: 水には触れず、縁に落ちている硬貨だけを回収する。
コスト: なし
効果: Gold +7 獲得
選択肢2:
ラベル: 「金貨を捧げて霊泉の水を飲む」
説明: 泉に金貨を投げ入れ、清浄な水で体力を癒やし状態異常を払う。
コスト: Gold 14
効果: HP 35% 回復 ＋ デバフ全解除
2. 古樹の武器庫 (hollow_armory)【通常イベント】
カテゴリ: forge
タイトル: 古樹の武器庫
説明: 巨大な空洞の中に、かつての探索者たちが残した武具や砥石が保管されている。
選択肢1:
ラベル: 「残された金属片を集めて換金する」
説明: まだ価値のある部品だけを選び出し、資金として持ち歩く。
コスト: なし
効果: Gold +9 獲得
選択肢2:
ラベル: 「生気を注いで古の武器を研ぎ直す」
説明: 自身の体力を対価に魔力を込め、残されていた武器を一つ入手する。
コスト: HP 15%
効果: grantItemType: 'weapon' ＋ Gold +4 獲得
3. 緑陰のキャンプ (canopy_camp)【Restイベント】
カテゴリ: rest（Restイベント・確定出現）
タイトル: 緑陰のキャンプ
説明: 大きな樹冠が外敵の目を遮る安全な野営地を見つけた。ここで休息をとるか、手持ちの道具を整えることができる。
選択肢1:
ラベル: 「木陰で深い休息をとる」
説明: 穏やかな空気の中で体を休め、体力を大きく回復する。
コスト: なし
効果: HP 50% 回復
選択肢2:
ラベル: 「携帯用の回復具を補充する」
説明: 荷物を点検し、消耗品チャージを1回分補充する。
コスト: なし
効果: 消耗品チャージ +1
## フロア案データ（タイトル・サブタイトル参照用）

Floor 21: 菌糸の広がる深林
subtitle: 紫の胞子が静かに舞い、古樹の迷宮の深層へと足を踏み入れる階層
エンカウンター: 1. battle: [fungal_shaman] / 2. event: sylvan_basin / 3. battle: [humus_slime] / 4. battle: [stag_carapace, humus_slime]（基礎ATK合計: 32）
報酬カード: Card 1: verdant_battleaxe / Card 2: rending_cleave / Card 3: mycelial_crystal
Floor 22: 冷霧と甲殻の谷
subtitle: 凍てつく霧氷の精と硬い甲殻を持つ大顎のクワガタが縄張りを争う冷涼な谷間
エンカウンター: 1. battle: [rime_sprite] / 2. battle: [stag_carapace] / 3. event: hollow_armory / 4. battle: [fungal_shaman, rime_sprite]（基礎ATK合計: 32）
報酬カード: Card 1: carapace_cuirass / Card 2: whirlwind_slash / Card 3: mycelial_crystal
Floor 23: 緑陰の野営地（Rest確定階）
subtitle: 樹冠に守られた静かな野営地で、中盤の連戦に備えて体力を整える安息の階層
エンカウンター: 1. battle: [feral_hound] / 2. battle: [humus_slime] / 3. event: canopy_camp（Restイベント・確定出現） / 4. battle: [rime_sprite]
報酬カード: Card 1: verdant_battleaxe / Card 2: elder_regrowth / Card 3: spirit_crest
Floor 24: 哨兵の巡回廊
subtitle: 巨木の哨兵と飢えた野犬が巡回し、胞子王の玉座が近づく緊張感漂う回廊
エンカウンター: 1. battle: [ancient_watchman] / 2. battle: [feral_hound] / 3. event: sylvan_basin / 4. battle: [fungal_shaman, stag_carapace]（基礎ATK合計: 31） / 5. battle: [ancient_watchman]
報酬カード: Card 1: carapace_cuirass / Card 2: spore_ignition / Card 3: mycelial_crystal
Floor 25: 胞子王の菌殿（Miniboss）
subtitle: 発光する菌糸に覆われた広間にて、胞子王マイコニドが挑戦者を待ち受ける第一の関門
エンカウンター: 1. battle: [fungal_shaman, humus_slime]（基礎ATK合計: 31） / 2. event: hollow_armory / 3. battle: [rime_sprite] / 4. miniboss: [myconid_sovereign]
ミニボス固有報酬（消耗品枠）: sovereign_nectar（森王の蜜薬）
報酬カード: Card 1: ancient_staff / Card 2: shell_fortress / Card 3: spirit_crest
Floor 26: 霊木と野犬の密林
subtitle: 古樹の魔力が濃くなり、新たな魔杖と重鎧の力が試される後半戦の入口
エンカウンター: 1. battle: [feral_hound] / 2. event: sylvan_basin / 3. battle: [ancient_watchman, fungal_shaman]（基礎ATK合計: 32） / 4. battle: [ancient_watchman]
報酬カード: Card 1: ancient_staff / Card 2: verdant_war_cry / Card 3: spirit_crest
Floor 27: 暗殺者と呪木の道
subtitle: 茂みに潜む深緑の暗殺者と火炎を吐く呪木のトカゲが交錯する危険な密林
エンカウンター: 1. battle: [canopy_stalker] / 2. battle: [blighted_lizard] / 3. event: hollow_armory / 4. battle: [canopy_stalker] / 5. battle: [stag_carapace]
報酬カード: Card 1: deepwood_plate / Card 2: corrosive_haze / Card 3: mycelial_crystal
Floor 28: 木漏れ日の隠れ家（Rest確定階）
subtitle: 23F以来の安息の野営地。30Fの巨像との決戦に向け、消耗品と体力を万全に整える階層
エンカウンター: 1. battle: [blighted_lizard] / 2. battle: [rime_sprite] / 3. event: canopy_camp（Restイベント・確定出現） / 4. battle: [ancient_watchman]
報酬カード: Card 1: deepwood_plate / Card 2: elder_regrowth / Card 3: spirit_crest
Floor 29: 巨像前夜の樹海
subtitle: 深緑の巨像の足音が響く、決戦直前の過酷な連戦地帯
エンカウンター: 1. battle: [canopy_stalker] / 2. battle: [feral_hound] / 3. event: sylvan_basin / 4. battle: [blighted_lizard] / 5. battle: [canopy_stalker]
報酬カード: Card 1: ancient_staff / Card 2: rending_cleave / Card 3: spirit_crest
Floor 30: 深緑の巨像殿（Miniboss）
subtitle: Block 3 を締めくくる古代の番人「深緑の巨像」が立ち塞がる試練の聖域
エンカウンター: 1. battle: [blighted_lizard] / 2. event: hollow_armory / 3. battle: [ancient_watchman] / 4. miniboss: [verdant_colossus]
ミニボス固有報酬（消耗品枠）: colossus_draught（巨像の活力剤）
報酬カード: Card 1: deepwood_plate / Card 2: whirlwind_slash / Card 3: mycelial_crystal
