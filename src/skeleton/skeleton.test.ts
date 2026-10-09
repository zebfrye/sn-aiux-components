import { describe, expect, it } from 'vitest';
import './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('aiux-skeleton', () => {
  it('renders N text lines hidden from AT', async () => {
    const el = await fixture('<aiux-skeleton lines="3"></aiux-skeleton>');
    expect(shadow(el).querySelectorAll('.line')).toHaveLength(3);
    expect(shadow(el).firstElementChild!.getAttribute('aria-hidden')).toBe('true');
  });

  it('sizes a circle', async () => {
    const el = await fixture('<aiux-skeleton shape="circle"></aiux-skeleton>');
    expect(shadow(el).querySelector('.block')!.getAttribute('style')).toContain('width:2.5rem');
  });

  it('uses explicit rect dimensions', async () => {
    const el = await fixture('<aiux-skeleton shape="rect" width="10rem" height="4rem"></aiux-skeleton>');
    const style = shadow(el).querySelector('.block')!.getAttribute('style')!;
    expect(style).toContain('width:10rem');
    expect(style).toContain('height:4rem');
  });
});
