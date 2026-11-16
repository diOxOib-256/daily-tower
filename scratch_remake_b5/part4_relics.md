# リメイク Block 5 分割実装（全5パート）— パート4：レリック2種・消耗品2種・新規効果2件

## 共通ルール
- 変更は `src/extensible/` 配下のみ。`src/core/` は変更禁止（turn_start の効果評価は既に配線済みで、追加の配線は不要）。
- ゲーム内UIに開発者向け文言・変更履歴を入れない。
- 完了条件：`npm test` 全件パス、`npm run build` 成功、その状態で main へ push。
- 完了報告には「変更したファイル一覧」「テスト結果とビルド結果」「指示から変えた点があればその内容」を書くこと。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 5 (4/5): relics, consumables and effects`

## スプライト描画ルール（新規スプライト共通）
- 32×32 の number 配列（値は 0〜3）。0=透明、1/2/3 はパレットの [輪郭, 本体, ハイライト] に対応。
- シルエットを色2でしっかり塗りつぶす（線画にしない）。被写体の幅は22セル以上、塗り面積は全体の35%以上を目安。
- 各行ちょうど32要素・全32行を数えて確認すること。
- アイテムの spriteId はアイテムIDそのもの（接頭辞なし）。

## このパートの作業

### 1. 新規効果2件を `src/extensible/effects/effectRegistry.ts` に追加

#### worldtree_dewstone（世界樹の雫石の効果）
- trigger: 'turn_start'
- handler: 条件なしで毎ターン発動し、次を返す：
  - applyStatusToPlayer: { statusId: 'regen', value: 3, duration: 2 }
  - logMessage: `[レリック:世界樹の雫石] 雫の霊力が染み出し、再生(3%)を付与！`

#### leyline_astrolabe（霊脈の羅針盤の効果）
- trigger: 'turn_start'
- handler: `ctx.turnNumber !== 2` のときは `{ logMessage: '' }` を返して何もしない（既存の bookmark_charm と同じ書き方）。2ターン目開始時のみ次を返す：
  - applyStatusToPlayer: { statusId: 'flat_atk_up', value: 4, duration: 3 }
  - logMessage: `[レリック:霊脈の羅針盤] 羅針盤が霊脈を指し、攻撃力+4！`

### 2. レリック2種を RELIC_CATALOG に追加

#### worldtree_dewstone（世界樹の雫石）
- kind: 'relic', effectId: 'worldtree_dewstone', salvageGold: 30
- description: '世界樹の朝露が結晶化した翠の宝玉。戦闘中、雫の霊力が絶えず染み出し、傷を癒やし続ける。'
- スプライト（新規）: 雫型の透明感ある翠の宝玉の護符。palette: ["#14211d", "#40916c", "#d8f3dc"]

#### leyline_astrolabe（霊脈の羅針盤）
- kind: 'relic', effectId: 'leyline_astrolabe', salvageGold: 32
- description: '樹海の魔力脈を指し示す黄金の天球儀。戦闘中、2ターン目の開始時に攻撃力を底上げする。'
- スプライト（新規）: 精密な環が重なる黄金の小型天球儀。palette: ["#2b1b12", "#e09f3e", "#fef3c7"]

### 3. 消耗品2種を CONSUMABLE_CATALOG に追加（salvageGold は付けない）

#### paladin_cordial（近衛の聖薬）
- kind: 'consumable', healPercent: 60, cleanse: true, maxCharges: 2
- description: '世界樹の近衛騎士団に伝わる秘伝の霊薬。重傷を瞬時に癒やしあらゆる弱体を浄化する。'
- スプライト（新規）: 黄金の王冠栓がついた翠ガラスの霊薬瓶。palette: ["#14211d", "#2a9d8f", "#fefae0"]

#### worldtree_ambrosia（世界樹の霊露）
- kind: 'consumable', healPercent: 65, maxCharges: 2、盾は既存の frost_draught と同じ表現で shield 値 22 / 2ターン
- description: '世界樹の頂から採取された至高の霊露。体力を大きく回復し鉄壁の障壁を纏わせる。'
- スプライト（新規）: 虹色に輝く丸型の水晶瓶に納められた聖なる霊露。palette: ["#1b263b", "#48cae4", "#f8f9fa"]
