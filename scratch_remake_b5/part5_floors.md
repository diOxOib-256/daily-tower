# リメイク Block 5 分割実装（全5パート）— パート5：イベント3種・デビュー登録・フロア41〜50

## 共通ルール
- 変更は `src/extensible/` 配下のみ。`src/core/` は変更禁止。
- ゲーム内UIに開発者向け文言・変更履歴を入れない。
- 完了条件：`npm test` 全件パス、`npm run build` 成功、その状態で main へ push。
- 完了報告には「変更したファイル一覧」「テスト結果とビルド結果」「指示から変えた点があればその内容」を書くこと。
- コミットメッセージ：`[CF-Pages-Skip] Remake Block 5 (5/5): events, debuts and floors 41-50`
- このパートの push には、この指示ファイル群（`scratch_remake_b5/`）の削除も含めること。

## このパートの作業

### 1. イベント3種を `src/extensible/events/eventRegistry.ts` に追加
既存イベント（sylvan_basin / root_altar / canopy_camp）と同形式で登録する。speakerSpriteId と palette は指定どおり。

#### worldtree_font（世界樹の霊泉）category: 'shrine'
- description: '世界樹の太い根の合間に、淡い翠色の光を湛えた神秘的な泉が湧き出ている。泉の縁には先人たちが捧げた金貨が静かに輝いている。'
- speakerSpriteId: 'shrine', palette: 'emerald_slime'
- 選択肢1（id: 'take_font_coins', ラベル: '泉の縁に供えられた金貨を譲り受ける', 説明: '霊泉を乱さぬよう、縁に置かれた金貨だけを謹んで回収する。'）
  - outcome: grantGold: 9, logMessage: '泉の縁に供えられた金貨を譲り受け、9 G を手に入れた！'
- 選択肢2（id: 'drink_font_water', ラベル: '金貨を捧げて世界樹の霊水を飲む', 説明: '泉に金貨を捧げ、生命力に満ちた霊水で傷を癒やす。'）
  - cost: { gold: 18 }
  - outcome: healHpPercent: 35, logMessage: '金貨を捧げて世界樹の霊水を飲み、HPが35%回復した！'

#### elder_reliquary（古代樹の宝物庫）category: 'lore'
- description: '大樹の幹に穿たれた古い宝物庫を見つけた。台座の上には古代の魔力を宿した武具や護符が厳かに安置されている。'
- speakerSpriteId: 'shrine', palette: 'ancient_bark'
- 選択肢1（id: 'take_reliquary_coins', ラベル: '台座の傍らの古金貨を回収する', 説明: '武具には触れず、周囲に納められていた資金だけを持ち帰る。'）
  - outcome: grantGold: 11, logMessage: '台座の傍らに納められていた古金貨を回収し、11 G を手に入れた！'
- 選択肢2（id: 'inherit_reliquary_weapon', ラベル: '生気を捧げて古代の武器を継承する', 説明: '自身の体力を対価に誓いを立て、宝物庫の武器を一つ授かる。'）
  - cost: { hpPercent: 15 }
  - outcome: grantItemType: 'weapon', grantGold: 5, logMessage: '生気を捧げて古代の武器を継承し、さらに5 G を手に入れた！'

#### worldtree_sanctuary_camp（世界樹の根の野営地）category: 'rest'
- description: '巨大な根が天蓋のように覆う静謐な空間を見つけた。頂上決戦を前に、ここで最後の休息と装備の点検を行うことができる。'
- speakerSpriteId: 'shrine', palette: 'emerald_slime'
- 選択肢1（id: 'rest_at_sanctuary', ラベル: '聖域の静寂の中で深い休息をとる', 説明: '穏やかな霊気に包まれて体を休め、体力を大きく回復する。'）
  - outcome: healHpPercent: 50, logMessage: '聖域の静寂の中で深い休息をとり、HPが50%回復した！'
- 選択肢2（id: 'refill_at_sanctuary', ラベル: '携帯用の回復具を補充する', 説明: '荷物を点検し、消耗品チャージを1回分補充する。'）
  - outcome: grantConsumableCharge: 1, logMessage: '携帯用の回復具を補充し、消耗品チャージが1回復した！'
  - ※ grantConsumableCharge の正確なフィールド名は既存の Rest イベント（sunlit_clearing / canopy_camp）の outcome に合わせること。

### 2. デビュー登録
`src/extensible/items/rewardPoolDerivation.ts` の `ITEM_DEBUT_OVERRIDES` に以下を追加する（既存の30件は変更しない）：
worldtree_greatsword: 41, celestial_cleave: 41, worldtree_dewstone: 41, paladin_verdant_armor: 42, leyline_storm: 42, worldtree_grace: 43, leyline_astrolabe: 43, inferno_verdict: 44, primordial_spear: 45, primordial_bastion: 45, paladin_cordial: 45, apex_overdrive: 46, primordial_aegis_plate: 47, glacial_shackle: 47, worldtree_ambrosia: 50

### 3. フロア41〜50の置き換え
`src/extensible/realms/realm_01_greenwood.ts` のフロア41〜50を以下の構成に置き換える。rewardPool は付けない（導出に任せる）。enemyStatScale は指定値を使うこと。

#### Floor 41「霊気満ちる世界樹の麓」
- subtitle: '翠色の霊気が立ち込め、樹海の最深部へと足を踏み入れる最終区画の入口'
- battle [elderwood_specter] scale 1.199
- event worldtree_font
- battle [amber_scarab] scale 1.199
- battle [abyssal_moss_slime, fungal_shaman] scale 1.199

#### Floor 42「凍霧と古狼の樹廊」
- subtitle: '冷気を纏う古狼と深淵の苔スライムが縄張りを守り、厳しい連戦が始まる回廊'
- battle [rimefang_wolf] scale 1.5
- battle [abyssal_moss_slime] scale 1.5
- event elder_reliquary
- battle [elderwood_specter] scale 1.5

#### Floor 43「聖域の根の野営地」
- subtitle: '38F以来の安息の空間。近衛騎士の関門を前に、体力と消耗品を整える階層'
- battle [amber_scarab] scale 1.169
- battle [worldtree_vanguard] scale 1.169
- event worldtree_sanctuary_camp
- battle [rimefang_wolf] scale 1.169

#### Floor 44「尖兵と奇術師の防衛線」
- subtitle: '世界樹の尖兵と呪胞子の奇術師が連携し、近衛騎士への道を固める防衛階層'
- battle [worldtree_vanguard] scale 1.232
- battle [hexspore_adept] scale 1.232
- event worldtree_font
- battle [elderwood_specter] scale 1.232
- battle [amber_scarab] scale 1.232

#### Floor 45「世界樹の近衛聖殿」
- subtitle: '頂点への最後の門番「世界樹の近衛騎士」が長槍と大盾を構えて立ち塞がる聖殿'
- battle [worldtree_vanguard] scale 1.45
- event elder_reliquary
- battle [hexspore_adept] scale 1.45
- miniboss [worldtree_paladin] scale 1.94

#### Floor 46「紅蓮と霊脈の深奥」
- subtitle: '灼熱の樹皮獣と霊脈を駆ける翼竜が現れ、Realm 1 最上位武具の力が試される階層'
- battle [pyrebark_beast] scale 1.442
- event worldtree_font
- battle [leylines_wyvern] scale 1.442
- battle [rimefang_wolf] scale 1.442

#### Floor 47「飛竜と呪胞子の空廊」
- subtitle: '霊脈の翼竜が上空から襲い、呪胞子の奇術師が瘴気を操る過酷な連戦地帯'
- battle [leylines_wyvern] scale 1.45
- battle [hexspore_adept] scale 1.45
- event elder_reliquary
- battle [pyrebark_beast] scale 1.45
- battle [abyssal_moss_slime] scale 1.45

#### Floor 48「原初前夜の聖域野営」
- subtitle: '43F以来の安息の空間。50Fの原初のトレントとの決戦に向け、最後の休息をとる階層'
- battle [pyrebark_beast] scale 1.401
- battle [elderwood_specter] scale 1.401
- event worldtree_sanctuary_camp
- battle [leylines_wyvern] scale 1.401

#### Floor 49「世界樹の王冠回廊」
- subtitle: '原初のトレントが座す頂上直下の回廊。樹海の精鋭たちが最後の抵抗を見せる階層'
- battle [worldtree_vanguard] scale 1.185
- battle [pyrebark_beast] scale 1.185
- event worldtree_font
- battle [leylines_wyvern] scale 1.185
- battle [rimefang_wolf] scale 1.185

#### Floor 50「原初樹の頂」
- subtitle: '樹海の塔の最上階。領域の主「原初のトレント」が立ち塞がる Realm 1 頂上決戦'
- battle [abyssal_moss_slime] scale 1.201
- event elder_reliquary
- apex_boss [primordial_treant] scale 0.697
