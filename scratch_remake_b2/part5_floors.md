# リメイク Block 2 分割実装（全5パート）

Daily Tower のフロア11〜20をリメイク案の内容に置き換える作業を、5パートに分けて実装しています。このファイルがあなたの担当パートの指示です。書かれていることだけを実行してください。

共通ルール：
- 変更は src/extensible/ 配下のみ。**src/core/ は変更禁止**（パート4で明示する2ファイルだけ例外）。
- ゲーム内UIに開発者向けの文言や更新履歴を入れないこと。
- 完了条件：npm test 全件パス、npm run build 成功、その状態で main へ push すること。
- 完了報告に、変更ファイル一覧・テスト／ビルド結果・指示から変えた点（あれば全部）を書くこと。

## パート5/5（最終）：イベント登録とフロア11〜20の置き換え

前提：パート1〜4で敵10種・アイテム15種・新規効果が登録済みのはず。着手前に registry / catalog を確認すること。

- 下記のイベント2種（forest_spring / mossy_forge）を src/extensible/events/eventRegistry.ts に登録する。形式は既存イベント（emerald_spring 等）と同じ。speakerSpriteId はどちらも 'shrine'、palette は forest_spring が 'frost_blue'、mossy_forge が 'ancient_bark' とする。
  - forest_spring の選択肢2は cost: { gold: 12 }、outcome は healHpPercent: 35 のみ（**イベント効果に cleanse の仕組みはないため、案にあったデバフ全解除は付けない**。完了報告にその旨を明記すること）。
  - mossy_forge の選択肢2は cost: { hpPercent: 15 }、outcome は grantItemType: 'armor' と grantGold: 4（verdant_shrine の形式に合わせる）。
- src/extensible/realms/realm_01_greenwood.ts のフロア11〜20を、下記の構成（タイトル・サブタイトルは末尾の案データ参照）で置き換える。1〜10Fと21F以降は一切変更しない。
- **enemyStatScale**：バトルは現行フロアの調整値をフロアごとに流用し、ミニボスは 1.0 とする。
  11F: 0.757 / 12F: 0.81 / 13F: 0.775 / 14F: 0.844 / 15F: バトル 0.92・ミニボス 1.0 / 16F: 0.82 / 17F: 0.828 / 18F: 0.97 / 19F: 0.844 / 20F: バトル 0.921・ミニボス 1.0
- **エンカウンター構成**（[A, B] は複数体バトル。ガーゴイルは mossy_gargoyle を使う）：
  - 11F: [moss_slime, forest_goblin] / event forest_spring / [mist_wolf] / [thorn_sprout, toxic_slime]
  - 12F: [bark_beetle, shadow_wolf] / [spore_goblin] / event mossy_forge / [mist_wolf, spore_goblin]
  - 13F: [forest_wisp, vine_stalker] / [canopy_spider] / event sunlit_clearing（Rest） / [frost_slime]
  - 14F: [hollow_dryad] / event verdant_shrine / [charred_sapling] / [canopy_spider, frost_slime]
  - 15F: [mossy_gargoyle, spore_goblin] / event wandering_herbalist / [deepwood_viper] / miniboss [ancient_wisp_lord]
  - 16F: [hollow_dryad, frost_slime] / event forest_spring / [charred_sapling, spore_goblin] / [mossy_gargoyle]
  - 17F: [deepwood_viper] / [canopy_spider, mist_wolf] / event mossy_forge / [hollow_dryad, frost_slime]
  - 18F: [charred_sapling] / [hollow_dryad] / event sunlit_clearing（Rest） / [mist_wolf, canopy_spider]
  - 19F: [charred_sapling] / event verdant_shrine / [mossy_gargoyle] / [deepwood_viper]
  - 20F: [mossy_gargoyle] / event wandering_herbalist / [deepwood_viper] / miniboss [ironbark_sentinel]
- **rewardPool の振り分け**：武器・防具 → equipmentIds、スキル → skillIds、レリック → utilityIds。
  - 11〜15F：equipmentIds = [hunters_shortblade, thornwood_spear, iron_hatchet, travelers_leather, mossweave_vest, spider_silk_cloak]、skillIds = [quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, ironbark_ward]、utilityIds = [hunters_badge, verdant_brooch, mist_charm]、consumableIds は 15F のみ [frost_draught]、他は空配列。
  - 16〜20F：equipmentIds = 11〜15F の6種 + [elder_bow, ironbark_mail]、skillIds = 11〜15F の11種 + [spirit_breeze, verdant_focus, toxic_mist]、utilityIds = [hunters_badge, verdant_brooch, mist_charm, amber_heart]、consumableIds は 20F のみ [dryad_elixir]、他は空配列。
- 旧フロア11〜20で使われていた旧敵・旧アイテム・旧イベントの定義は削除しない（セーブ・図鑑互換のため残す）。ただし canopy_spider はパート1で再定義済み、moss_gargoyle は旧定義のまま温存が正しい状態。
- 最後に、作業用フォルダ scratch_remake_b2/ をリポジトリから削除すること（このファイルを含む全ファイル）。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 2 (5/5): events and floors 11-20`（**デプロイ無効**。ユーザーの指示により、リメイクの公開は別途行う。このパートでも必ず [CF-Pages-Skip] を付けること）

## イベントデータ

1. 樹海の湧水 (forest_spring)【Goldコスト必須の泉系イベント】
カテゴリ: shrine
タイトル: 樹海の湧水
説明: 清らかな水が湧き出る小さな泉を見つけた。泉の底には旅人たちが投げ入れた硬貨がわずかに光っている。
選択肢1:
ラベル: 「泉の縁に落ちた小銭を拾う」
説明: 水を汚さないよう縁に落ちた硬貨だけを拾い集める。
コスト: なし
効果: Gold +6 獲得
選択肢2:
ラベル: 「金貨を捧げて湧水を飲む」
説明: 泉の精霊に金貨を捧げ、清らかな水で傷と状態異常を癒やす（Goldコスト必須の泉系）。
コスト: Gold 12
効果: HP 35% 回復 ＋ デバフ全解除
2. 苔むした古鍛冶場 (mossy_forge)
カテゴリ: forge
タイトル: 苔むした古鍛冶場
説明: 森の中に打ち捨てられた古い鍛冶場の跡。炉の傍らにはまだ使えそうな鉄材や防具の欠片が残っている。
選択肢1:
ラベル: 「使えそうな鉄屑を集めて換金する」
説明: 傷んでいない金属部品を回収し、手堅く資金にする。
コスト: なし
効果: Gold +8 獲得
選択肢2:
ラベル: 「生気を注いで古炉の防具を鍛え直す」
説明: 自身の体力を対価に、残されていた防具を一つ修復して入手する。
コスト: HP 15%
効果: grantItemType: 'armor' ＋ Gold +4 獲得
## フロア案データ（タイトル・サブタイトル参照用、11〜15F）

Floor 11: 霧立ち込める樹林（Realm 1 - Standard / step 3）
タイトル: 霧立ち込める樹林
サブタイトル: 冷たい朝霧が視界を遮り、Block 1 の魔物たちが最後の縄張り争いを繰り広げる中盤の入口
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [moss_slime, forest_goblin]（基礎ATK合計: 11 + 12 = 23 / Block 1 カメオ）
2. event: eventId: forest_spring
3. battle: enemyIds: [mist_wolf]
4. battle: enemyIds: [thorn_sprout, toxic_slime]（基礎ATK合計: 13 + 12 = 25 / Block 1 カメオ）
報酬カード（3択）: Card 1: iron_hatchet（武器 ATK 18） / Card 2: iron_cleave / Card 3: mist_charm
rewardPool（step 3 上限 ATK 18 / DEF 6 / HP 35 以内）:hunters_shortblade, thornwood_spear, iron_hatchet, travelers_leather, mossweave_vest, spider_silk_cloak, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, ironbark_ward, hunters_badge, verdant_brooch, mist_charm
Floor 12: 胞子舞う古鍛冶跡（Realm 1 - Standard / step 3）
タイトル: 胞子舞う古鍛冶跡
サブタイトル: 毒胞子を撒くゴブリンや霧オオカミが徘徊し、打ち捨てられた鍛冶場の跡が点在する階層
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [bark_beetle, shadow_wolf]（基礎ATK合計: 12 + 14 = 26 / Block 1 カメオ）
2. battle: enemyIds: [spore_goblin]
3. event: eventId: mossy_forge
4. battle: enemyIds: [mist_wolf, spore_goblin]（基礎ATK合計: 15 + 14 = 29）
報酬カード（3択）: Card 1: spider_silk_cloak（防具 DEF 6 / HP 35） / Card 2: gale_sweep / Card 3: mist_charm
rewardPool（step 3 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, travelers_leather, mossweave_vest, spider_silk_cloak, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, ironbark_ward, hunters_badge, verdant_brooch, mist_charm
Floor 13: 木漏れ日の小休止（Realm 1 - Standard / step 3 / Rest確定階）
タイトル: 木漏れ日の小休止
サブタイトル: 8F以来の安息の空き地。Block 1 最後のカメオ敵を退け、後半戦へ向けて態勢を立て直す階層
エンカウンター構成（計3戦＋1 Restイベント）:
1. battle: enemyIds: [forest_wisp, vine_stalker]（基礎ATK合計: 15 + 15 = 30 / Block 1 カメオ）
2. battle: enemyIds: [canopy_spider]
3. event: eventId: sunlit_clearing（Restイベント・確定出現）
4. battle: enemyIds: [frost_slime]
報酬カード（3択）: Card 1: iron_hatchet / Card 2: crimson_fireball / Card 3: verdant_brooch
rewardPool（step 3 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, travelers_leather, mossweave_vest, spider_silk_cloak, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, ironbark_ward, hunters_badge, verdant_brooch, mist_charm
Floor 14: 朽木と焦土の境界（Realm 1 - Standard / step 3）
タイトル: 朽木と焦土の境界
サブタイトル: 蒼い霊気を放つ朽木の精霊と焦げ木の幼体が縄張りを接し、15Fの関門が迫る密林
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [hollow_dryad]
2. event: eventId: verdant_shrine
3. battle: enemyIds: [charred_sapling]
4. battle: enemyIds: [canopy_spider, frost_slime]（基礎ATK合計: 16 + 15 = 31）
報酬カード（3択）: Card 1: spider_silk_cloak / Card 2: ironbark_ward / Card 3: mist_charm
rewardPool（step 3 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, travelers_leather, mossweave_vest, spider_silk_cloak, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, ironbark_ward, hunters_badge, verdant_brooch, mist_charm
Floor 15: 紅蓮鬼火の玉座（Realm 1 - Miniboss / step 3）
タイトル: 紅蓮鬼火の玉座
サブタイトル: 紅蓮の炎を纏う古の鬼火王が、石像の守護者と大蛇を従えて待ち受ける中盤の関門
エンカウンター構成（計2戦＋1イベント＋1ミニボス）:
1. battle: enemyIds: [moss_gargoyle, spore_goblin]（基礎ATK合計: 16 + 14 = 30）
2. event: eventId: wandering_herbalist
3. battle: enemyIds: [deepwood_viper]
4. miniboss: enemyIds: [ancient_wisp_lord]（15F専用Miniboss・1体のみ）
ミニボス固有報酬（消耗品枠）: frost_draught（氷霧の霊水）
報酬カード（3択）: Card 1: iron_hatchet / Card 2: iron_cleave / Card 3: mist_charm
rewardPool（step 3 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, travelers_leather, mossweave_vest, spider_silk_cloak, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, ironbark_ward, hunters_badge, verdant_brooch, mist_charm
## フロア案データ（タイトル・サブタイトル参照用、16〜20F）

Floor 16: 霊気と焦熱の密林（Realm 1 - Standard / step 4）
タイトル: 霊気と焦熱の密林
サブタイトル: 精霊の魔力と焦げ木の火の粉が交錯し、step 4 の新たな武具とスキルが解禁される階層
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [hollow_dryad, frost_slime]（基礎ATK合計: 17 + 15 = 32）
2. event: eventId: forest_spring
3. battle: enemyIds: [charred_sapling, spore_goblin]（基礎ATK合計: 16 + 14 = 30）
4. battle: enemyIds: [moss_gargoyle]
報酬カード（3択）: Card 1: elder_bow（武器 ATK 19 / nature） / Card 2: spirit_breeze / Card 3: amber_heart
rewardPool（step 4 上限 ATK 19 / DEF 6 / HP 40 以内）:hunters_shortblade, thornwood_spear, iron_hatchet, elder_bow, travelers_leather, mossweave_vest, spider_silk_cloak, ironbark_mail, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, spirit_breeze, ironbark_ward, verdant_focus, toxic_mist, hunters_badge, verdant_brooch, mist_charm, amber_heart
Floor 17: 大蛇の潜む古道（Realm 1 - Standard / step 4）
タイトル: 大蛇の潜む古道
サブタイトル: 深緑の大蛇や樹冠グモが獲物を待ち構え、持久戦への備えが試される密林の奥地
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [deepwood_viper]
2. battle: enemyIds: [canopy_spider, mist_wolf]（基礎ATK合計: 16 + 15 = 31）
3. event: eventId: mossy_forge
4. battle: enemyIds: [hollow_dryad, frost_slime]（基礎ATK合計: 17 + 15 = 32）
報酬カード（3択）: Card 1: ironbark_mail（防具 DEF 6 / HP 40） / Card 2: verdant_focus / Card 3: amber_heart
rewardPool（step 4 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, elder_bow, travelers_leather, mossweave_vest, spider_silk_cloak, ironbark_mail, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, spirit_breeze, ironbark_ward, verdant_focus, toxic_mist, hunters_badge, verdant_brooch, mist_charm, amber_heart
Floor 18: 木漏れ日の隠れ里（Realm 1 - Standard / step 4 / Rest確定階）
タイトル: 木漏れ日の隠れ里
サブタイトル: 13F以来の安息の空き地。20Fの鉄樹の守護者との決戦に備え、消耗品と体力を整える階層
エンカウンター構成（計3戦＋1 Restイベント）:
1. battle: enemyIds: [charred_sapling]
2. battle: enemyIds: [hollow_dryad]
3. event: eventId: sunlit_clearing（Restイベント・確定出現）
4. battle: enemyIds: [mist_wolf, canopy_spider]（基礎ATK合計: 15 + 16 = 31）
報酬カード（3択）: Card 1: elder_bow / Card 2: toxic_mist / Card 3: mist_charm
rewardPool（step 4 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, elder_bow, travelers_leather, mossweave_vest, spider_silk_cloak, ironbark_mail, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, spirit_breeze, ironbark_ward, verdant_focus, toxic_mist, hunters_badge, verdant_brooch, mist_charm, amber_heart
Floor 19: 鉄樹の回廊（Realm 1 - Standard / step 4）
タイトル: 鉄樹の回廊
サブタイトル: 鋼のように硬い樹根が通路を覆い、守護者の気配が色濃く漂う決戦前夜の回廊
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [charred_sapling]
2. event: eventId: verdant_shrine
3. battle: enemyIds: [moss_gargoyle]
4. battle: enemyIds: [deepwood_viper]
報酬カード（3択）: Card 1: ironbark_mail / Card 2: spirit_breeze / Card 3: amber_heart
rewardPool（step 4 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, elder_bow, travelers_leather, mossweave_vest, spider_silk_cloak, ironbark_mail, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, spirit_breeze, ironbark_ward, verdant_focus, toxic_mist, hunters_badge, verdant_brooch, mist_charm, amber_heart
Floor 20: 鉄樹の聖域（Realm 1 - Miniboss / step 4）
タイトル: 鉄樹の聖域
サブタイトル: Block 2 を締めくくる鉄樹の守護者が、聖域の最奥で挑戦者を待ち受ける決戦の場
エンカウンター構成（計2戦＋1イベント＋1ミニボス）:
1. battle: enemyIds: [moss_gargoyle]
2. event: eventId: wandering_herbalist
3. battle: enemyIds: [deepwood_viper]
4. miniboss: enemyIds: [ironbark_sentinel]（20F専用Miniboss・1体のみ）
ミニボス固有報酬（消耗品枠）: dryad_elixir（精霊の秘薬）
報酬カード（3択）: Card 1: elder_bow / Card 2: verdant_focus / Card 3: amber_heart
rewardPool（step 4 上限以内）:hunters_shortblade, thornwood_spear, iron_hatchet, elder_bow, travelers_leather, mossweave_vest, spider_silk_cloak, ironbark_mail, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, iron_cleave, gale_sweep, crimson_fireball, spirit_breeze, ironbark_ward, verdant_focus, toxic_mist, hunters_badge, verdant_brooch, mist_charm, amber_heart
