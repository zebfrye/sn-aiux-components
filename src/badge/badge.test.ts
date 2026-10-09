import { describe, expect, it } from 'vitest';
import './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

describe('aiux-badge', () => {
  it('renders slotted text and reflects variant', async () => {
    const el = await fixture('<aiux-badge variant="success">Done</aiux-badge>');
    expect(el.getAttribute('variant')).toBe('success');
    expect(shadow(el).querySelector('slot')).toBeTruthy();
    expect(shadow(el).querySelector('button')).toBeNull();
  });

  it('shows a dot only when requested', async () => {
    const el = await fixture('<aiux-badge dot>x</aiux-badge>');
    expect(shadow(el).querySelector('.dot')).toBeTruthy();
  });
});

describe('aiux-tag', () => {
  it('is removable by default and emits aiux-badge-remove with value', async () => {
    const el = await fixture('<aiux-tag value="net">network</aiux-tag>');
    const button = shadow(el).querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Remove');
    let detail: unknown;
    el.addEventListener('aiux-badge-remove', (e) => (detail = (e as CustomEvent).detail));
    button.click();
    expect(detail).toEqual({ value: 'net' });
  });

  it('falls back to text content when no value is set', async () => {
    const el = await fixture('<aiux-tag> alpha </aiux-tag>');
    let detail: { value: string } | undefined;
    el.addEventListener('aiux-badge-remove', (e) => (detail = (e as CustomEvent).detail));
    shadow(el).querySelector('button')!.click();
    expect(detail?.value).toBe('alpha');
  });
});
