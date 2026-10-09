import { describe, expect, it } from 'vitest';
import './index.js';
import { toPercent } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('toPercent', () => {
  it('clamps and guards bad input', () => {
    expect(toPercent(50, 200)).toBe(25);
    expect(toPercent(-5, 100)).toBe(0);
    expect(toPercent(500, 100)).toBe(100);
    expect(toPercent(5, 0)).toBe(0);
    expect(toPercent(NaN, 100)).toBe(0);
  });
});

describe('aiux-progress', () => {
  it('exposes progressbar semantics (linear)', async () => {
    const el = await fixture('<aiux-progress value="30" label="Upload" show-value></aiux-progress>');
    const bar = shadow(el).querySelector('[role=progressbar]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe('30');
    expect(bar.getAttribute('aria-label')).toBe('Upload');
    expect((shadow(el).querySelector('.fill') as HTMLElement).style.width).toBe('30%');
    expect(shadow(el).textContent).toContain('30%');
  });

  it('omits aria-valuenow when indeterminate', async () => {
    const el = await fixture('<aiux-progress indeterminate></aiux-progress>');
    expect(shadow(el).querySelector('[role=progressbar]')!.hasAttribute('aria-valuenow')).toBe(false);
  });

  it('draws the ring offset for circular', async () => {
    const el = await fixture('<aiux-progress shape="circular" value="25"></aiux-progress>');
    const fill = shadow(el).querySelector('.ring-fill')!;
    const circumference = Number(fill.getAttribute('stroke-dasharray'));
    expect(Number(fill.getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference * 0.75, 3);
  });
});
