import { describe, expect, it, vi } from 'vitest';
import './index.js';
import type { AIUXMarkdown } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

/** Wait until the element shows rendered markup matching `selector`; returns the content root. */
async function rendered(el: AIUXMarkdown, selector: string) {
  await vi.waitFor(() => expect(shadow(el).querySelector(`[part=content] ${selector}`)).toBeTruthy());
  return shadow(el).querySelector('[part=content]')!;
}

describe('aiux-markdown', () => {
  it('renders GFM', async () => {
    const el = await fixture<AIUXMarkdown>('<aiux-markdown></aiux-markdown>');
    el.content = '# Title\n\n- one\n- **two**\n\n| a | b |\n|---|---|\n| 1 | 2 |';
    const root = await rendered(el, 'h1');
    expect(root.querySelector('h1')!.textContent).toBe('Title');
    expect(root.querySelectorAll('li')).toHaveLength(2);
    expect(root.querySelector('table')).toBeTruthy();
  });

  it('sanitizes scripts, handlers and javascript: links', async () => {
    const el = await fixture<AIUXMarkdown>('<aiux-markdown></aiux-markdown>');
    el.content = '<script>window.__pwn=1</script><img src=x onerror="window.__pwn=2">\n\n[click](javascript:alert(1))\n\n[ok](https://example.com)';
    const root = await rendered(el, 'a[href="https://example.com"]');
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('img')?.hasAttribute('onerror') ?? false).toBe(false);
    const hrefs = [...root.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs.some((h) => h?.startsWith('javascript:'))).toBe(false);
    const link = root.querySelector('a[href="https://example.com"]')!;
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect((globalThis as { __pwn?: number }).__pwn).toBeUndefined();
  });

  it('discards stale renders when content changes quickly', async () => {
    const el = await fixture<AIUXMarkdown>('<aiux-markdown></aiux-markdown>');
    el.content = '# first';
    el.content = '# second';
    const root = await rendered(el, 'h1');
    expect(root.textContent).toContain('second');
    expect(root.textContent).not.toContain('first');
  });
});
