import { describe, expect, it } from 'vitest';
import './index.js';
import type { AIUXSwitch } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('aiux-switch', () => {
  it('toggles, reflects state and emits', async () => {
    const el = await fixture<AIUXSwitch>('<aiux-switch>Alerts</aiux-switch>');
    const btn = shadow(el).querySelector('button')!;
    expect(btn.getAttribute('role')).toBe('switch');
    expect(btn.getAttribute('aria-checked')).toBe('false');
    let detail: unknown;
    el.addEventListener('aiux-switch-change', (e) => (detail = (e as CustomEvent).detail));
    btn.click();
    await el.updateComplete;
    expect(detail).toEqual({ checked: true });
    expect(el.hasAttribute('checked')).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('ignores clicks when disabled', async () => {
    const el = await fixture<AIUXSwitch>('<aiux-switch disabled>x</aiux-switch>');
    el.toggle();
    expect(el.checked).toBe(false);
  });

  it('resets on form reset', async () => {
    const el = await fixture<AIUXSwitch>('<aiux-switch checked>x</aiux-switch>');
    el.formResetCallback();
    expect(el.checked).toBe(false);
  });
});
