import { css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';
import './copy-button.js';

/**
 * Read-only preformatted code with a language tag and a copy button.
 * Content comes from `code` or, when unset, the element's text content.
 * Not a syntax highlighter; use `aiux-code-editor` when highlighting or editing is needed.
 */
@customElement('aiux-code-block')
export class AIUXCodeBlock extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: block; }
      .block { border: 1px solid var(--_border); border-radius: var(--_radius); overflow: hidden; background: var(--_surface-muted); }
      .bar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.25rem 0.5rem; border-bottom: 1px solid var(--_border);
        font-size: 0.75rem; color: var(--_neutral);
      }
      pre { margin: 0; padding: 0.75rem; overflow: auto; color: var(--_text); font: 0.8125rem/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
      :host([wrap]) pre { white-space: pre-wrap; word-break: break-word; }
    `
  ];

  @property() code = '';
  @property() language = '';
  @property({ type: Boolean, reflect: true }) wrap = false;

  private get _text(): string {
    return this.code || (this.textContent ?? '').replace(/^\n|\n\s*$/g, '');
  }

  protected render(): TemplateResult {
    const text = this._text;
    return html`<div class="block" part="block">
      <div class="bar" part="bar">
        <span>${this.language || nothing}</span>
        <aiux-copy-button .value=${text}></aiux-copy-button>
      </div>
      <pre part="pre"><code>${text}</code></pre>
    </div>`;
  }
}
