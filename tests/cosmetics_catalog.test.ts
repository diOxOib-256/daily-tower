import { describe, expect, it } from 'vitest';
import { COSMETIC_SHOP_CATALOG } from '../src/core/AreaEngine';
import { EXTENSIBLE_COSMETICS } from '../src/extensible/cosmetics/cosmeticAdditions';
import {
  PALETTE_REGISTRY,
  SPRITE_REGISTRY,
} from '../src/extensible/sprites/spriteRegistry';

describe('cosmetic shop catalog', () => {
  it('merges the extensible additions after the base catalog', () => {
    expect(COSMETIC_SHOP_CATALOG.length).toBeGreaterThanOrEqual(
      EXTENSIBLE_COSMETICS.length + 14,
    );
    for (const item of EXTENSIBLE_COSMETICS) {
      expect(COSMETIC_SHOP_CATALOG).toContainEqual(item);
    }
  });

  it('keeps every catalog id unique', () => {
    const ids = COSMETIC_SHOP_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('resolves every skin sprite and palette', () => {
    for (const item of COSMETIC_SHOP_CATALOG) {
      if (item.category !== 'skin') continue;
      expect(item.spriteId, item.id).toBeTruthy();
      expect(SPRITE_REGISTRY[item.spriteId!], item.id).toBeDefined();
      if (item.paletteId) {
        expect(PALETTE_REGISTRY[item.paletteId], item.id).toBeDefined();
      }
    }
  });
});
