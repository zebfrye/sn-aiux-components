import { css, html } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

type Renderer = (markdown: string) => Promise<string>;

let rendererPromise: Promise<Renderer | null> | undefined;

/**
 * Lazily load `marked` + `DOMPurify` (optional peer deps). Resolves `null` when either is
 * missing, in which case the element shows the escaped source text.
 */
export function loadRenderer(): Promise<Renderer | null> {
  rendererPromise ??= (async () => {
    try {
      const [{ marked }, purifyModule] = await Promise.all([import('marked'), import('dompurify')]);
      const purify = purifyModule.default;
      purify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A' && node.getAttribute('href')) {
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      });
      return async (markdown: string) =>
        purify.sanitize(await marked.parse(markdown, { gfm: true, breaks: false }), { USE_PROFILES: { html: true } });
    } catch {
      return null;
    }
  })();
  return rendererPromise;
}

/**
 * Renders markdown as sanitized HTML (GFM). Intended for AI / chat output: updating `content`
 * repeatedly (streaming) is safe, stale async renders are discarded.
 *
 * Requires optional peers `marked` and `dompurify`; without them the source is shown as text.
 * Raw HTML in the markdown is sanitized, never trusted.
 *
 * @fires aiux-markdown-rendered - A render finished (`detail.html` is the sanitized markup).
 */
@customElement('aiux-markdown')
export class AIUXMarkdown extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: block; color: var(--_text); line-height: 1.6; overflow-wrap: anywhere; }
      .plain { white-space: pre-wrap; }
      h1, h2, h3, h4 { line-height: 1.25; margin: 1.2em 0 0.5em; }
      h1:first-child, h2:first-child, h3:first-child, p:first-child { margin-block-start: 0; }
      p, ul, ol, pre, blockquote, table { margin-block: 0 0.75em; }
      code { font: 0.85em ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--_surface-muted); padding: 0.1em 0.35em; border-radius: 4px; }
      pre { background: var(--_surface-muted); border: 1px solid var(--_border); border-radius: var(--_radius); padding: 0.75rem; overflow: auto; }
      pre code { background: none; padding: 0; }
      blockquote { margin-inline: 0; padding-inline-start: 0.75rem; border-inline-start: 3px solid var(--_border); color: var(--_neutral); }
      a { color: var(--_primary); }
      table { border-collapse: collapse; }
      th, td { border: 1px solid var(--_border); padding: 0.25rem 0.5rem; }
      img { max-width: 100%; }
    `
  ];

  @property() content = '';
  @state() private _html: string | null = null;
  private _version = 0;

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('content')) void this._render(this.content);
  }

  private async _render(source: string): Promise<void> {
    const version = ++this._version;
    const renderer = await loadRenderer();
    if (version !== this._version) return;
    if (!renderer) {
      this._html = null;
      return;
    }
    const output = await renderer(source);
    if (version !== this._version) return;
    this._html = output;
    this.dispatchEvent(new CustomEvent('aiux-markdown-rendered', { detail: { html: output }, bubbles: true, composed: true }));
  }

  protected render(): TemplateResult {
    return this._html === null
      ? html`<div class="plain" part="content">${this.content}</div>`
      : html`<div part="content">${unsafeHTML(this._html)}</div>`;
  }
}
