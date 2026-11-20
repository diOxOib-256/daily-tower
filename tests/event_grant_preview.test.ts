import { describe, expect, it } from 'vitest';
import { EventEngine, EventExecutionState } from '../src/core/EventEngine';
import { EVENT_REGISTRY } from '../src/extensible/events/eventRegistry';

const richState = (floor: number): EventExecutionState => ({
  currentHp: 1000,
  maxHp: 1000,
  gold: 100000,
  consumableCharges: 0,
  consumableMaxCharges: 2,
  currentFloor: floor,
});

describe('event grant preview', () => {
  it('previewGrant matches the item resolveOption grants with the seeded roll', () => {
    const grantOptions = Object.values(EVENT_REGISTRY).flatMap((ev) =>
      ev.options.filter((o) => o.outcome.grantItemType || o.outcome.specificItemId)
    );
    expect(grantOptions.length).toBeGreaterThan(0);
    for (const opt of grantOptions) {
      for (const [seed, floor, idx] of [
        [1, 1, 0],
        [42, 7, 2],
        [123456, 33, 1],
        [987654321, 58, 3],
      ] as const) {
        const preview = EventEngine.previewGrant(opt, floor, seed, idx);
        expect(preview, `${opt.id} @f${floor}`).toBeDefined();
        const res = EventEngine.resolveOption(richState(floor), opt, () =>
          EventEngine.grantRoll(seed, floor, idx, opt.id)
        );
        expect(res.success).toBe(true);
        expect(res.grantedItem?.id).toBe(preview!.id);
      }
    }
  });

  it('preview is stable across calls and varies by seed', () => {
    const opt = Object.values(EVENT_REGISTRY)
      .flatMap((ev) => ev.options)
      .find((o) => o.outcome.grantItemType === 'weapon')!;
    const a = EventEngine.previewGrant(opt, 20, 777, 1);
    const b = EventEngine.previewGrant(opt, 20, 777, 1);
    expect(a?.id).toBe(b?.id);
    const ids = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map(
        (s) => EventEngine.previewGrant(opt, 20, s, 1)?.id
      )
    );
    expect(ids.size).toBeGreaterThan(1);
  });
});
