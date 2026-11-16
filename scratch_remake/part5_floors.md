# リメイク Block 1 分割実装（全5パート）

Daily Tower のフロア1〜10をリメイク案の内容に置き換える作業を、5パートに分けて実装しています。このファイルがあなたの担当パートの指示です。書かれていることだけを実行してください。

共通ルール：
- 変更は src/extensible/ 配下のみ。**src/core/ は変更禁止**。
- ゲーム内UIに開発者向けの文言や更新履歴を入れないこと。
- 完了条件：npm test 全件パス、npm run build 成功、その状態で main へ push すること。
- 完了報告に、変更ファイル一覧・テスト／ビルド結果・指示から変えた点（あれば全部）を書くこと。

## パート5/5（最終）：イベント登録とフロア1〜10の置き換え

前提：パート1〜4で敵10種・アイテム15種が登録済みのはず。着手前に registry / catalog を確認すること。

- 下記のイベント2種（verdant_shrine / wandering_herbalist）と Rest イベント（sunlit_clearing）を src/extensible/events/eventRegistry.ts に登録する。効果が既存のイベント効果タイプに無い場合は、core を変えず最も近い既存表現に寄せ、完了報告に明記すること。
- src/extensible/realms/realm_01_greenwood.ts のフロア1〜10を、下記の構成（タイトル・サブタイトル・エンカウンター・報酬プール）で置き換える。11F以降は一切変更しない。
- **enemyStatScale**：現行の調整済みスケールをフロアごとに流用する。通常／ミニボスで分かれているフロアはそれに従う。
  1F: 0.78 / 2F: 0.865 / 3F: 0.72 / 4F: 0.765 / 5F: 通常 0.86・ミニボス 1.2 / 6F: 0.9 / 7F: 0.85 / 8F: 0.68 / 9F: 0.581 / 10F: 通常 0.86・ミニボス 1.15
- **rewardPool の振り分け**：案のリストはカテゴリ混在なので、武器・防具 → equipmentIds、スキル → skillIds、レリック → utilityIds に振り分ける。通常フロアの consumableIds は空配列。5F は ['herbal_poultice']、10F は ['amber_tonic']。
- 通常イベントはフロアに authored されれば抽選プールに自動で入る仕組み。構成通りに eventId を配置すればよい。Rest は 3F・8F に固定。
- 旧フロア1〜10で使われていた旧敵・旧アイテム・旧イベントの定義は削除しない（セーブ・図鑑互換のため残す）。参照されなくなるだけが正しい状態。
- 最後に、作業用フォルダ scratch_remake/ をリポジトリから削除すること（このファイルを含む全ファイル）。
- コミットメッセージ：`Remake Block 1 (5/5): events and floors 1-10`（このパートはデプロイあり）

## イベントデータ

新規イベント（2種 / eventRegistry.ts）
1. 樹海の古祠 (verdant_shrine)
カテゴリ: shrine
タイトル: 樹海の古祠
説明: 巨木の根元に、苔むした小さな石造りの祠が佇んでいる。賽銭箱の脇には古びた武具の紋章が刻まれている。
選択肢1:
ラベル: 「祠の苔を払い、供えられた銀貨を受け取る」
説明: 丁寧に掃除をした礼として、わずかな資金を得る。
コスト: なし
効果: Gold +8 獲得
選択肢2:
ラベル: 「生気を捧げて古い武具の加護を得る」
説明: 自身の体力を対価に、祠に宿る武器を一つ授かる。
コスト: HP 15%
効果: grantItemType: 'weapon' ＋ Gold +4 獲得
2. 森の薬草商 (wandering_herbalist)
カテゴリ: merchant
タイトル: 森の薬草商
説明: 大きな背負い籠を抱えた旅の薬草商と出会った。珍しい森の薬草や古い護符を取り扱っているようだ。
選択肢1:
ラベル: 「薬草の小袋を譲って対価を得る」
説明: 商人が欲しがっていた乾燥薬草を譲り、わずかな金貨を得る。
コスト: なし
効果: Gold +7 獲得
選択肢2:
ラベル: 「秘蔵の護符を買い取る」
説明: 手持ちの金貨を支払い、商人が見つけた珍しいレリックを購入する。
コスト: Gold 15
効果: grantItemType: 'relic'

Block 1（1〜10F）
## Rest イベントデータ

新規 Rest イベント（src/extensible/events/eventRegistry.ts）
木漏れ日の空き地 (sunlit_clearing)
カテゴリ: rest（Restイベント・確定出現）
タイトル: 木漏れ日の空き地
説明: 樹海の奥に、柔らかな木漏れ日が差し込む静かな空き地を見つけた。ここで一息つき、旅支度を整えることができる。
選択肢1:
ラベル: 「木陰で深い休息をとる」
説明: 穏やかな光の中で体を休め、体力を大きく回復する。
コスト: なし
効果: HP 50% 回復
選択肢2:
ラベル: 「携帯用の回復具を補充する」
説明: 荷物を点検し、消耗品チャージを1回分補充する。
コスト: なし
効果: 消耗品チャージ +1

## フロア構成 1〜5F

Floor 1: 苔むした樹海の入口（Realm 1 - Standard / step 1）
タイトル: 苔むした樹海の入口
サブタイトル: 木漏れ日が差す石畳の回廊で、樹海に住まう小動物やスライムと初めて対峙する導入階
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [moss_slime]
2. event: eventId: verdant_shrine
3. battle: enemyIds: [forest_goblin]
4. battle: enemyIds: [moss_slime, thorn_sprout]（基礎ATK合計: 11 + 13 = 24）
報酬カード（3択）: Card 1: hunters_shortblade（武器 ATK 14） / Card 2: quick_slash / Card 3: hunters_badge
rewardPool（step 1 上限 ATK 16 / DEF 5 以内）:hunters_shortblade, travelers_leather, quick_slash, ember_toss, forest_breath, hunters_badge
Floor 2: 棘と毒の茂み（Realm 1 - Standard / step 1）
タイトル: 棘と毒の茂み
サブタイトル: 毒を帯びたスライムや棘の新芽が群生する、薄暗い樹海の小道
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [thorn_sprout]
2. battle: enemyIds: [toxic_slime]
3. event: eventId: wandering_herbalist
4. battle: enemyIds: [toxic_slime, forest_goblin]（基礎ATK合計: 12 + 12 = 24）
報酬カード（3択）: Card 1: travelers_leather（防具 DEF 4 / HP 15） / Card 2: ember_toss / Card 3: hunters_badge
rewardPool（step 1 上限以内）:hunters_shortblade, travelers_leather, quick_slash, ember_toss, sweeping_arc, forest_breath, hunters_badge
Floor 3: 木漏れ日の野営地（Realm 1 - Standard / step 1 / Rest確定階）
タイトル: 木漏れ日の野営地
サブタイトル: 巨木の根元に差し込む穏やかな光の下で、旅人が息を整える安息の階層
エンカウンター構成（計3戦＋1 Restイベント）:
1. battle: enemyIds: [bark_beetle]
2. battle: enemyIds: [shadow_wolf]
3. event: eventId: sunlit_clearing（Restイベント・確定出現）
4. battle: enemyIds: [bark_beetle]
報酬カード（3択）: Card 1: hunters_shortblade / Card 2: bark_guard / Card 3: hunters_badge
rewardPool（step 1 上限以内）:hunters_shortblade, travelers_leather, quick_slash, sweeping_arc, forest_breath, bark_guard, sap_shot, hunters_badge
Floor 4: 妖光揺らめく深緑（Realm 1 - Standard / step 1）
タイトル: 妖光揺らめく深緑
サブタイトル: 青白い鬼火と蔦の徘徊者が縄張りを守り、中ボス前の連戦が待ち受ける密林の奥
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [forest_wisp]
2. battle: enemyIds: [vine_stalker]
3. event: eventId: verdant_shrine
4. battle: enemyIds: [shadow_wolf]
報酬カード（3択）: Card 1: travelers_leather / Card 2: sap_shot / Card 3: hunters_badge
rewardPool（step 1 上限以内）:hunters_shortblade, travelers_leather, ember_toss, sweeping_arc, bark_guard, sap_shot, venom_sting, hunters_badge
Floor 5: ゴブリン頭領の砦（Realm 1 - Miniboss / step 1）
タイトル: ゴブリン頭領の砦
サブタイトル: 樹海の第一関門を統べる森ゴブリンの頭領が、配下を従えて待ち受ける木造の砦
エンカウンター構成（計2戦＋1イベント＋1ミニボス）:
1. battle: enemyIds: [forest_goblin, moss_slime]（基礎ATK合計: 12 + 11 = 23）
2. event: eventId: wandering_herbalist
3. battle: enemyIds: [thorn_sprout, bark_beetle]（基礎ATK合計: 13 + 12 = 25）
4. miniboss: enemyIds: [goblin_chieftain]（5F専用Miniboss・1体のみ）
ミニボス固有報酬（消耗品枠）: herbal_poultice（森の薬草湿布）
報酬カード（3択）: Card 1: hunters_shortblade / Card 2: venom_sting / Card 3: hunters_badge
rewardPool（step 1 上限以内）:hunters_shortblade, travelers_leather, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, hunters_badge

## フロア構成 6〜10F

Floor 6: 棘木の深道（Realm 1 - Standard / step 2）
タイトル: 棘木の深道
サブタイトル: 樹皮カブトと棘の新芽が道を塞ぎ、新たな自然属性の武具が解禁される中盤の入口
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [toxic_slime]
2. event: eventId: verdant_shrine
3. battle: enemyIds: [forest_wisp]
4. battle: enemyIds: [vine_stalker]
報酬カード（3択）: Card 1: thornwood_spear（武器 ATK 16 / nature） / Card 2: sweeping_arc / Card 3: verdant_brooch
rewardPool（step 2 上限 ATK 16 / DEF 6 以内）:hunters_shortblade, thornwood_spear, travelers_leather, mossweave_vest, quick_slash, sweeping_arc, bark_guard, hunters_badge, verdant_brooch
Floor 7: 樹液滴る古道（Realm 1 - Standard / step 2）
タイトル: 樹液滴る古道
サブタイトル: 毒と妖光が交錯する薄暗い古道で、状態異常への対処力が試される階層
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [moss_slime]
2. event: eventId: wandering_herbalist
3. battle: enemyIds: [bark_beetle]
4. battle: enemyIds: [shadow_wolf]
報酬カード（3択）: Card 1: mossweave_vest（防具 DEF 6 / HP 25） / Card 2: forest_breath / Card 3: verdant_brooch
rewardPool（step 2 上限以内）:hunters_shortblade, thornwood_spear, travelers_leather, mossweave_vest, ember_toss, forest_breath, sap_shot, venom_sting, hunters_badge, verdant_brooch
Floor 8: 巨樹の根の休息所（Realm 1 - Standard / step 2 / Rest確定階）
タイトル: 巨樹の根の休息所
サブタイトル: 3F以来の安息の地。10Fの琥珀の巨兵との決戦を前に、体力と消耗品を整える階層
エンカウンター構成（計3戦＋1 Restイベント）:
1. battle: enemyIds: [forest_goblin]
2. battle: enemyIds: [thorn_sprout]
3. event: eventId: sunlit_clearing（Restイベント・確定出現）
4. battle: enemyIds: [toxic_slime]
報酬カード（3択）: Card 1: thornwood_spear / Card 2: bark_guard / Card 3: verdant_brooch
rewardPool（step 2 上限以内）:hunters_shortblade, thornwood_spear, travelers_leather, mossweave_vest, quick_slash, sweeping_arc, forest_breath, bark_guard, verdant_brooch
Floor 9: 琥珀の回廊（Realm 1 - Standard / step 2）
タイトル: 琥珀の回廊
サブタイトル: 樹液が結晶化した琥珀が壁面を覆い、Block 1 の集大成となる関門が近づく回廊
エンカウンター構成（計3戦＋1イベント）:
1. battle: enemyIds: [shadow_wolf]
2. event: eventId: verdant_shrine
3. battle: enemyIds: [forest_wisp]
4. battle: enemyIds: [vine_stalker]
報酬カード（3択）: Card 1: mossweave_vest / Card 2: sap_shot / Card 3: verdant_brooch
rewardPool（step 2 上限以内）:hunters_shortblade, thornwood_spear, travelers_leather, mossweave_vest, ember_toss, bark_guard, sap_shot, venom_sting, hunters_badge, verdant_brooch
Floor 10: 琥珀の祭壇（Realm 1 - Miniboss / step 2）
タイトル: 琥珀の祭壇
サブタイトル: 黄金色の結晶に守られた祭壇にて、Block 1 を締めくくる琥珀の巨兵が立ち塞がる
エンカウンター構成（計2戦＋1イベント＋1ミニボス）:
1. battle: enemyIds: [forest_wisp]
2. event: eventId: wandering_herbalist
3. battle: enemyIds: [vine_stalker]
4. miniboss: enemyIds: [amber_golem]（10F専用Miniboss・1体のみ）
ミニボス固有報酬（消耗品枠）: amber_tonic（琥珀の霊薬）
報酬カード（3択）: Card 1: thornwood_spear / Card 2: venom_sting / Card 3: verdant_brooch
rewardPool（step 2 上限以内）:hunters_shortblade, thornwood_spear, travelers_leather, mossweave_vest, quick_slash, ember_toss, sweeping_arc, forest_breath, bark_guard, sap_shot, venom_sting, hunters_badge, verdant_brooch


=== 指示おわり ===
