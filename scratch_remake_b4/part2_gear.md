# リメイク Block 4 分割実装 — パート2：武器・防具4種

## 共通ルール
- 変更は `src/extensible/` 配下のみ。完了条件：`npm test` 全件パス＋`npm run build` 成功＋main へ push。完了報告には変更ファイル一覧とテスト/ビルド結果、指示から変えた点があれば明記すること。
- スプライトは見た目の説明文から 32×32 行列（値 0〜3）を描き起こす。パレットは末尾3色を [輪郭, 主色, ハイライト] として登録し、値 1=輪郭・2=主色・3=ハイライト・0=透明。シルエットは主色で面として塗り、幅22セル以上・塗り35%以上を目安にし、線画にしない。文字や記号は描かない。
- アイテムの spriteId はアイテム ID そのまま。

## 作業：`src/extensible/items/itemCatalog.ts` の WEAPON_CATALOG / ARMOR_CATALOG へ登録し、各スプライトを新規登録する
### 武器
- rootbreaker_mace（根砕きの戦槌）: atk 22, element 'physical', salvageGold 26, description「古代樹の硬い根をも叩き砕くために鍛えられた重厚な戦槌。」／見た目：太い柄の先に六角柱の重い鉄頭がついた戦槌。palette ["#1f2421", "#6c757d", "#f8f9fa"]
- verdant_halberd（深緑の戟）: atk 23, element 'nature', salvageGold 28, description「精霊樹の力を宿した長柄の戦戟。自然の魔力を纏った刃が敵を断つ。」／見た目：槍穂と斧刃を兼ね備えた優雅な長柄武器。palette ["#1b2e1b", "#40916c", "#b7e4c7"]
### 防具
- amber_scale_mail（琥珀鱗の鎧）: def 8, maxHpBonus 50, salvageGold 26, description「結晶化した琥珀の鱗を幾重にも重ねた堅牢な鎧。」／見た目：黄金色の鱗模様が並ぶ重厚な胴鎧。palette ["#2b1b12", "#d97706", "#fde68a"]
- rootguard_plate（古根の重装鎧）: def 8, maxHpBonus 55, salvageGold 28, description「鉄木と霊石を融合させて作られた最高峰の重鎧。耐久力を大幅に高める。」／見た目：厳つい肩当てと胸の魔力石を備えた重装板金鎧。palette ["#1b263b", "#415a77", "#90e0ef"]

## コミット
`[CF-Pages-Skip] Remake Block 4 (2/5): weapons and armor`
