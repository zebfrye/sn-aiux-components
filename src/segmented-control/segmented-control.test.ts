import { describe, expect, it } from 'vitest';
import './index.js';
import { nextEnabledIndex } from './index.js';
import type { AIUXSegmentedControl } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week', disabled: true },
  { value: 'month', label: 'Month' }
];

describe('nextEnabledIndex', () => {
  it('skips disabled and wraps', () => {
    expect(nextEnabledIndex(options, 0, 1)).toBe(2);
    expect(nextEnabledIndex(options, 2, 1)).toBe(0);
    expect(nextEnabledIndex(options, 0, -1)).toBe(2);
  });
  it('returns -1 when nothing is enabled', () => {
    expect(nextEnabledIndex([{ value: 'a', label: 'A', disabled: true }], 0, 1)).toBe(-1);
  });
});

describe('aiux-segmented-control', () => {
  async function make() {
    const el = await fixture<AIUXSegmentedControl>('<aiux-segmented-control value="day"></aiux-segmented-control>');
    el.options = options;
    await el.updateComplete;
    return el;
  }

  it('uses radio semantics with a single tab stop', async () => {
    const el = await make();
    const radios = [...shadow(el).querySelectorAll('button')];
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
  });

  it('selects on click and emits once', async () => {
    const el = await make();
    const seen: string[] = [];
    el.addEventListener('aiux-segment-change', (e) => seen.push((e as CustomEvent).detail.value));
    const radios = shadow(el).querySelectorAll('button');
    radios[2].click();
    radios[2].click();
    expect(seen).toEqual(['month']);
    expect(el.value).toBe('month');
  });

  it('moves with arrow keys, skipping disabled', async () => {
    const el = await make();
    shadow(el).querySelector('.group')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.value).toBe('month');
  });
});
