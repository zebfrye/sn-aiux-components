import { css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, reducedMotion, tokenStyles } from '../styles/tokens.js';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Clamp `value` into `[0, max]` and return it as a 0-100 percentage. */
export function toPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !(max > 0)) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Determinate or indeterminate progress, as a bar or a ring.
 *
 * @slot - Optional custom label content (overrides `label`).
 */
@customElement('aiux-progress')
export class AIUXProgress extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    reducedMotion,
    css`
      :host { display: block; --_c: var(--_primary); }
      :host([variant='success']) { --_c: var(--_success); }
      :host([variant='warning']) { --_c: var(--_warning); }
      :host([variant='error']) { --_c: var(--_error); }
      :host([shape='circular']) { display: inline-block; }

      .header {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
        margin-block-end: 0.25rem;
        font-size: 0.8125rem;
        color: var(--_text);
      }
      .track {
        height: 0.5rem;
        overflow: hidden;
        border-radius: 999px;
        background: var(--_surface-muted);
        box-shadow: inset 0 0 0 1px var(--_border);
      }
      .fill {
        height: 100%;
        border-radius: inherit;
        background: var(--_c);
        transition: width 0.3s ease;
      }
      .indeterminate .fill {
        width: 40%;
        transition: none;
        animation: slide 1.4s ease-in-out infinite;
      }
      @keyframes slide {
        from { transform: translateX(-100%); }
        to { transform: translateX(250%); }
      }

      .ring { position: relative; width: var(--aiux-progress-size, 3rem); height: var(--aiux-progress-size, 3rem); }
      svg { display: block; width: 100%; height: 100%; transform: rotate(-90deg); }
      circle { fill: none; stroke-width: 4; }
      .ring-track { stroke: var(--_surface-muted); }
      .ring-fill { stroke: var(--_c); stroke-linecap: round; transition: stroke-dashoffset 0.3s ease; }
      .ring.indeterminate svg { animation: spin 1s linear infinite; }
      .ring.indeterminate .ring-fill { stroke-dasharray: 40 ${CIRCUMFERENCE}; }
      @keyframes spin { to { transform: rotate(270deg); } }
      .ring-value {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--_text);
      }
    `
  ];

  @property({ type: Number }) value = 0;
  @property({ type: Number }) max = 100;
  @property({ reflect: true }) shape: 'linear' | 'circular' = 'linear';
  @property({ reflect: true }) variant: 'primary' | 'success' | 'warning' | 'error' = 'primary';
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  @property() label = '';
  /** Show the percentage next to the label (bar) or inside the ring. */
  @property({ type: Boolean, attribute: 'show-value' }) showValue = false;

  protected render(): TemplateResult {
    const percent = toPercent(this.value, this.max);
    const text = `${Math.round(percent)}%`;
    const aria = {
      role: 'progressbar',
      'aria-label': this.label || 'Progress',
      'aria-valuemin': '0',
      'aria-valuemax': String(this.max)
    };
    const valueNow = this.indeterminate ? nothing : String(Math.min(this.max, Math.max(0, this.value)));

    if (this.shape === 'circular') {
      return html`<div
        class="ring ${this.indeterminate ? 'indeterminate' : ''}"
        part="ring"
        role=${aria.role}
        aria-label=${aria['aria-label']}
        aria-valuemin="0"
        aria-valuemax=${aria['aria-valuemax']}
        aria-valuenow=${valueNow}
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle class="ring-track" cx="24" cy="24" r=${RADIUS}></circle>
          <circle
            class="ring-fill"
            cx="24"
            cy="24"
            r=${RADIUS}
            stroke-dasharray=${this.indeterminate ? nothing : CIRCUMFERENCE}
            stroke-dashoffset=${this.indeterminate ? nothing : CIRCUMFERENCE * (1 - percent / 100)}
          ></circle>
        </svg>
        ${this.showValue && !this.indeterminate ? html`<span class="ring-value">${text}</span>` : nothing}
      </div>`;
    }

    return html`
      ${this.label || this.showValue
        ? html`<div class="header" part="header">
            <span><slot>${this.label}</slot></span>
            ${this.showValue && !this.indeterminate ? html`<span>${text}</span>` : nothing}
          </div>`
        : nothing}
      <div
        class="track ${this.indeterminate ? 'indeterminate' : ''}"
        part="track"
        role=${aria.role}
        aria-label=${aria['aria-label']}
        aria-valuemin="0"
        aria-valuemax=${aria['aria-valuemax']}
        aria-valuenow=${valueNow}
      >
        <div class="fill" part="fill" style=${this.indeterminate ? '' : `width:${percent}%`}></div>
      </div>
    `;
  }
}
