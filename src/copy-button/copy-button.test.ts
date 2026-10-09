import { afterEach, describe, expect, it, vi } from 'vitest';
import './index.js';
import { copyText } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

afterEach(() => vi.unstubAllGlobals());

describe('copyText', () => {
  it('uses the async clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copyText('hi')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hi');
  });

  it('falls back to execCommand when the API rejects', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    document.execCommand = vi.fn().mockReturnValue(true);
    expect(await copyText('hi')).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});

describe('aiux-copy-button', () => {
  it('copies, emits aiux-copy and announces', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const el = await fixture<HTMLElement & { updateComplete: Promise<unknown> }>(
      '<aiux-copy-button value="INC1" reset-delay="10000"></aiux-copy-button>'
    );
    let detail: unknown;
    el.addEventListener('aiux-copy', (e) => (detail = (e as CustomEvent).detail));
    shadow(el).querySelector('button')!.click();
    await vi.waitFor(() => expect(detail).toEqual({ value: 'INC1', success: true }));
    await el.updateComplete;
    expect(shadow(el).querySelector('[role=status]')!.textContent).toBe('Copied');
  });

  it('is disabled without a value', async () => {
    const el = await fixture('<aiux-copy-button></aiux-copy-button>');
    expect(shadow(el).querySelector('button')!.disabled).toBe(true);
  });
});

describe('aiux-code-block', () => {
  it('uses text content and passes it to the copy button', async () => {
    const el = await fixture('<aiux-code-block language="js">\nconst a = 1;\n</aiux-code-block>');
    expect(shadow(el).querySelector('code')!.textContent).toBe('const a = 1;');
    const copy = shadow(el).querySelector('aiux-copy-button') as HTMLElement & { value: string };
    expect(copy.value).toBe('const a = 1;');
    expect(shadow(el).querySelector('.bar')!.textContent).toContain('js');
  });
});
