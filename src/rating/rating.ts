import { css, html, svg } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export interface RatingChangeDetail {
  value: number;
}

/** Snap `value` to `step` and clamp to `[0, max]`. */
export function roundRating(value: number, step: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(0, Number(snapped.toFixed(6))));
}

const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';

/**
 * Star rating input / display.
 *
 * @fires aiux-rating-change - `detail` is `{ value }`.
 */
@customElement('aiux-rating')
export class AIUXRating extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: inline-block; --_star: var(--aiux-rating-color, #e3a008); }
      .stars { display: inline-flex; gap: 2px; }
      :host(:not([readonly])) .stars { cursor: pointer; }
      .star { position: relative; width: 1.5rem; height: 1.5rem; }
      svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .empty path { fill: none; stroke: var(--_border); stroke-width: 1.5; stroke-linejoin: round; }
      .full { overflow: hidden; }
      .full path { fill: var(--_star); stroke: var(--_star); stroke-width: 1.5; stroke-linejoin: round; }
      .stars:focus-visible { outline: 2px solid var(--_primary); outline-offset: 2px; border-radius: 4px; }
    `
  ];

  @property({ type: Number, reflect: true }) value = 0;
  @property({ type: Number }) max = 5;
  @property({ type: Boolean, attribute: 'allow-half' }) allowHalf = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property() label = '';
  @state() private _hover: number | null = null;

  private get _step(): number {
    return this.allowHalf ? 0.5 : 1;
  }

  private _set(value: number): void {
    const next = roundRating(value, this._step, this.max);
    if (next === this.value) return;
    this.value = next;
    this.dispatchEvent(
      new CustomEvent<RatingChangeDetail>('aiux-rating-change', { detail: { value: next }, bubbles: true, composed: true })
    );
  }

  private _valueAt(event: MouseEvent, index: number): number {
    if (!this.allowHalf) return index + 1;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return index + (event.clientX - rect.left < rect.width / 2 ? 0.5 : 1);
  }

  private _onKeydown(event: KeyboardEvent): void {
    if (this.readonly) return;
    const map: Record<string, number> = {
      ArrowRight: this.value + this._step,
      ArrowUp: this.value + this._step,
      ArrowLeft: this.value - this._step,
      ArrowDown: this.value - this._step,
      Home: 0,
      End: this.max
    };
    if (event.key in map) {
      event.preventDefault();
      this._set(map[event.key]);
    }
  }

  protected render(): TemplateResult {
    const shown = this._hover ?? this.value;
    const interactive = !this.readonly;
    return html`<div
      class="stars"
      part="stars"
      role=${interactive ? 'slider' : 'img'}
      aria-label=${this.label || msg('Rating')}
      aria-valuemin=${interactive ? '0' : (undefined as unknown as string)}
      aria-valuemax=${interactive ? String(this.max) : (undefined as unknown as string)}
      aria-valuenow=${interactive ? String(this.value) : (undefined as unknown as string)}
      aria-valuetext=${msg(`${this.value} of ${this.max}`)}
      tabindex=${interactive ? 0 : -1}
      @keydown=${this._onKeydown}
      @mouseleave=${() => (this._hover = null)}
    >
      ${Array.from({ length: this.max }, (_, i) => {
        const fill = Math.min(1, Math.max(0, shown - i));
        return html`<span
          class="star"
          @click=${interactive ? (e: MouseEvent) => this._set(this._valueAt(e, i)) : null}
          @mousemove=${interactive ? (e: MouseEvent) => (this._hover = this._valueAt(e, i)) : null}
        >
          ${svg`<svg class="empty" viewBox="0 0 24 24" aria-hidden="true"><path d=${STAR} /></svg>`}
          <span class="full" style="position:absolute;inset:0;width:${fill * 100}%">
            ${svg`<svg class="full" viewBox="0 0 24 24" aria-hidden="true" style="width:1.5rem"><path d=${STAR} /></svg>`}
          </span>
        </span>`;
      })}
    </div>`;
  }
}
