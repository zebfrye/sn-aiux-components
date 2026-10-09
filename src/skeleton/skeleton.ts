import { css, html } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, reducedMotion, tokenStyles } from '../styles/tokens.js';

/**
 * Loading placeholder. `shape="text"` renders `lines` lines (last one shorter).
 * Marked `aria-hidden`; set `aria-busy` on the container that is loading.
 */
@customElement('aiux-skeleton')
export class AIUXSkeleton extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    reducedMotion,
    css`
      :host { display: block; }
      :host([shape='circle']) { display: inline-block; }
      .block {
        background: linear-gradient(
          90deg,
          var(--_surface-muted) 25%,
          color-mix(in srgb, var(--_border) 55%, var(--_surface-muted)) 50%,
          var(--_surface-muted) 75%
        );
        background-size: 200% 100%;
        border-radius: var(--_radius);
      }
      :host([animated]) .block { animation: shimmer 1.5s linear infinite; }
      :host([shape='circle']) .block { border-radius: 50%; }
      .line { height: 0.875em; margin-block: 0.4em; }
      .line:last-child:not(:only-child) { width: 60%; }
      @keyframes shimmer { to { background-position: -200% 0; } }
    `
  ];

  @property({ reflect: true }) shape: 'text' | 'rect' | 'circle' = 'text';
  /** Any CSS length. Defaults: text 100%, rect 100%, circle 2.5rem. */
  @property() width = '';
  @property() height = '';
  /** Number of lines for `shape="text"`. */
  @property({ type: Number }) lines = 1;
  @property({ type: Boolean, reflect: true }) animated = true;

  protected render(): TemplateResult {
    if (this.shape === 'text') {
      const count = Math.max(1, Math.floor(this.lines));
      return html`<div aria-hidden="true" style=${this.width ? `width:${this.width}` : ''}>
        ${Array.from({ length: count }, () => html`<div class="block line"></div>`)}
      </div>`;
    }
    const size = this.shape === 'circle' ? '2.5rem' : '';
    const w = this.width || size || '100%';
    const h = this.height || size || '6rem';
    return html`<div class="block" aria-hidden="true" style="width:${w};height:${h}"></div>`;
  }
}
