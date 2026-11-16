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

## パート4/5：レリック2種・消耗品2種・新規効果2種と、turn_start 効果の配線

### A. 新規効果2種（src/extensible/effects/effectRegistry.ts）
既存エントリと同じ形式で追加する。
- mycelial_crystal：trigger: 'turn_start'。handler は ctx.turnNumber !== 3 のとき { logMessage: '' } を返し（栞の護符 bookmark_charm の条件分岐と同じ形）、turnNumber === 3 のとき applyStatusToPlayer: { statusId: 'atk_buff', value: 15, duration: 2 } と logMessage `[レリック:菌糸の結晶] 蓄えた魔力が解き放たれ、攻撃力が15%上昇(2T)！` を返す。
- spirit_crest：trigger: 'on_skill_use'。handler は applyStatusToPlayer: { statusId: 'regen', value: 4, duration: 2 } と logMessage `[レリック:精霊樹の紋章] 若葉の癒しが傷を包み始めた！` を返す。**（注意：案の元の効果は shield 5/1T だったが、既存の若葉のブローチ verdant_brooch と重複するため regen に変更済み。この指示が正）**

### B. turn_start 効果の配線（**src/core/CombatEngine.ts のこの1箇所だけ変更を許可する**）
現状、relic 効果は battle_start / on_attack / on_skill_use / battle_victory でしか評価されず、turn_start は発火しない。CombatEngine.executeTurn の「1. Player turn_start」処理（StatusEngine.runPhase の結果を反映し、敗北判定をした直後、「2. Player pre_action」の直前）に、次の趣旨の評価ブロックを挿入する。他の箇所は変更しないこと。
- collectEquippedEffects(loadout) を走査し、eff.trigger === 'turn_start' の効果だけ、ctx（playerCurrentHp: next.player.currentHp, playerMaxHp: next.player.maxHp, playerAtk: next.player.baseAtk, playerDef: loadout.armor.def, enemyCurrentHp / enemyMaxHp は primary の値, turnNumber: next.turn）で handler を呼ぶ。
- res.applyStatusToPlayer があれば StatusEngine.applyStatus(next.player.statuses, ...) で反映し、res.applyStatusToEnemy があれば primary.statuses に反映する。res.healPlayer があれば next.player.currentHp に加算（maxHp でクランプ）。res.logMessage が空でなければ next.logs に追加する。
- battle_start 評価（createBattleSession 内）の実装が手本になる。bonusDamage / grantGold は turn_start では扱わない。

### C. レリック2種（RELIC_CATALOG）
- mycelial_crystal（菌糸の結晶）：effectId: 'mycelial_crystal', salvageGold: 22, 説明文は案のとおり「魔力を蓄えた菌糸の結晶。戦闘が長引くほど持ち主の攻撃力を引き上げる。」
- spirit_crest（精霊樹の紋章）：effectId: 'spirit_crest', salvageGold: 24, 説明文は**次の文に差し替える**：「古樹の加護が刻まれた翠の紋章。スキルを放つたび、癒しの力が数ターンにわたり傷を癒やす。」
- どちらも新規スプライト（説明文から描き起こす）＋新規パレット、spriteId はアイテムIDと同名。

### D. 消耗品2種（CONSUMABLE_CATALOG）
消耗品に salvageGold フィールドはない（付けない）。
- sovereign_nectar（森王の蜜薬）：maxCharges: 2, healPercent: 40, cleanse: true, 説明文は案のとおり。
- colossus_draught（巨像の活力剤）：maxCharges: 2, healPercent: 50, applyStatus: { target: 'self', statusId: 'shield', value: 15, duration: 2 }, 説明文は案のとおり。
- どちらも新規スプライト＋新規パレット、spriteId はアイテムIDと同名。

- 敵・装備・スキル・イベント・フロアは変更しない。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 3 (4/5): relics, consumables, turn-start wiring`

## レリックデータ（スプライト仕様）

1. 菌糸の結晶 (mycelial_crystal): salvageGold: 22 / 説明文: 魔力を蓄えた菌糸の結晶。戦闘が長引くほど持ち主の攻撃力を引き上げる。 / 効果: 発動タイミング turn_start / 条件: 1戦闘に1回（3ターン目開始時） / 効果量: 自身に atk_buff（値: 15, ターン数: 2）を付与 / スプライト（新規）: 紫に透き通った六角柱の結晶。濃紫の輪郭に鮮やかな紫、結晶の反射面に淡い桃色を使用。palette: ["#00000000", "#240046", "#9d4edd", "#f3c4fb"]
2. 精霊樹の紋章 (spirit_crest): salvageGold: 24 / 説明文: 古樹の加護が刻まれた翠の紋章。スキルを放つたび、薄い魔力の盾を纏う。 / 効果: 発動タイミング on_skill_use / 条件: 1ターンに1回まで / 効果量: 自身に shield（値: 5, ターン数: 1）を付与 / スプライト（新規）: 葉を象った丸型の金縁ブローチ。深緑の輪郭に鮮やかな翠、中央の葉脈と縁に淡い金色を使用。palette: ["#00000000", "#1b2e1b", "#52b788", "#fefae0"]
## 消耗品データ（スプライト仕様）

1. 森王の蜜薬 (sovereign_nectar): 効果: 自身のHPを 40% 回復し、すべてのデバフを全解除する（cleanse） / salvageGold: 20 / 説明文: 胞子王が秘蔵していた濃厚な蜜薬。深い傷とあらゆる弱体を瞬時に癒やす。 / スプライト（新規）: 丸底のガラス瓶に注がれた黄金色の蜜薬。茶色の輪郭に琥珀色の液体、ガラスの照り返しにクリーム色を使用。palette: ["#00000000", "#2b1b12", "#f59e0b", "#fef3c7"]
2. 巨像の活力剤 (colossus_draught): 効果: 自身のHPを 50% 回復し、自身に shield（値: 15, ターン数: 2）を付与する / salvageGold: 24 / 説明文: 巨像の核から抽出された高純度の霊液。体力を大きく回復し強固な障壁を張る。 / スプライト（新規）: 角ばった金属栓付きの霊薬瓶。濃紺の輪郭に鮮やかな青緑の液体、ハイライトに白水色を使用。palette: ["#00000000", "#1b263b", "#2ec4b6", "#cbf3f0"]
