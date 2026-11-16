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

## パート3/5：スキル7種の登録

- 下記のスキル7種を SKILL_CATALOG（src/extensible/items/itemCatalog.ts）に、既存エントリと同じ形式で登録する。spriteId はアイテムIDと同名、新規スプライト（説明文から共通ルールで描き起こす）＋新規パレット（パレット名はスプライトと同名）。
- フィールドの付け方（案の「効果」を次の形式に読み替える。全種 salvageGold: 10）：
  - rending_cleave：category: 'attack', damageMultiplier: 1.65, maxChargesPerBattle: 2
  - whirlwind_slash：category: 'attack', targetScope: 'all_enemies', damageMultiplier: 0.85, maxChargesPerBattle: 2, applyStatus: { target: 'enemy', statusId: 'def_debuff', value: 10, duration: 2 }（**案にはない def_debuff の追加は、既存の sweeping_arc / gale_sweep との差別化のための確定仕様。この指示が正**）
  - spore_ignition：category: 'attack', damageMultiplier: 1.4, applyStatus: { target: 'enemy', statusId: 'burn', value: 5, duration: 2 }, maxChargesPerBattle: 2
  - elder_regrowth：category: 'heal', applyStatus: { target: 'self', statusId: 'regen', value: 12, duration: 3, cleanse: true }, maxChargesPerBattle: 2
  - shell_fortress：category: 'buff', applyStatus: { target: 'self', statusId: 'shield', value: 25, duration: 2 }, maxChargesPerBattle: 2（**案の「最大HPの18%」は盾の仕組み上固定値で表すため 25 とする。これが確定仕様**）
  - verdant_war_cry：category: 'buff', applyStatus: { target: 'self', statusId: 'atk_buff', value: 25, duration: 2 }, maxChargesPerBattle: 2
  - corrosive_haze：category: 'debuff', targetScope: 'all_enemies', damageMultiplier: 0.7, applyStatus: { target: 'enemy', statusId: 'def_debuff', value: 20, duration: 2 }, maxChargesPerBattle: 2
- 説明文は案の「説明文」をそのまま使う（whirlwind_slash の説明文には防御低下の一文を自然に足してよい）。
- 敵・装備・イベント・フロアは変更しない。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 3 (3/5): skills`

## スキルデータ

1. 裂空斬 (rending_cleave): カテゴリ: attack / maxChargesPerBattle: 2 / 効果: 敵単体にダメージ倍率 1.65倍 を与える / 説明文: 渾身の力を込めて武器を振り下ろし、敵単体に大ダメージを与える主力斬撃。 / スプライト（新規）: 斜めに走る鋭い白銀の斬撃エフェクト。黒の輪郭に青銀の軌跡、中心に白を使用。palette: ["#00000000", "#1f2421", "#4ea8de", "#f8f9fa"]
2. 旋風刃 (whirlwind_slash): カテゴリ: attack / targetScope: all_enemies / maxChargesPerBattle: 2 / 効果: 敵全体にダメージ倍率 0.85倍 を与える / 説明文: 嵐のような連続回転斬りで、周囲の敵すべてを同時に切り裂く範囲技。 / スプライト（新規）: 渦を巻く青い風の刃。濃紺の輪郭に鮮やかな水色、風切りの芯に白水色を使用。palette: ["#00000000", "#1b3a4b", "#48cae4", "#caf0f8"]
3. 胞子火炎 (spore_ignition): カテゴリ: attack / maxChargesPerBattle: 2 / 効果: 敵単体にダメージ倍率 1.4倍 を与え、対象（enemy）に burn（値: 5, ターン数: 2）を付与する / 説明文: 引火性の胞子を散らして着火し、大ダメージとともに激しい火傷を負わせる。 / スプライト（新規）: 燃え上がる橙色の火球と飛び散る火花。焦げ茶の輪郭に朱赤の炎、中心に黄金色を使用。palette: ["#00000000", "#370617", "#dc2f02", "#ffba08"]
4. 古樹の再生 (elder_regrowth): カテゴリ: heal / maxChargesPerBattle: 2 / 効果: 自身に regen（総回復量: 最大HPの 36% を 3ターンに等分 ＝ 毎ターン 12%回復）を付与し、自身のデバフを全解除（cleanse）する / 説明文: 古樹の生命力を呼び覚まし、状態異常を払いながら数ターンにわたり傷を癒やす。 / スプライト（新規）: 光を放つ緑の若葉の輪。濃緑の輪郭に鮮やかな翠、中心の輝きに淡い白緑を使用。palette: ["#00000000", "#1b4332", "#52b788", "#d8f3dc"]
5. 甲殻の陣 (shell_fortress): カテゴリ: buff / maxChargesPerBattle: 2 / 効果: 自身（self）に shield（値: 最大HPの 18%, ターン数: 2）を付与する / 説明文: 硬質な魔力甲殻を全身に展開し、強敵の必殺の一撃を受け止める防御スキル。 / スプライト（新規）: 六角形の紋様が浮かぶ重厚な盾のアイコン。濃茶の輪郭に鉄褐色、縁の輝きにクリーム色を使用。palette: ["#00000000", "#241914", "#6b4423", "#ddb892"]
6. 深緑の咆哮 (verdant_war_cry): カテゴリ: buff / maxChargesPerBattle: 2 / 効果: 自身（self）に atk_buff（値: 25, ターン数: 2）を付与する / 説明文: 闘気を解き放って戦意を高め、攻撃力を大きく引き上げる強化スキル。 / スプライト（新規）: 上昇する赤い闘気のオーラと衝撃波。暗赤の輪郭に朱色、中心の輝きに黄金色を使用。palette: ["#00000000", "#370617", "#e76f51", "#fde68a"]
7. 腐食の霧 (corrosive_haze): カテゴリ: debuff / targetScope: all_enemies / maxChargesPerBattle: 2 / 効果: 敵全体にダメージ倍率 0.7倍 を与え、対象（enemy）に def_debuff（値: 20, ターン数: 2）を付与する / 説明文: 敵全体を包む腐食性の霧を放ち、外殻や防具を脆くする範囲弱体スキル。 / スプライト（新規）: 渦巻く紫色の毒霧のアイコン。濃紫の輪郭に紫の霧、ハイライトに薄紫を使用。palette: ["#00000000", "#1e162b", "#7209b7", "#e0aaff"]
