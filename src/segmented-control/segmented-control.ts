import { css, html } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export interface SegmentOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentChangeDetail {
  value: string;
}

/** Index of the next enabled option from `from` in `step` direction, wrapping; -1 if none. */
export function nextEnabledIndex(options: SegmentOption[], from: number, step: 1 | -1): number {
  const n = options.length;
  for (let i = 1; i <= n; i++) {
    const idx = (((from + step * i) % n) + n) % n;
    if (!options[idx].disabled) return idx;
  }
  return -1;
}

/**
 * Single-select segmented picker with radiogroup semantics and arrow-key roving focus.
 *
 * @fires aiux-segment-change - `detail` is `{ value }`.
 */
@customElement('aiux-segmented-control')
export class AIUXSegmentedControl extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: inline-block; }
      .group { display: inline-flex; padding: 2px; gap: 2px; border: 1px solid var(--_border); border-radius: calc(var(--_radius) + 2px); background: var(--_surface-muted); }
      button {
        all: unset; box-sizing: border-box; cursor: pointer; padding: 0.25rem 0.75rem;
        border-radius: var(--_radius); font-size: 0.875rem; color: var(--_neutral); white-space: nowrap;
      }
      button:hover:not([disabled]) { color: var(--_text); }
      button[aria-checked='true'] { background: var(--_surface); color: var(--_text); font-weight: 600; box-shadow: 0 0 0 1px var(--_border); }
      button:focus-visible { outline: 2px solid var(--_primary); outline-offset: 1px; }
      button[disabled] { opacity: 0.45; cursor: not-allowed; }
    `
  ];

  @property({ attribute: false }) options: SegmentOption[] = [];
  @property({ reflect: true }) value = '';
  @property({ attribute: 'aria-label' }) override ariaLabel: string | null = null;

  private _select(value: string): void {
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(
      new CustomEvent<SegmentChangeDetail>('aiux-segment-change', { detail: { value }, bubbles: true, composed: true })
    );
  }

  private _onKeydown(event: KeyboardEvent): void {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const current = this._focusIndex();
    const idx = nextEnabledIndex(this.options, current, step);
    if (idx < 0) return;
    this._select(this.options[idx].value);
    this.updateComplete.then(() => (this.renderRoot.querySelectorAll('button')[idx] as HTMLButtonElement)?.focus());
  }

  /** The checked option, or the first enabled one when nothing is checked (it holds tabindex=0). */
  private _focusIndex(): number {
    const checked = this.options.findIndex((o) => o.value === this.value);
    return checked >= 0 ? checked : this.options.findIndex((o) => !o.disabled);
  }

  protected render(): TemplateResult {
    const focusable = this._focusIndex();
    return html`<div class="group" role="radiogroup" aria-label=${this.ariaLabel ?? ''} @keydown=${this._onKeydown}>
      ${this.options.map(
        (o, i) => html`<button
          type="button"
          role="radio"
          aria-checked=${o.value === this.value ? 'true' : 'false'}
          tabindex=${i === focusable ? 0 : -1}
          ?disabled=${o.disabled}
          @click=${() => this._select(o.value)}
        >${o.label}</button>`
      )}
    </div>`;
  }
}
