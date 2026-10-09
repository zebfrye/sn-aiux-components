import { describe, expect, it } from 'vitest';
import './index.js';
import { collapseCrumbs } from './index.js';
import type { AIUXBreadcrumbs } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

const trail = ['Home', 'Incidents', 'Network', 'INC1', 'Details'].map((label) => ({ label, href: `/${label}` }));

describe('collapseCrumbs', () => {
  it('returns all when max is 0 or the trail fits', () => {
    expect(collapseCrumbs(trail, 0)).toHaveLength(5);
    expect(collapseCrumbs(trail, 5)).toHaveLength(5);
  });
  it('keeps first and the last max-1 with one ellipsis', () => {
    const out = collapseCrumbs(trail, 3);
    expect(out).toHaveLength(4);
    expect('ellipsis' in out[1]).toBe(true);
    expect(out.map((e) => ('crumb' in e ? e.crumb.label : '…'))).toEqual(['Home', '…', 'INC1', 'Details']);
  });
});

describe('aiux-breadcrumbs', () => {
  it('marks the last item as the current page and links the rest', async () => {
    const el = await fixture<AIUXBreadcrumbs>('<aiux-breadcrumbs></aiux-breadcrumbs>');
    el.items = trail;
    await el.updateComplete;
    expect(shadow(el).querySelector('nav')!.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(shadow(el).querySelectorAll('a')).toHaveLength(4);
    expect(shadow(el).querySelector('[aria-current=page]')!.textContent).toBe('Details');
  });

  it('expands the collapsed middle', async () => {
    const el = await fixture<AIUXBreadcrumbs>('<aiux-breadcrumbs max="3"></aiux-breadcrumbs>');
    el.items = trail;
    await el.updateComplete;
    expect(shadow(el).querySelectorAll('li')).toHaveLength(4);
    shadow(el).querySelector('button')!.click();
    await el.updateComplete;
    expect(shadow(el).querySelectorAll('li')).toHaveLength(5);
  });

  it('lets a consumer cancel navigation', async () => {
    const el = await fixture<AIUXBreadcrumbs>('<aiux-breadcrumbs></aiux-breadcrumbs>');
    el.items = trail;
    await el.updateComplete;
    let detail: unknown;
    el.addEventListener('aiux-breadcrumb-click', (e) => {
      detail = (e as CustomEvent).detail;
      e.preventDefault();
    });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    shadow(el).querySelector('a')!.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect((detail as { index: number }).index).toBe(0);
  });
});
