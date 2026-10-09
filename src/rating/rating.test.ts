import { describe, expect, it } from 'vitest';
import './index.js';
import { roundRating } from './index.js';
import type { AIUXRating } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('roundRating', () => {
  it('snaps and clamps', () => {
    expect(roundRating(3.3, 0.5, 5)).toBe(3.5);
    expect(roundRating(3.3, 1, 5)).toBe(3);
    expect(roundRating(9, 1, 5)).toBe(5);
    expect(roundRating(-2, 1, 5)).toBe(0);
    expect(roundRating(NaN, 1, 5)).toBe(0);
  });
});

describe('aiux-rating', () => {
  it('is a slider with value semantics', async () => {
    const el = await fixture<AIUXRating>('<aiux-rating value="3" label="Quality"></aiux-rating>');
    const stars = shadow(el).querySelector('.stars')!;
    expect(stars.getAttribute('role')).toBe('slider');
    expect(stars.getAttribute('aria-valuenow')).toBe('3');
    expect(stars.getAttribute('aria-valuemax')).toBe('5');
    expect(shadow(el).querySelectorAll('.star')).toHaveLength(5);
  });

  it('sets value by click and emits', async () => {
    const el = await fixture<AIUXRating>('<aiux-rating></aiux-rating>');
    let value = -1;
    el.addEventListener('aiux-rating-change', (e) => (value = (e as CustomEvent).detail.value));
    (shadow(el).querySelectorAll('.star')[3] as HTMLElement).click();
    expect(value).toBe(4);
  });

  it('supports keyboard, including half steps', async () => {
    const el = await fixture<AIUXRating>('<aiux-rating allow-half value="2"></aiux-rating>');
    const stars = shadow(el).querySelector('.stars')!;
    stars.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(el.value).toBe(2.5);
    stars.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(el.value).toBe(5);
  });

  it('is inert when readonly', async () => {
    const el = await fixture<AIUXRating>('<aiux-rating readonly value="2"></aiux-rating>');
    expect(shadow(el).querySelector('.stars')!.getAttribute('role')).toBe('img');
    (shadow(el).querySelectorAll('.star')[4] as HTMLElement).click();
    expect(el.value).toBe(2);
  });
});
