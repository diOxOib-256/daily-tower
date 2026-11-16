# リメイク Block 4 分割実装（全5パート）— パート1：敵10種とスプライト

## 共通ルール（全パート共通）
- 変更は `src/extensible/` 配下のみ。`src/core/` は変更禁止。
- UI に開発者向け文言・更新履歴を入れない。
- 完了条件：`npm test` 全件パス＋`npm run build` 成功＋main へ push。
- 完了報告には変更ファイル一覧とテスト/ビルド結果、指示から変えた点があれば明記すること。
- スプライトの描き方（新規分）：見た目の説明文から 32×32 の数値行列（値 0〜3）を作る。パレットは案の末尾3色を [輪郭, 主色, ハイライト] として登録し、行列の値 1=輪郭色・2=主色・3=ハイライト色・0=透明 に対応させる。シルエットは主色（2）で面として塗りつぶし、対象の幅は22セル以上・塗り面積35%以上を目安にし、線画にしない。文字や記号は描かない。
- アイテムの spriteId はアイテム ID そのまま（例：rootbreaker_mace → 'rootbreaker_mace'）。

## このパートの作業
1. `src/extensible/enemies/enemyRegistry.ts` に下記10種を登録する。**goldReward は全種とも書かない**（エンジンが式で算出する新仕様）。
2. 新規スプライト7種（amber_hornet / rootbound_wraith / moss_golem / briar_stalker / root_centipede / amber_queen / ancient_root_warden）を見た目の説明から描き起こし、`src/extensible/sprites/matrixRegistry.ts` と `spriteRegistry.ts`（パレット含む）に登録する。流用3種は既存の組み合わせを使う。

## 敵データ（通常敵8種）
### amber_hornet（琥珀バチ）HP 80 / ATK 16 / DEF 5 / weakness: physical / resistance: fire / スプライト新規＋パレット ["#2b1b12", "#e09f3e", "#fff3b0"]
見た目：琥珀色の腹部と半透明の羽を持つ大型のスズメバチ。鋭い毒針を前に突き出してホバリングするポーズ。濃茶の輪郭に黄金色の体節、羽と針のハイライトに淡いクリーム色。
- P1(100): [attack w65 mult 1.0, statusId poison 4/2, log「琥珀バチが鋭い針を突き立て、毒を注入した！」] [buff w35, statusId atk_buff 20/2, log「琥珀バチの羽音が激しくなり、攻撃の勢いが増した！」]
- P2(45): [attack w70 mult 1.4, log「琥珀バチが素早い軌道で連続の突きを繰り出した！」] [debuff w30, statusId def_debuff 20/2, log「琥珀バチの執拗な牽制により、防御が疎かになった！」]
### sap_ooze（樹液スライム）HP 88 / ATK 15 / DEF 6 / weakness: fire / resistance: ice / スプライト流用 slime＋パレット toxic_purple
- P1(100): [attack w60 mult 1.0, log「樹液スライムが重たい塊をぶつけてきた！」] [buff w40, statusId shield 14/2, log「樹液スライムが体表を固め、分厚い障壁を張った！」]
- P2(45): [attack w65 mult 1.3, statusId atk_debuff 20/2, log「樹液スライムの粘液が武器に絡み、攻撃力を下げた！」] [debuff w35, statusId def_debuff 20/2, log「樹液スライムの酸が防具を侵食し、防御力を低下させた！」]
### rootbound_wraith（根縛りの亡霊）HP 78 / ATK 17 / DEF 5 / weakness: nature / resistance: void / スプライト新規＋パレット ["#161925", "#235789", "#cbf3f0"]
見た目：枯れた木の根が絡みついたボロボロのフードを纏い、宙を漂う蒼白い亡霊。両腕を広げて呪気を放つポーズ。黒紫の輪郭に暗い青緑の衣、瞳と霊気のハイライトに氷白。
- P1(100): [attack w65 mult 1.05, log「根縛りの亡霊が冷たい爪で切り裂いた！」] [debuff w35, statusId atk_debuff 20/2, log「根縛りの亡霊の囁きが気力を奪い、攻撃力を下げた！」]
- P2(45): [attack w30 mult 1.15, statusId freeze 1/1, log「根縛りの亡霊の冷気が身を凍らせ、動きを封じた！」] [attack w70 mult 1.4, log「根縛りの亡霊が激しい怨念の波動を放った！」]
### moss_golem（岩苔のゴーレム）HP 94 / ATK 16 / DEF 7 / weakness: physical / resistance: ice / スプライト新規＋パレット ["#1c2220", "#5b6e67", "#80ed99"]
見た目：苔むした巨岩を組み上げた無骨な岩人。片腕を大きく振り上げた重厚な構え。濃灰緑の輪郭に岩灰色、肩や頭部の苔と隙間の輝きに鮮やかな若草色。
- P1(100): [attack w60 mult 1.05, log「岩苔のゴーレムが重い石の拳を振り下ろした！」] [buff w40, statusId def_buff 25/2, log「岩苔のゴーレムが身を固め、防御力を大きく上げた！」]
- P2(50): [attack w70 mult 1.45, log「岩苔のゴーレムが地面ごと叩き潰す一撃を放った！」] [buff w30, statusId shield 16/2, log「岩苔のゴーレムが魔力を帯びた苔の盾を展開した！」]
### dire_timberwolf（深森のオオカミ）HP 84 / ATK 19 / DEF 5 / weakness: fire / resistance: void / スプライト流用 wolf＋パレット forest_goblin
- P1(100): [attack w65 mult 1.05, log「深森のオオカミが鋭い牙で噛みついてきた！」] [buff w35, statusId atk_buff 20/2, log「深森のオオカミが低く吠え、攻撃力を高めた！」]
- P2(45): [attack w70 mult 1.45, log「深森のオオカミが容赦なく連続で噛み砕いた！」] [debuff w30, statusId def_debuff 20/2, log「深森のオオカミの威圧に押され、防御が緩んだ！」]
### cinder_treant（焦土の樹精）HP 90 / ATK 18 / DEF 6 / weakness: ice / resistance: fire / スプライト流用 treant＋パレット molten_iron
- P1(100): [attack w60 mult 1.0, statusId burn 4/2, log「焦土の樹精が火の粉を散らす枝で打ち据え、火傷を負わせた！」] [buff w40, statusId def_buff 20/2, log「焦土の樹精が炭化した外皮を固め、防御力を上げた！」]
- P2(45): [attack w70 mult 1.4, log「焦土の樹精が灼熱の根を突き上げて襲いかかった！」] [debuff w30, statusId atk_debuff 20/2, log「焦土の樹精が噴き上げた黒煙に視界を遮られ、攻撃力が下がった！」]
### briar_stalker（荊棘の狩人）HP 82 / ATK 20 / DEF 5 / weakness: nature / resistance: void / スプライト新規＋パレット ["#1b2e1b", "#386641", "#a7c957"]
見た目：茨のマントと双剣を構えた細身の樹海妖精の戦士。前傾姿勢で双刃を交差させた構え。暗緑の輪郭に深い苔色の鎧、茨の棘と刃先のハイライトに淡い黄緑。
- P1(100): [attack w65 mult 1.05, log「荊棘の狩人が二本の茨刃で素早く斬りつけた！」] [buff w35, statusId flat_atk_up 3/3, log「荊棘の狩人が刃に魔力を纏わせ、威力を高めた！」]
- P2(45): [attack w70 mult 1.4, statusId poison 4/2, log「荊棘の狩人の連撃が防具を掠め、毒を流し込んだ！」] [debuff w30, statusId def_debuff 20/2, log「足元に張り巡らされた茨に動きを阻まれ、防御力が下がった！」]
### root_centipede（古根の大ムカデ）HP 92 / ATK 17 / DEF 6 / weakness: physical / resistance: fire / スプライト新規＋パレット ["#2b1912", "#8c2f39", "#f4a261"]
見た目：太い節足と無数の脚を持ち、木の根のようにうねる巨大なムカデ。頭部の大顎を広げて鎌首をもたげたポーズ。焦げ茶の輪郭に赤黒い外殻、腹節と牙のハイライトに橙黄。
- P1(100): [attack w65 mult 1.0, statusId poison 4/2, log「古根の大ムカデが巨大な顎で噛みつき、毒を流し込んだ！」] [buff w35, statusId shield 14/2, log「古根の大ムカデが体を丸め、硬い甲殻の障壁を張った！」]
- P2(45): [attack w70 mult 1.45, log「古根の大ムカデが長い胴体を叩きつけて押し潰した！」] [debuff w30, statusId atk_debuff 20/2, log「古根の大ムカデの甲殻音に気圧され、攻撃力が鈍った！」]

## 敵データ（ミニボス2種・isBoss: true）
### amber_queen（琥珀の女王バチ）【35F】HP 92 / ATK 19 / DEF 6 / weakness: physical / resistance: fire / スプライト新規＋パレット ["#2b1b12", "#f59e0b", "#fef3c7"]
見た目：王冠状の触角と黄金のドレスのような腹部を持つ巨大な女王バチ。大きく広げた4枚の羽と巨大な尾針を構えた威厳ある浮遊ポーズ（通常敵 amber_hornet とは体格・4枚羽・王冠・配色で明確に差別化）。濃茶の輪郭に鮮やかな山吹色の体色、王冠と羽の輝きに白金。
- P1(100): [attack w60 mult 1.05, statusId poison 5/2, log「琥珀の女王バチが黄金の針を突き刺し、猛毒を流し込んだ！」] [buff w40, statusId shield 18/2, log「琥珀の女王バチが琥珀色の魔力障壁を展開した！」]
- P2(45): [attack w70 mult 1.45, log「琥珀の女王バチが高速で急降下し、貫くような一撃を放った！」] [debuff w30, statusId atk_debuff 20/2, log「琥珀の女王バチの威圧感に押され、攻撃力が下がった！」]
### ancient_root_warden（古根の魔導樹）【40F】HP 95 / ATK 20 / DEF 7 / weakness: fire / resistance: ice / スプライト新規＋パレット ["#1b263b", "#415a77", "#48cae4"]
見た目：巨大な樹幹の胸部に蒼い魔力核を宿し、マントのような苔を纏った古代の守護樹。両腕から光の根を伸ばして魔法を放つポーズ（通常敵の treant 流用とは明確に差別化）。黒紺の輪郭に深い青灰の樹皮、魔力核と光の根に鮮やかなシアン。
- P1(100): [attack w60 mult 1.05, log「古根の魔導樹が魔力を帯びた太い根を叩きつけた！」] [buff w40, statusId def_buff 25/2, log「古根の魔導樹の樹皮にルーンが浮かび、防御力が大きく上がった！」]
- P2(50): [attack w65 mult 1.5, statusId def_debuff 20/2, log「古根の魔導樹の秘術が防具を貫き、防御力を低下させた！」] [buff w35, statusId atk_buff 25/2, log「古根の魔導樹の核が激しく明滅し、攻撃力が高まった！」]

## コミット
`[CF-Pages-Skip] Remake Block 4 (1/5): enemies and sprites`
