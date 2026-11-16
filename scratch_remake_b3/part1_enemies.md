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

## パート1/5：敵10種とスプライトの登録

- 下記の通常敵8種・ミニボス2体を src/extensible/enemies/enemyRegistry.ts に登録する。ミニボス2体は既存のミニボスエントリと同じ形式（isBoss: true）で登録する。
- **goldReward は付けない**（未指定時はエンジン側の式で算出される仕様）。
- 新規スプライト5種（fungal_shaman / stag_carapace / rime_sprite / blighted_lizard / myconid_sovereign）は、説明文とパレットから共通ルールに従ってマトリクスを描き起こし、spriteRegistry / matrixRegistry に登録する。パレット名はスプライトと同名にする。
- 流用指定の敵（humus_slime / feral_hound / ancient_watchman / canopy_stalker / verdant_colossus）は既存の spriteId / palette を使う（いずれも登録済みのはず。着手前に確認すること）。
- フロアデータ・アイテム・イベントはこのパートでは変更しない。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 3 (1/5): enemies and sprites`

## 敵データ（通常敵・前半4種）

1. キノコ・シャマン (fungal_shaman)
表示名: キノコ・シャマン
ステータス: HP 76 / ATK 15 / DEF 5
属性: weakness: fire / resistance: void
スプライト（新規）: 紫色の発光する傘を被った小柄な菌類の呪術師。木の杖を両手で構えた前傾ポーズ。輪郭は濃紺紫、傘と衣は鮮やかな紫、胞子の模様に淡いラベンダーを使用。
palette: ["#00000000", "#1e162b", "#7b2cbf", "#e0aaff"]
行動表:
Phase 1 (hpThresholdPercent: 100):
毒胞子の呪弾 (type: attack, weight: 60, damageMultiplier: 0.95, statusId: poison, statusValue: 4, statusDuration: 2, logMessage: "キノコ・シャマンが紫の胞子弾を放ち、毒を与えた！")
菌糸の祈り (type: buff, weight: 40, statusId: def_buff, statusValue: 20, statusDuration: 2, logMessage: "キノコ・シャマンの周囲に菌糸の膜が張り、防御力が上がった！")
Phase 2 (hpThresholdPercent: 45):
呪杖の乱打 (type: attack, weight: 70, damageMultiplier: 1.35, logMessage: "キノコ・シャマンが杖を振り回し、激しい連撃を浴びせた！")
衰弱の煙 (type: debuff, weight: 30, statusId: atk_debuff, statusValue: 20, statusDuration: 2, logMessage: "キノコ・シャマンが濃い胞子煙を撒き、攻撃力を下げた！")
2. 腐葉スライム (humus_slime)
表示名: 腐葉スライム
ステータス: HP 82 / ATK 16 / DEF 6
属性: weakness: physical / resistance: ice
スプライト（流用）: spriteId: slime / palette: emerald_slime
行動表:
Phase 1 (hpThresholdPercent: 100):
泥濘の体当たり (type: attack, weight: 65, damageMultiplier: 1.0, logMessage: "腐葉スライムが重い粘液の塊をぶつけてきた！")
落葉の防壁 (type: buff, weight: 35, statusId: shield, statusValue: 12, statusDuration: 2, logMessage: "腐葉スライムが周囲の枯葉を取り込み、障壁を張った！")
Phase 2 (hpThresholdPercent: 45):
腐食液の飛沫 (type: attack, weight: 70, damageMultiplier: 1.3, statusId: def_debuff, statusValue: 20, statusDuration: 2, logMessage: "腐葉スライムの酸が防具を溶かし、防御力を下げた！")
粘着トラップ (type: debuff, weight: 30, statusId: atk_debuff, statusValue: 15, statusDuration: 2, logMessage: "足元に絡みついた粘液で攻撃の勢いが鈍った！")
3. 大顎のクワガタ (stag_carapace)
表示名: 大顎のクワガタ
ステータス: HP 88 / ATK 16 / DEF 7
属性: weakness: physical / resistance: fire
スプライト（新規）: 左右に大きく張り出した大顎と分厚い甲殻を持つ大型甲虫。脚を広げて威嚇する正面寄りのポーズ。焦げ茶の輪郭に暗褐色の甲殻、関節と縁のハイライトに淡い黄土色を使用。
palette: ["#00000000", "#1a1817", "#4a3f35", "#d4a373"]
行動表:
Phase 1 (hpThresholdPercent: 100):
大顎の挟撃 (type: attack, weight: 60, damageMultiplier: 1.0, logMessage: "大顎のクワガタが巨大な顎で力強く挟み込んだ！")
甲殻硬化 (type: buff, weight: 40, statusId: def_buff, statusValue: 25, statusDuration: 2, logMessage: "大顎のクワガタが姿勢を低くし、甲殻の守りを固めた！")
Phase 2 (hpThresholdPercent: 50):
剛角の突進 (type: attack, weight: 70, damageMultiplier: 1.4, logMessage: "大顎のクワガタが頭を下げて一直線に突進してきた！")
砕甲の一噛み (type: attack, weight: 30, damageMultiplier: 1.15, statusId: def_debuff, statusValue: 20, statusDuration: 2, logMessage: "大顎の一撃が防具に亀裂を入れ、防御力を低下させた！")
4. 霧氷の精 (rime_sprite)
表示名: 霧氷の精
ステータス: HP 72 / ATK 17 / DEF 4
属性: weakness: fire / resistance: ice
スプライト（新規）: 菱形の氷晶を背負って宙に浮く人型の小精霊。片手を前に伸ばして冷気を放つポーズ。深い紺の輪郭に水色の胴体、氷晶の輝きに白に近いアイスブルーを使用。
palette: ["#00000000", "#1b263b", "#48cae4", "#e0fbfc"]
行動表:
Phase 1 (hpThresholdPercent: 100):
氷柱の礫 (type: attack, weight: 65, damageMultiplier: 1.0, logMessage: "霧氷の精が鋭い氷の礫を連続で撃ち出した！")
氷霧のベール (type: buff, weight: 35, statusId: shield, statusValue: 12, statusDuration: 2, logMessage: "霧氷の精が冷気の障壁を纏った！")
Phase 2 (hpThresholdPercent: 45):
凍てつく抱擁 (type: attack, weight: 30, damageMultiplier: 1.1, statusId: freeze, statusValue: 1, statusDuration: 1, logMessage: "霧氷の精の冷気が全身を凍らせ、動きを封じた！")
吹雪の舞 (type: attack, weight: 70, damageMultiplier: 1.35, logMessage: "霧氷の精が冷たい突風を巻き起こして切り裂いた！")

## 敵データ（通常敵・後半4種）

5. 樹海の野犬 (feral_hound)
表示名: 樹海の野犬
ステータス: HP 78 / ATK 19 / DEF 4
属性: weakness: nature / resistance: void
スプライト（流用）: spriteId: wolf / palette: shadow_wolf
行動表:
Phase 1 (hpThresholdPercent: 100):
飢えた噛みつき (type: attack, weight: 65, damageMultiplier: 1.0, logMessage: "樹海の野犬が素早く飛びかかり、鋭い牙を突き立てた！")
群れの遠吠え (type: buff, weight: 35, statusId: atk_buff, statusValue: 20, statusDuration: 2, logMessage: "樹海の野犬が鋭く吠え、攻撃力が高まった！")
Phase 2 (hpThresholdPercent: 45):
狂乱の連爪 (type: attack, weight: 75, damageMultiplier: 1.4, logMessage: "樹海の野犬が容赦ない連続引っかきを繰り出した！")
威嚇の唸り (type: debuff, weight: 25, statusId: atk_debuff, statusValue: 20, statusDuration: 2, logMessage: "樹海の野犬の凄まじい殺気に圧され、攻撃力が鈍った！")
6. 古樹の哨兵 (ancient_watchman)
表示名: 古樹の哨兵
ステータス: HP 92 / ATK 17 / DEF 7
属性: weakness: fire / resistance: ice
スプライト（流用）: spriteId: treant / palette: ancient_bark
行動表:
Phase 1 (hpThresholdPercent: 100):
巨枝の打ち下ろし (type: attack, weight: 60, damageMultiplier: 1.0, logMessage: "古樹の哨兵が太い枝を振り下ろした！")
樹皮の防護 (type: buff, weight: 40, statusId: shield, statusValue: 14, statusDuration: 2, logMessage: "古樹の哨兵が硬い樹皮で身を覆い、障壁を展開した！")
Phase 2 (hpThresholdPercent: 50):
大根の締め上げ (type: attack, weight: 65, damageMultiplier: 1.4, statusId: atk_debuff, statusValue: 20, statusDuration: 2, logMessage: "地中から伸びた根が絡みつき、攻撃力を奪った！")
古木の怒り (type: buff, weight: 35, statusId: atk_buff, statusValue: 25, statusDuration: 2, logMessage: "古樹の哨兵が枝葉を震わせ、攻撃力を大きく上げた！")
7. 深緑の暗殺者 (canopy_stalker)
表示名: 深緑の暗殺者
ステータス: HP 80 / ATK 20 / DEF 5
属性: weakness: nature / resistance: void
スプライト（流用）: spriteId: goblin / palette: forest_goblin
行動表:
Phase 1 (hpThresholdPercent: 100):
影からの一刺し (type: attack, weight: 65, damageMultiplier: 1.05, logMessage: "深緑の暗殺者が死角から素早く短剣を突き出した！")
毒塗り (type: buff, weight: 35, statusId: flat_atk_up, statusValue: 3, statusDuration: 3, logMessage: "深緑の暗殺者が刃に魔力を纏わせ、威力を高めた！")
Phase 2 (hpThresholdPercent: 45):
致命の毒刃 (type: attack, weight: 70, damageMultiplier: 1.35, statusId: poison, statusValue: 4, statusDuration: 2, logMessage: "深緑の暗殺者の毒刃が急所を掠め、猛毒を流し込んだ！")
煙幕散布 (type: debuff, weight: 30, statusId: atk_debuff, statusValue: 20, statusDuration: 2, logMessage: "深緑の暗殺者が煙幕を投げ、視界を奪った！")
8. 呪木のトカゲ (blighted_lizard)
表示名: 呪木のトカゲ
ステータス: HP 86 / ATK 18 / DEF 6
属性: weakness: ice / resistance: fire
スプライト（新規）: 背中に枯れ枝状の突起と苔を生やした四足歩行の大型トカゲ。長い尾をうねらせて口を開けた威嚇ポーズ。深い森緑の輪郭に苔緑の鱗、背中と牙のハイライトに灰白を使用。
palette: ["#00000000", "#1b2e1b", "#588157", "#dad7cd"]
行動表:
Phase 1 (hpThresholdPercent: 100):
火炎の吐息 (type: attack, weight: 60, damageMultiplier: 1.0, statusId: burn, statusValue: 4, statusDuration: 2, logMessage: "呪木のトカゲが熱を帯びた息を吐き、火傷を負わせた！")
鱗の威嚇 (type: buff, weight: 40, statusId: def_buff, statusValue: 20, statusDuration: 2, logMessage: "呪木のトカゲが背の突起を逆立て、防御力を上げた！")
Phase 2 (hpThresholdPercent: 45):
大尾の薙ぎ払い (type: attack, weight: 70, damageMultiplier: 1.4, logMessage: "呪木のトカゲが太い尾を叩きつけて吹き飛ばした！")
焦熱の咆哮 (type: debuff, weight: 30, statusId: def_debuff, statusValue: 20, statusDuration: 2, logMessage: "呪木のトカゲの咆哮に怯み、防御が崩れた！")

## 敵データ（ミニボス2体）

1. 胞子王マイコニド (myconid_sovereign)【Miniboss / 25F専用】
表示名: 胞子王マイコニド
ステータス: HP 90 / ATK 19 / DEF 6
属性: weakness: fire / resistance: void
スプライト（新規）: 王冠のように尖った巨大な傘と、マントのように垂れ下がる菌糸の衣を纏った長身のキノコ王。片手を掲げて胞子を操る威厳あるポーズ（通常敵の fungal_shaman とは体格・王冠・配色で明確に差別化）。深紫の輪郭に濃紫の体色、発光する斑点と王冠にピンクを使用。
palette: ["#00000000", "#240046", "#9d4edd", "#ff9ebb"]
行動表:
Phase 1 (hpThresholdPercent: 100):
王の菌糸鞭 (type: attack, weight: 60, damageMultiplier: 1.0, statusId: poison, statusValue: 4, statusDuration: 2, logMessage: "胞子王マイコニドが菌糸の鞭を振るい、毒を浴びせた！")
胞子の王冠 (type: buff, weight: 40, statusId: shield, statusValue: 16, statusDuration: 2, logMessage: "胞子王マイコニドが濃密な胞子の障壁を展開した！")
Phase 2 (hpThresholdPercent: 45):
胞子嵐の裁き (type: attack, weight: 70, damageMultiplier: 1.45, logMessage: "胞子王マイコニドが部屋全体を覆う胞子の嵐を解き放った！")
精神汚染 (type: debuff, weight: 30, statusId: atk_debuff, statusValue: 20, statusDuration: 2, logMessage: "胞子王マイコニドの幻覚胞子により、攻撃力が削がれた！")
2. 深緑の巨像 (verdant_colossus)【Miniboss / 30F専用】
表示名: 深緑の巨像
ステータス: HP 95 / ATK 20 / DEF 7
属性: weakness: fire / resistance: ice
スプライト（流用）: spriteId: colossus / palette: molten_iron（通常敵に colossus 未使用・専用配色）
行動表:
Phase 1 (hpThresholdPercent: 100):
巨像の鉄槌 (type: attack, weight: 60, damageMultiplier: 1.05, logMessage: "深緑の巨像が巨大な石腕を叩きつけた！")
古代の守護陣 (type: buff, weight: 40, statusId: def_buff, statusValue: 25, statusDuration: 2, logMessage: "深緑の巨像の装甲が輝き、防御力が大きく上昇した！")
Phase 2 (hpThresholdPercent: 50):
粉砕の踏みつけ (type: attack, weight: 65, damageMultiplier: 1.45, statusId: def_debuff, statusValue: 20, statusDuration: 2, logMessage: "深緑の巨像の踏みつけが大地を割り、防御を砕いた！")
炉心の過熱 (type: buff, weight: 35, statusId: atk_buff, statusValue: 25, statusDuration: 2, logMessage: "深緑の巨像の核が赤熱し、攻撃力が高まった！")
