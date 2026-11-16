# リメイク Block 5 分割実装（全5パート）— パート2：武器・防具4種

## 共通ルール
- 変更は `src/extensible/` 配下のみ。`src/core/` は変更禁止。
- ゲーム内UIに開発者向け文言・変更履歴を入れない。
- 完了条件：`npm test` 全件パス、`npm run build` 成功、その状態で main へ push。
- 完了報告には「変更したファイル一覧」「テスト結果とビルド結果」「指示から変えた点があればその内容」を書くこと。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 5 (2/5): weapons and armor`

## スプライト描画ルール（新規スプライト共通）
- 32×32 の number 配列（値は 0〜3）。0=透明、1/2/3 はパレットの [輪郭, 本体, ハイライト] に対応。
- シルエットを色2でしっかり塗りつぶす（線画にしない）。被写体の幅は22セル以上、塗り面積は全体の35%以上を目安。
- 各行ちょうど32要素・全32行を数えて確認すること。
- アイテムの spriteId はアイテムIDそのもの（接頭辞なし）という既存の慣例に従う。

## このパートの作業
`src/extensible/items/itemCatalog.ts` の WEAPON_CATALOG / ARMOR_CATALOG に以下を追加し、各スプライトを matrixRegistry / spriteRegistry に登録する。

### worldtree_greatsword（世界樹の断罪剣）武器
- kind: 'weapon', atk: 24, element: 'physical', salvageGold: 30
- description: '鋼鉄と世界樹の芯材を鍛え上げた大剣。Realm 1 における物理武器の到達点。'
- スプライト（新規）: 黄金の鍔と分厚い白銀の刀身を持つ両手大剣。palette: ["#1f2421", "#8d99ae", "#ffd166"]

### primordial_spear（原初樹の霊槍）武器
- kind: 'weapon', atk: 25, element: 'nature', salvageGold: 32
- description: '原初の霊木から削り出された聖なる長槍。濃密な自然魔力を纏い敵を貫く。'
- スプライト（新規）: 翠の魔力結晶を穂先に宿した優雅な長槍。palette: ["#14211d", "#2d6a4f", "#b7e4c7"]

### paladin_verdant_armor（近衛の翠鋼鎧）防具
- kind: 'armor', def: 9, maxHpBonus: 60, salvageGold: 30
- description: '世界樹の近衛騎士が纏う翠鋼の板金鎧。高い防御力と強靭な生命力を授ける。'
- スプライト（新規）: 黄金の縁取りが施された重厚な翠鋼の胴鎧。palette: ["#14211d", "#2d6a4f", "#ffd166"]

### primordial_aegis_plate（原初樹の聖鎧）防具
- kind: 'armor', def: 9, maxHpBonus: 65, salvageGold: 32
- description: '原初樹の加護を宿した最高峰の聖鎧。過酷な頂上決戦をも耐え抜く鉄壁の守り。'
- スプライト（新規）: 蒼白い魔力石を胸に抱く神聖な重装鎧。palette: ["#1b263b", "#4ea8de", "#e0fbfc"]
