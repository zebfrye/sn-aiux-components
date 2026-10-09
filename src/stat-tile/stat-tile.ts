import { css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export type Trend = 'up' | 'down' | 'flat';

/** Derive the trend direction from a numeric delta. */
export function trendFromDelta(delta: number | null): Trend | null {
  if (delta === null || !Number.isFinite(delta)) return null;
  return delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
}

/**
 * KPI tile: label, headline value, optional change indicator and sparkline.
 *
 * @slot sparkline - Small chart or SVG shown beside the value.
 * @slot - Footer / supporting text.
 */
@customElement('aiux-stat-tile')
export class AIUXStatTile extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: block; }
      .tile {
        box-sizing: border-box;
        padding: 1rem;
        border: 1px solid var(--_border);
        border-radius: calc(var(--_radius) * 1.5);
        background: var(--_surface);
        color: var(--_text);
      }
      .label { font-size: 0.8125rem; color: var(--_neutral); }
      .row { display: flex; align-items: flex-end; justify-content: space-between; gap: 0.75rem; margin-block: 0.25rem; }
      .value { font-size: 1.875rem; font-weight: 700; line-height: 1.2; font-variant-numeric: tabular-nums; }
      .delta { display: inline-flex; align-items: center; gap: 0.25em; font-size: 0.8125rem; font-weight: 600; color: var(--_neutral); }
      .delta.good { color: var(--_success); }
      .delta.bad { color: var(--_error); }
      .delta-label { font-weight: 400; color: var(--_neutral); margin-inline-start: 0.25em; }
      .skeleton { height: 2rem; width: 60%; border-radius: var(--_radius); background: var(--_surface-muted); }
    `
  ];

  @property() label = '';
  @property() value = '';
  /** Signed change, e.g. `12.5` or `-3`. Leave empty to hide the indicator. */
  @property({ type: Number }) delta: number | null = null;
  /** Unit appended to the delta, e.g. `%`. */
  @property({ attribute: 'delta-unit' }) deltaUnit = '%';
  @property({ attribute: 'delta-label' }) deltaLabel = '';
  /** Set when a decrease is the good outcome (e.g. open incidents). */
  @property({ type: Boolean, attribute: 'lower-is-better' }) lowerIsBetter = false;
  @property({ type: Boolean, reflect: true }) loading = false;

  protected render(): TemplateResult {
    const trend = trendFromDelta(this.delta);
    const good = trend && trend !== 'flat' && (trend === 'up') !== this.lowerIsBetter;
    const bad = trend && trend !== 'flat' && !good;
    const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '■';
    const sign = this.delta !== null && this.delta > 0 ? '+' : '';
    return html`<div class="tile" part="tile" role="group" aria-label=${this.label} aria-busy=${this.loading ? 'true' : 'false'}>
      <div class="label" part="label">${this.label}</div>
      <div class="row">
        ${this.loading
          ? html`<div class="skeleton" aria-hidden="true"></div>`
          : html`<div class="value" part="value">${this.value}</div>`}
        <slot name="sparkline"></slot>
      </div>
      ${trend && !this.loading
        ? html`<div class="delta ${good ? 'good' : bad ? 'bad' : ''}" part="delta">
            <span aria-hidden="true">${arrow}</span>
            <span>${sign}${this.delta}${this.deltaUnit}</span>
            ${this.deltaLabel ? html`<span class="delta-label">${this.deltaLabel}</span>` : nothing}
          </div>`
        : nothing}
      <slot></slot>
    </div>`;
  }
}
