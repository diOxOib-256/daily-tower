# リメイク Block 5 分割実装（全5パート）— パート3：スキル7種

## 共通ルール
- 変更は `src/extensible/` 配下のみ。`src/core/` は変更禁止。
- ゲーム内UIに開発者向け文言・変更履歴を入れない。
- 完了条件：`npm test` 全件パス、`npm run build` 成功、その状態で main へ push。
- 完了報告には「変更したファイル一覧」「テスト結果とビルド結果」「指示から変えた点があればその内容」を書くこと。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 5 (3/5): skills`

## スプライト描画ルール（新規スプライト共通）
- 32×32 の number 配列（値は 0〜3）。0=透明、1/2/3 はパレットの [輪郭, 本体, ハイライト] に対応。
- シルエットを色2でしっかり塗りつぶす（線画にしない）。被写体の幅は22セル以上、塗り面積は全体の35%以上を目安。
- 各行ちょうど32要素・全32行を数えて確認すること。
- アイテムの spriteId はアイテムIDそのもの（接頭辞なし）。

## このパートの作業
`src/extensible/items/itemCatalog.ts` の SKILL_CATALOG に以下を追加し、各スプライトを登録する。全種 maxChargesPerBattle: 2、salvageGold: 10。数値は確定仕様としてそのまま使うこと。

### celestial_cleave（天断の聖剣撃）
- category: 'attack', damageMultiplier: 1.75
- applyStatus: { target: 'enemy', statusId: 'def_debuff', value: 15, duration: 2 }
- description: '全霊を込めた聖剣の一撃で敵を断ち割り、同時に防御を打ち砕く奥義。'
- スプライト（新規）: 黄金と白銀の十字閃光が走る斬撃アイコン。palette: ["#1f2421", "#ffd166", "#f8f9fa"]

### leyline_storm（霊脈の嵐刃）
- category: 'attack', targetScope: 'all_enemies', damageMultiplier: 0.85
- applyStatus: { target: 'enemy', statusId: 'def_debuff', value: 15, duration: 2 }
- description: '霊脈の魔力を解き放ち、敵全体を斬り刻みながら防具を脆くする範囲奥義。'
- スプライト（新規）: 翠とシアンの無数の風刃が吹き荒れるアイコン。palette: ["#14211d", "#2ec4b6", "#e0fbfc"]

### inferno_verdict（業火の審判）
- category: 'attack', damageMultiplier: 1.6
- applyStatus: { target: 'enemy', statusId: 'burn', value: 6, duration: 2 }
- description: '凝縮した紅蓮の業火を叩きつけ、大ダメージと激しい燃焼を与える火属性奥義。'
- スプライト（新規）: 燃え盛る火柱と黄金の火の粉のアイコン。palette: ["#370617", "#e63946", "#fff3b0"]

### worldtree_grace（世界樹の恩寵）
- category: 'heal', cleanse: true
- applyStatus: { target: 'self', statusId: 'regen', value: 8, duration: 5 }
- description: '世界樹の深い慈愛を受け、状態異常を浄化しながら5ターンにわたり生命力を回復し続ける。'
- スプライト（新規）: 黄金の光を放つ若葉の聖冠アイコン。palette: ["#14211d", "#52b788", "#fefae0"]

### primordial_bastion（原初樹の聖壁）
- category: 'buff'
- applyStatus: { target: 'self', statusId: 'shield', value: 35, duration: 2 }
- description: '原初樹の揺るぎない守護を纏い、頂点ボスの猛攻をも防ぎ切る鉄壁の防御奥義。'
- スプライト（新規）: 翠の宝玉が嵌まった黄金の大盾アイコン。palette: ["#14211d", "#e09f3e", "#d8f3dc"]

### apex_overdrive（限界突破の闘気）
- category: 'buff'
- applyStatus: { target: 'self', statusId: 'atk_buff', value: 30, duration: 3 }
- description: '肉体の限界を超えた闘気を燃やし、3ターンの間攻撃力を極限まで高める強化奥義。'
- スプライト（新規）: 黄金と真紅のオーラが渦巻く闘気アイコン。palette: ["#370617", "#dc2f02", "#fef3c7"]

### glacial_shackle（氷結の呪縛）
- category: 'debuff', targetScope: 'all_enemies', damageMultiplier: 0.8
- applyStatus: { target: 'enemy', statusId: 'atk_debuff', value: 20, duration: 2 }
- description: '凍てつく霊気の鎖で敵全体を縛り上げ、ダメージを与えつつ攻撃力を大きく削ぐ範囲弱体奥義。'
- スプライト（新規）: 氷の鎖と冷気の結晶が交差するアイコン。palette: ["#1b263b", "#48cae4", "#f8f9fa"]
