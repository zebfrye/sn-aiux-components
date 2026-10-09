import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { avatarGroupStyles } from './avatar.styles.js';

/**
 * Overlapping stack of `aiux-avatar`s. Avatars beyond `max` are hidden and summarised as "+N".
 *
 * @slot - `aiux-avatar` elements.
 */
@customElement('aiux-avatar-group')
export class AIUXAvatarGroup extends AIUXElement {
  static styles = avatarGroupStyles;

  /** Maximum avatars shown before collapsing into "+N". `0` shows all. */
  @property({ type: Number }) max = 0;
  @state() private _hidden = 0;

  private _onSlotChange(event: Event): void {
    const avatars = (event.target as HTMLSlotElement)
      .assignedElements({ flatten: true })
      .filter((el) => el.localName === 'aiux-avatar');
    this._apply(avatars as HTMLElement[]);
  }

  private _apply(avatars: HTMLElement[]): void {
    const limit = this.max > 0 ? this.max : avatars.length;
    avatars.forEach((el, i) => (el.hidden = i >= limit));
    this._hidden = Math.max(0, avatars.length - limit);
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('max')) {
      const slot = this.renderRoot.querySelector('slot');
      if (slot) {
        this._apply(
          slot.assignedElements({ flatten: true }).filter((el) => el.localName === 'aiux-avatar') as HTMLElement[]
        );
      }
    }
  }

  protected render(): TemplateResult {
    return html`<slot @slotchange=${this._onSlotChange}></slot>
      ${this._hidden > 0
        ? html`<span class="overflow" part="overflow" role="img" aria-label="${this._hidden} more">+${this._hidden}</span>`
        : nothing}`;
  }
}
