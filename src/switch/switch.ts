import { css, html } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { hostStyles, reducedMotion, tokenStyles } from '../styles/tokens.js';

export interface SwitchChangeDetail {
  checked: boolean;
}

/**
 * Standalone on/off toggle. Form-associated: submits `name=value` (default `on`) when checked.
 *
 * @slot - Label text.
 * @fires aiux-switch-change - `detail` is `{ checked }`.
 */
@customElement('aiux-switch')
export class AIUXSwitch extends AIUXElement {
  static formAssociated = true;
  static styles = [
    tokenStyles,
    hostStyles,
    reducedMotion,
    css`
      :host { display: inline-flex; }
      button {
        all: unset; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer;
        font-size: 0.875rem; color: var(--_text);
      }
      .track {
        position: relative; flex: none; width: 2.25rem; height: 1.25rem; border-radius: 999px;
        background: var(--_border); transition: background 0.15s;
      }
      .thumb {
        position: absolute; top: 2px; inset-inline-start: 2px; width: calc(1.25rem - 4px); height: calc(1.25rem - 4px);
        border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / 0.3); transition: transform 0.15s;
      }
      button[aria-checked='true'] .track { background: var(--_primary); }
      button[aria-checked='true'] .thumb { transform: translateX(1rem); }
      :host(:dir(rtl)) button[aria-checked='true'] .thumb { transform: translateX(-1rem); }
      button:focus-visible .track { outline: 2px solid var(--_primary); outline-offset: 2px; }
      button[disabled] { opacity: 0.5; cursor: not-allowed; }
    `
  ];

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() name = '';
  @property() value = 'on';
  private _internals?: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals?.();
  }

  protected updated(changed: PropertyValues): void {
    if (changed.has('checked') || changed.has('value')) {
      this._internals?.setFormValue?.(this.checked ? this.value : null);
    }
  }

  /** Form reset restores the unchecked state. */
  formResetCallback(): void {
    this.checked = false;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent<SwitchChangeDetail>('aiux-switch-change', {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true
      })
    );
  }

  protected render(): TemplateResult {
    return html`<button type="button" role="switch" aria-checked=${this.checked ? 'true' : 'false'} ?disabled=${this.disabled} @click=${this.toggle}>
      <span class="track" part="track"><span class="thumb" part="thumb"></span></span>
      <span part="label"><slot></slot></span>
    </button>`;
  }
}
