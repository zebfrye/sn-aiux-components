import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { AIUXElement } from '../base/index.js';
import { badgeStyles } from './badge.styles.js';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeAppearance = 'subtle' | 'outline' | 'solid';

export interface BadgeRemoveDetail {
  /** Value of the `value` property, or the text content when no value is set. */
  value: string;
}

/**
 * Small status / count / category label.
 *
 * @slot - Badge text.
 * @fires aiux-badge-remove - User activated the remove button (only when `removable`).
 *   The badge does not remove itself; the consumer decides.
 */
@customElement('aiux-badge')
export class AIUXBadge extends AIUXElement {
  static styles = badgeStyles;

  @property({ reflect: true }) variant: BadgeVariant = 'neutral';
  @property({ reflect: true }) size: BadgeSize = 'md';
  @property({ reflect: true }) appearance: BadgeAppearance = 'subtle';
  /** Show a leading status dot. */
  @property({ type: Boolean }) dot = false;
  @property({ type: Boolean, reflect: true }) removable = false;
  /** Identifier reported in `aiux-badge-remove`. */
  @property() value = '';
  /** Accessible label for the remove button. */
  @property({ attribute: 'remove-label' }) removeLabel = '';

  protected _remove(event: Event): void {
    event.stopPropagation();
    const value = this.value || (this.textContent ?? '').trim();
    this.dispatchEvent(
      new CustomEvent<BadgeRemoveDetail>('aiux-badge-remove', {
        detail: { value },
        bubbles: true,
        composed: true
      })
    );
  }

  protected render(): TemplateResult {
    const label = this.removeLabel || msg('Remove');
    return html`<span class="badge" part="badge">
      ${this.dot ? html`<span class="dot" aria-hidden="true"></span>` : nothing}
      <span class="label"><slot></slot></span>
      ${this.removable
        ? html`<button type="button" class="remove" part="remove" aria-label=${label} @click=${this._remove}>
            <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>`
        : nothing}
    </span>`;
  }
}
