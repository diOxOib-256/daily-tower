# リメイク Block 5 分割実装（全5パート）— パート1：敵10種とスプライト

Daily Tower のリメイク Block 5（41〜50F）の敵データとスプライトを実装してください。

## 共通ルール（全パート共通）
- 変更は `src/extensible/` 配下のみ。`src/core/` は変更禁止。
- ゲーム内UIに開発者向け文言・変更履歴を入れない。
- 完了条件：`npm test` 全件パス、`npm run build` 成功、その状態で main へ push。
- 完了報告には「変更したファイル一覧」「テスト結果とビルド結果」「指示から変えた点があればその内容」を書くこと。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 5 (1/5): enemies and sprites`

## スプライト描画ルール（新規スプライトを描くパート共通）
- 32×32 の number 配列（値は 0〜3）。0=透明、1/2/3 はパレットの [輪郭, 本体, ハイライト] に対応。
- シルエットを色2でしっかり塗りつぶす（線画にしない）。被写体の幅は22セル以上、塗り面積は全体の35%以上を目安。
- 形が崩れないよう、各行ちょうど32要素・全32行を数えて確認すること。
- パレットは registry に4要素（先頭は透明 "#00000000"）で渡されるが、登録時は後ろ3色を使う既存形式に合わせること。

## このパートの作業
1. `src/extensible/enemies/enemyRegistry.ts` に以下の10種を登録する（primordial_treant は既存エントリの**置き換え**、他9種は新規追加）。goldReward は primordial_treant のみ明示し、他は付けない。
2. 新規スプライト6種を `src/extensible/sprites/matrixRegistry.ts` と `src/extensible/sprites/spriteRegistry.ts` に登録し、新規パレットも登録する。

## 敵データ

### elderwood_specter（古樹の守護霊）通常敵・新規スプライト
- hp 84 / atk 18 / def 5、weakness: fire / resistance: void
- spriteId: elderwood_specter（新規）、palette: ["#14211d", "#2a9d8f", "#b7e4c7"]
- スプライト説明：樹皮の仮面を着け、翠色の霊衣を翻して浮遊する古代の精霊戦士。両手に霊気の刃を構えたポーズ。
- Phase 1 (hpThresholdPercent: 100):
- 霊刃の連撃 (attack, weight 65, damageMultiplier 1.05, logMessage: "古樹の守護霊が翠色の霊刃で素早く斬りつけた！")
- 霊気のベール (buff, weight 35, statusId: shield, statusValue: 16, statusDuration: 2, logMessage: "古樹の守護霊が濃密な霊気の障壁を展開した！")
- Phase 2 (hpThresholdPercent: 45):
- 魂削りの一閃 (attack, weight 70, damageMultiplier 1.45, logMessage: "古樹の守護霊が鋭い霊気の斬撃を叩き込んだ！")
- 衰弱の呪縛 (debuff, weight 30, statusId: atk_debuff, statusValue: 20, statusDuration: 2, logMessage: "古樹の守護霊の霊圧に押され、攻撃力が削がれた！")

### amber_scarab（琥珀晶の甲虫）通常敵・新規スプライト
- hp 92 / atk 17 / def 7、weakness: physical / resistance: fire
- spriteId: amber_scarab（新規）、palette: ["#2b1b12", "#b5651d", "#ffd166"]
- スプライト説明：背甲が透き通った黄金の琥珀で覆われた大型のスカラベ。前脚を上げて威嚇する重厚なシルエット。
- Phase 1 (100):
- 琥珀甲の突進 (attack, 60, 1.05, "琥珀晶の甲虫が硬質な背甲で力強く体当たりしてきた！")
- 結晶硬化 (buff, 40, statusId: def_buff, 25, 2, "琥珀晶の甲虫が体表の琥珀を硬化させ、防御力を大きく高めた！")
- Phase 2 (50):
- 砕甲の顎撃 (attack, 65, 1.4, statusId: def_debuff, 20, 2, "琥珀晶の甲虫の大顎が防具を噛み砕き、防御力を下げた！")
- 黄金の障壁 (buff, 35, statusId: shield, 16, 2, "琥珀晶の甲虫が輝く琥珀の盾を張った！")

### abyssal_moss_slime（深淵の苔スライム）通常敵・流用スプライト
- hp 94 / atk 16 / def 6、weakness: physical / resistance: ice
- spriteId: slime / palette: emerald_slime
- Phase 1 (100):
- 毒苔の体当たり (attack, 60, 1.0, statusId: poison, 5, 2, "深淵の苔スライムが毒を帯びた体躯をぶつけてきた！")
- 濃密粘膜 (buff, 40, statusId: shield, 16, 2, "深淵の苔スライムが粘膜を膨らませ、強固な障壁を作った！")
- Phase 2 (45):
- 腐食泥の噴射 (attack, 70, 1.35, statusId: def_debuff, 20, 2, "深淵の苔スライムの腐食液が防具を溶かし、防御力を下げた！")
- 絡みつく藻屑 (debuff, 30, statusId: atk_debuff, 20, 2, "深淵の苔スライムの粘液が絡みつき、攻撃の勢いを鈍らせた！")

### rimefang_wolf（凍霧の古狼）通常敵・流用スプライト
- hp 86 / atk 20 / def 5、weakness: fire / resistance: ice
- spriteId: wolf / palette: frost_blue
- Phase 1 (100):
- 氷牙の噛みつき (attack, 65, 1.05, "凍霧の古狼が冷気を纏った鋭い牙で噛みついた！")
- 吹雪の遠吠え (buff, 35, statusId: atk_buff, 20, 2, "凍霧の古狼の遠吠えが響き、攻撃力が高まった！")
- Phase 2 (45):
- 絶対零度の牙 (attack, 30, 1.15, statusId: freeze, 1, 1, "凍霧の古狼の凍てつく牙が全身を凍らせ、動きを封じた！")
- 氷嵐の連撃 (attack, 70, 1.45, "凍霧の古狼が冷気とともに猛烈な連続攻撃を繰り出した！")

### worldtree_vanguard（世界樹の尖兵）通常敵・流用スプライト
- hp 95 / atk 18 / def 7、weakness: fire / resistance: ice
- spriteId: treant / palette: ancient_bark
- Phase 1 (100):
- 巨木の薙ぎ払い (attack, 60, 1.05, "世界樹の尖兵が太い樹腕を大きく振り抜いた！")
- 霊樹の守り (buff, 40, statusId: def_buff, 25, 2, "世界樹の尖兵が樹皮を硬化させ、防御力を大きく上げた！")
- Phase 2 (50):
- 大根の粉砕撃 (attack, 70, 1.5, "世界樹の尖兵が大地ごと叩き砕く一撃を放った！")
- 絡みつく樹根 (debuff, 30, statusId: atk_debuff, 20, 2, "地中から伸びた根が足元を縛り、攻撃力を下げた！")

### hexspore_adept（呪胞子の奇術師）通常敵・流用スプライト
- hp 82 / atk 19 / def 5、weakness: nature / resistance: void
- spriteId: goblin / palette: toxic_purple
- Phase 1 (100):
- 猛毒の呪弾 (attack, 60, 1.0, statusId: poison, 5, 2, "呪胞子の奇術師が紫色の呪弾を放ち、猛毒を浴びせた！")
- 瘴気の衣 (buff, 40, statusId: flat_atk_up, 3, 3, "呪胞子の奇術師が呪力を纏い、攻撃の威力を高めた！")
- Phase 2 (45):
- 錯乱の胞子渦 (attack, 70, 1.4, "呪胞子の奇術師が激しい胞子の渦を叩きつけてきた！")
- 虚脱の霧 (debuff, 30, statusId: def_debuff, 20, 2, "呪胞子の奇術師の霧に包まれ、防御力が大きく低下した！")

### pyrebark_beast（紅蓮の樹皮獣）通常敵・新規スプライト
- hp 90 / atk 20 / def 6、weakness: ice / resistance: fire
- spriteId: pyrebark_beast（新規）、palette: ["#24140e", "#9b2226", "#ff9f1c"]
- スプライト説明：燃え盛る炭化した樹皮と赤い溶岩の筋を持つ四足の獣型モンスター。低い姿勢から炎の息を吐く猛々しいポーズ。
- Phase 1 (100):
- 灼熱の爪撃 (attack, 65, 1.05, statusId: burn, 5, 2, "紅蓮の樹皮獣が燃える爪で引き裂き、激しい火傷を負わせた！")
- 炉心の鼓動 (buff, 35, statusId: atk_buff, 25, 2, "紅蓮の樹皮獣の体内の炎が燃え上がり、攻撃力が高まった！")
- Phase 2 (45):
- 爆炎の突進 (attack, 70, 1.5, "紅蓮の樹皮獣が炎を纏って猛烈な勢いで突進してきた！")
- 灰燼の咆哮 (debuff, 30, statusId: atk_debuff, 20, 2, "紅蓮の樹皮獣の咆哮と熱風に圧され、攻撃力が鈍った！")

### leylines_wyvern（霊脈の翼竜）通常敵・新規スプライト
- hp 88 / atk 20 / def 6、weakness: nature / resistance: void
- spriteId: leylines_wyvern（新規）、palette: ["#132a13", "#2b9348", "#80ffdb"]
- スプライト説明：翠の魔力脈が走る大きな翼と長い尾を持つ樹海の飛竜。翼を広げて空中から急降下を狙うポーズ。
- Phase 1 (100):
- 疾風の翼撃 (attack, 65, 1.05, "霊脈の翼竜が巨大な翼を振るい、鋭い風刃を放った！")
- 霊脈の共鳴 (buff, 35, statusId: shield, 16, 2, "霊脈の翼竜の翼が輝き、魔力の障壁を展開した！")
- Phase 2 (45):
- 天空からの急襲 (attack, 70, 1.5, "霊脈の翼竜が上空から一気に急降下し、痛烈な一撃を叩き込んだ！")
- 威圧の竜吼 (debuff, 30, statusId: def_debuff, 20, 2, "霊脈の翼竜の竜吼に竦み、防御力が低下した！")

### worldtree_paladin（世界樹の近衛騎士）ミニボス（isBoss: true）・新規スプライト
- hp 95 / atk 20 / def 7、weakness: fire / resistance: ice
- spriteId: worldtree_paladin（新規）、palette: ["#14211d", "#2d6a4f", "#ffd166"]
- スプライト説明：黄金と深緑の重厚な板金鎧に身を包み、大盾と長槍を構えた樹海最深部の守護騎士。マントを翻して堂々と立ちはだかる威厳あるポーズ（通常敵とは完全に異なる人型重装騎士シルエット）。
- Phase 1 (100):
- 近衛の長槍突き (attack, 60, 1.1, "世界樹の近衛騎士が鋭い長槍で正確に突き込んできた！")
- 聖樹の鉄壁陣 (buff, 40, statusId: shield, 18, 2, "世界樹の近衛騎士が大盾を構え、強固な魔力障壁を展開した！")
- Phase 2 (50):
- 裁きの聖槍連撃 (attack, 65, 1.5, statusId: def_debuff, 20, 2, "世界樹の近衛騎士の猛攻が防具を貫き、防御力を低下させた！")
- 守護者の誓い (buff, 35, statusId: atk_buff, 25, 2, "世界樹の近衛騎士が槍を掲げ、闘気を大きく高めた！")

### primordial_treant（始原の世界樹・ユグドラ）頂点ボス（isBoss: true）・既存エントリの置き換え・新規専用スプライト
- name: '始原の世界樹・ユグドラ'、title: '領域の主'
- hp 360 / atk 34 / def 12、weakness: fire / resistance: **ice**、goldReward: 60
- spriteId: primordial_treant（新規）、palette: primordial_bark（新規パレット ["#0d1f16", "#1e5631", "#ffd166"] を登録すること）
- スプライト説明：樹海の頂に座す原初の世界樹。太い幹に古代の巨人のような顔、胸元に黄金に光る心核、大きく広がる枝冠と画面下へ垂れる無数の根。通常敵の treant とは完全に異なる威容で描くこと。
- フェーズは以下の既存構成をそのまま使うこと（数値・文言とも変更しない）：
- Phase 1 (hpThresholdPercent: 100):
- 神木の轟撃 (attack, weight 50, damageMultiplier 1.1, logMessage: '始原の世界樹の轟撃が大地を揺らす！')
- 千年樹の障壁 (buff, weight 25, statusId: 'shield', statusValue: 45, statusDuration: 3, logMessage: '千年樹のオーラが障壁(45)を形成した！')
- 重力根の呪縛 (debuff, weight 25, damageMultiplier: 0.9, statusId: 'def_debuff', statusValue: 35, statusDuration: 3, logMessage: '重力の根が鎧を砕き、防御力を35%低下させた！')
- Phase 2 (hpThresholdPercent: 60, phaseName: '神威解放'):
- 世界樹の審判 (attack, weight 60, damageMultiplier 1.5, logMessage: '天から降り注ぐ魔力の奔流！世界樹の審判！')
- 灼熱の霊花 (debuff, weight 40, damageMultiplier: 1.2, statusId: 'burn', statusValue: 12, statusDuration: 3, logMessage: '燃え盛る霊花が炸裂し、火傷(12%)を付与！')
- Phase 3 (hpThresholdPercent: 30, phaseName: '終焉の脈動'):
- ジェネシス・オーバーグロース (attack, weight 75, damageMultiplier: 1.9, logMessage: '空間ごと押し潰す究極の一撃！ジェネシス・オーバーグロース！')
- 始原の覇気 (buff, weight 25, statusId: 'atk_buff', statusValue: 45, statusDuration: 3, logMessage: '世界樹が全ての魔力を解放し攻撃力+45%！')
