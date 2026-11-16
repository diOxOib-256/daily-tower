# リメイク Block 4 分割実装 — パート3：スキル7種

## 共通ルール
- 変更は `src/extensible/` 配下のみ。完了条件：`npm test` 全件パス＋`npm run build` 成功＋main へ push。完了報告には変更ファイル一覧とテスト/ビルド結果、指示から変えた点があれば明記すること。
- スプライトは見た目の説明文から 32×32 行列（値 0〜3）を描き起こす。パレットは末尾3色を [輪郭, 主色, ハイライト] として登録し、値 1=輪郭・2=主色・3=ハイライト・0=透明。シルエットは主色で面として塗り、幅22セル以上・塗り35%以上を目安にし、線画にしない。文字や記号は描かない。
- アイテムの spriteId はアイテム ID そのまま。全スキル salvageGold は 10。

## 作業：`src/extensible/items/itemCatalog.ts` の SKILL_CATALOG へ登録し、各スプライトを新規登録する
- earthshatter_blow（大地砕き）: category 'attack', targetScope 'single_enemy', damageMultiplier 1.75, maxChargesPerBattle 2, **applyStatus { statusId: 'def_debuff', value: 10, duration: 2 }**（確定仕様：対象の防御も下げる）, description「全身の体重を乗せて武器を叩きつけ、敵単体に極大のダメージを与える必殺技。」／見た目：地面を割る黄金と白の衝撃波。palette ["#1f2421", "#f4a261", "#f8f9fa"]
- briar_tempest（茨の嵐）: category 'attack', targetScope 'all_enemies', damageMultiplier 0.85, maxChargesPerBattle 2, applyStatus { statusId: 'poison', value: 4, duration: 2 }, description「無数の毒茨を周囲に吹き荒らし、敵全体にダメージと毒を同時に与える範囲攻撃。」／見た目：紫と緑を帯びた旋回する茨の刃。palette ["#1b2e1b", "#40916c", "#e0aaff"]
- cinder_burst（焦熱爆砕）: category 'attack', targetScope 'single_enemy', damageMultiplier 1.5, maxChargesPerBattle 2, applyStatus { statusId: 'burn', value: 6, duration: 2 }, description「凝縮した火種を敵の目前で爆ぜさせ、大ダメージと激しい火傷を与える火属性スキル。」／見た目：放射状に弾ける紅蓮の爆発。palette ["#370617", "#dc2f02", "#fff3b0"]
- warden_vitality（古代樹の活気）: category 'heal', targetScope 'self', maxChargesPerBattle 2, applyStatus { statusId: 'regen', value: 10, duration: 4 }（毎ターン10%×4ターン＝合計40%）, cleanse: true, description「古代樹の尽きぬ生命力を借り受け、状態異常を払いながら4ターンにわたり回復を続ける。」／見た目：4枚の光る若葉が輪を描く回復の紋章。palette ["#1b4332", "#52b788", "#d8f3dc"]
- amber_aegis（琥珀の霊盾）: category 'buff', targetScope 'self', maxChargesPerBattle 2, applyStatus { statusId: 'shield', value: 30, duration: 2 }（確定仕様：盾は固定値30）, description「黄金の琥珀障壁を全身に展開し、あらゆる強撃を防ぐ鉄壁の防御スキル。」／見た目：黄金色に輝く菱形の大盾アイコン。palette ["#2b1b12", "#f59e0b", "#fef3c7"]
- primal_surge（原初の闘気）: category 'buff', targetScope 'self', maxChargesPerBattle 2, applyStatus { statusId: 'atk_buff', value: 30, duration: 2 }, description「樹海の奥底に眠る野生の力を呼び覚まし、攻撃力を限界まで引き上げる強化スキル。」／見た目：激しく立ち上る赤金のオーラ。palette ["#370617", "#e63946", "#ffba08"]
- wraith_chill（怨霊の凍気）: category 'debuff', targetScope 'all_enemies', damageMultiplier 0.75, maxChargesPerBattle 2, applyStatus { statusId: 'atk_debuff', value: 20, duration: 2 }, description「凍てつく霊気の波を敵全体に浴びせ、攻撃の威力を大きく削ぐ範囲弱体スキル。」／見た目：渦を巻く蒼白い冷気の波。palette ["#161925", "#48cae4", "#e0fbfc"]

## コミット
`[CF-Pages-Skip] Remake Block 4 (3/5): skills`
