# リメイク Block 4 分割実装 — パート4：レリック2種・消耗品2種と新規効果2件

## 共通ルール
- 変更は `src/extensible/` 配下のみ（このパートも core 変更なし）。完了条件：`npm test` 全件パス＋`npm run build` 成功＋main へ push。完了報告には変更ファイル一覧とテスト/ビルド結果、指示から変えた点があれば明記すること。
- スプライトは見た目の説明文から 32×32 行列（値 0〜3）を描き起こす。パレットは末尾3色を [輪郭, 主色, ハイライト] として登録し、値 1=輪郭・2=主色・3=ハイライト・0=透明。シルエットは主色で面として塗り、幅22セル以上・塗り35%以上を目安にし、線画にしない。文字や記号は描かない。
- アイテムの spriteId はアイテム ID そのまま。消耗品に salvageGold は付けない。

## 作業1：`src/extensible/effects/effectRegistry.ts` に新規効果を2件登録する
### hornet_stinger（大蜂の毒針）
- trigger: 'on_attack'
- 条件：`ctx.turnNumber !== 1` のときは何もしない（空の logMessage で返す。既存の bookmark_charm と同じ書き方）。ターン1のときだけ発動する。
- 発動時：applyStatusToEnemy { statusId: 'poison', value: 5, duration: 2 }、logMessage「[レリック:大蜂の毒針] 最初の攻撃に乗せて毒針の毒(5)を流し込んだ！」
### root_medallion（古根のメダル）※確定仕様（案から変更）
- trigger: 'battle_start'
- 発動時：applyStatusToPlayer { statusId: 'regen', value: 5, duration: 3 }、logMessage「[レリック:古根のメダル] 古根の生命力が宿り、数ターンにわたり傷を癒やす(5%/3T)！」

## 作業2：`src/extensible/items/itemCatalog.ts` の RELIC_CATALOG / CONSUMABLE_CATALOG へ登録し、各スプライトを新規登録する
### レリック
- hornet_stinger（大蜂の毒針）: effectId 'hornet_stinger', salvageGold 26, description「琥珀バチの鋭い毒針を加工した護符。戦闘中の最初の攻撃時、敵に毒を付与する。」／見た目：金の留め具がついた鋭い琥珀色の針の護符。palette ["#2b1b12", "#e09f3e", "#fff3b0"]
- root_medallion（古根のメダル）: effectId 'root_medallion', salvageGold 28, description「古代樹の年輪が刻まれた石のメダル。戦闘が始まると古根の生命力が宿り、数ターンにわたり傷を癒やす。」／見た目：年輪の彫刻が入った円形の石メダル。palette ["#1c2220", "#5b6e67", "#a7c4b5"]
### 消耗品
- royal_amber_jelly（女王の琥珀蜜）: healPercent 55, cleanse: true, maxCharges 2, description「琥珀の女王バチが蓄えていた最高純度の蜜。深手を大きく癒やし弱体を浄化する。」／見た目：六角形のガラス壺に入った濃厚な黄金の蜜。palette ["#2b1b12", "#f59e0b", "#fef3c7"]
- warden_sap_vial（魔導樹の霊液）: healPercent 60, applyStatus { statusId: 'shield', value: 20, duration: 2 }, maxCharges 2, description「古根の魔導樹の核から滴る蒼い霊液。体力を大幅に回復し強固な魔力障壁を張る。」／見た目：細長い水晶の小瓶に満ちた蒼い霊液。palette ["#1b263b", "#00b4d8", "#caf0f8"]

## コミット
`[CF-Pages-Skip] Remake Block 4 (4/5): relics and consumables`
