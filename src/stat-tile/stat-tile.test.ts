import { describe, expect, it } from 'vitest';
import './index.js';
import { trendFromDelta } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('trendFromDelta', () => {
  it('maps sign to direction', () => {
    expect(trendFromDelta(2)).toBe('up');
    expect(trendFromDelta(-2)).toBe('down');
    expect(trendFromDelta(0)).toBe('flat');
    expect(trendFromDelta(null)).toBeNull();
  });
});

describe('aiux-stat-tile', () => {
  it('colours an increase as good by default', async () => {
    const el = await fixture('<aiux-stat-tile label="CSAT" value="4.6" delta="3"></aiux-stat-tile>');
    const delta = shadow(el).querySelector('.delta')!;
    expect(delta.classList.contains('good')).toBe(true);
    expect(delta.textContent).toContain('+3%');
  });

  it('inverts colours with lower-is-better', async () => {
    const el = await fixture('<aiux-stat-tile label="Open" value="9" delta="4" lower-is-better></aiux-stat-tile>');
    expect(shadow(el).querySelector('.delta')!.classList.contains('bad')).toBe(true);
  });

  it('hides the delta when absent and shows a skeleton when loading', async () => {
    const el = await fixture('<aiux-stat-tile label="MTTR" loading></aiux-stat-tile>');
    expect(shadow(el).querySelector('.delta')).toBeNull();
    expect(shadow(el).querySelector('.skeleton')).toBeTruthy();
    expect(shadow(el).querySelector('.tile')!.getAttribute('aria-busy')).toBe('true');
  });
});
