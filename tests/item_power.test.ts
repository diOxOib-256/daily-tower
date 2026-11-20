import { describe, expect, it } from 'vitest';
import { measuredItemPower, setItemPowerOverrides } from '../src/sim/itemPower';
import { ITEM_POWER_TABLE } from '../src/sim/itemPowerData';
import { PlaytestBot } from '../src/sim/playtestBot';
import { ARMOR_CATALOG, RELIC_CATALOG, WEAPON_CATALOG } from '../src/extensible/items/itemCatalog';
import { RewardCard } from '../src/core/DropPacingEngine';

describe('measured item power table', () => {
  it('ships with contextual entries for the current tower', () => {
    expect(Object.keys(ITEM_POWER_TABLE).length).toBeGreaterThan(300);
    // The starter consumable injected into its own checkpoint is a no-op.
    expect(ITEM_POWER_TABLE['crimson_vial@1']).toBe(0);
  });

  it('ranks known-strong items above known-weak ones in the same context', () => {
    const crest = measuredItemPower('guardian_crest_relic', 55);
    const compass = measuredItemPower('golden_compass_relic', 55);
    expect(crest).not.toBeNull();
    expect(compass).not.toBeNull();
    expect(crest as number).toBeGreaterThan(compass as number);
    const rusty = measuredItemPower('rusty_shortsword', 55);
    const halberd = measuredItemPower('verdant_halberd', 55);
    expect((halberd as number) > (rusty as number)).toBe(true);
  });

  it('falls back to null for unmeasured items and honors overrides', () => {
    expect(measuredItemPower('definitely_not_an_item', 10)).toBeNull();
    setItemPowerOverrides({ guardian_crest_relic: 999 });
    expect(measuredItemPower('guardian_crest_relic', 55)).toBe(999);
    setItemPowerOverrides(null);
    expect(measuredItemPower('guardian_crest_relic', 55)).not.toBe(999);
  });

  it('the difficulty bot takes a measured-better relic over a weaker held one', () => {
    const crest = RELIC_CATALOG['guardian_crest_relic'];
    const compass = RELIC_CATALOG['golden_compass_relic'];
    const weapon = Object.values(WEAPON_CATALOG)[0];
    const armor = Object.values(ARMOR_CATALOG)[0];
    const junk = { type: 'gold_bonus', goldBonusAmount: 5 } as unknown as RewardCard;
    const cards = [
      junk,
      { type: 'item', item: crest } as unknown as RewardCard,
      junk,
    ] as unknown as [RewardCard, RewardCard, RewardCard];
    const choice = PlaytestBot.chooseRewardCard(cards, {
      floor: 55,
      weapon: weapon as never,
      armor: armor as never,
      skills: [null, null, null],
      relic: compass as never,
      consumableId: 'crimson_vial',
      consumableCharges: 2,
      consumableMaxCharges: 2,
      consumableHealPercent: 45,
    });
    expect(choice.index).toBe(1);
    expect(choice.action).toBe('equip');
  });
});
