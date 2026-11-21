import type { CosmeticItem } from '../../core/AreaEngine';

/**
 * Cosmetics added after the base catalog shipped, mainly skins from the
 * daily skin pipeline. The shop catalog in core (COSMETIC_SHOP_CATALOG)
 * merges these entries in after the base list.
 *
 * Rules for additions:
 * - ids must stay unique across the base catalog and this list.
 * - a skin entry's spriteId must exist in SPRITE_REGISTRY and its
 *   paletteId in PALETTE_REGISTRY (tests enforce both).
 * - entries are append-only: never rename or remove an id that a save
 *   file may already own.
 */
export const EXTENSIBLE_COSMETICS: CosmeticItem[] = [
  {
    id: 'skin_clockwork',
    name: '刻限の時計技師スキン',
    category: 'skin',
    costGems: 25,
    spriteId: 'hero_clockwork',
    paletteId: 'clockwork_engineer',
    description: '焦げ茶と真鍮色のスチームパンク風コートに片眼鏡を掛けた、時計技師のドット絵スキン。',
  },
];
