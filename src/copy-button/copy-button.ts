import { css, html, svg } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export interface CopyDetail {
  value: string;
  success: boolean;
}

/** Copy text via the async Clipboard API, falling back to a hidden textarea + execCommand. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Icon button that copies `value` to the clipboard and announces the result.
 *
 * @fires aiux-copy - Copy attempted; `detail` is `{ value, success }`.
 */
@customElement('aiux-copy-button')
export class AIUXCopyButton extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: inline-flex; }
      button {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--_border);
        border-radius: var(--_radius);
        background: var(--_surface);
        color: var(--_text);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }
      button:hover { background: var(--_surface-muted); }
      button:focus-visible { outline: 2px solid var(--_primary); outline-offset: 2px; }
      button[disabled] { opacity: 0.5; cursor: not-allowed; }
      .done { color: var(--_success); }
      .failed { color: var(--_error); }
      .sr-only {
        position: absolute; width: 1px; height: 1px; overflow: hidden;
        clip: rect(0 0 0 0); white-space: nowrap;
      }
    `
  ];

  @property() value = '';
  @property() label = '';
  /** Milliseconds the success/failure state stays visible. */
  @property({ type: Number, attribute: 'reset-delay' }) resetDelay = 2000;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @state() private _status: 'idle' | 'copied' | 'failed' = 'idle';
  private _timer?: ReturnType<typeof setTimeout>;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  /** Programmatic trigger; resolves with the copy result. */
  async copy(): Promise<boolean> {
    const success = await copyText(this.value);
    this._status = success ? 'copied' : 'failed';
    this.dispatchEvent(
      new CustomEvent<CopyDetail>('aiux-copy', { detail: { value: this.value, success }, bubbles: true, composed: true })
    );
    clearTimeout(this._timer);
    this._timer = setTimeout(() => (this._status = 'idle'), this.resetDelay);
    return success;
  }

  protected render(): TemplateResult {
    const text = this.label || msg('Copy');
    const status = this._status;
    const shown = status === 'copied' ? msg('Copied') : status === 'failed' ? msg('Copy failed') : text;
    return html`<button
        type="button"
        part="button"
        class=${status === 'copied' ? 'done' : status === 'failed' ? 'failed' : ''}
        ?disabled=${this.disabled || !this.value}
        @click=${this.copy}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">
          ${status === 'copied'
            ? svg`<path d="M3 8.5l3.2 3L13 4.5" stroke-linecap="round" stroke-linejoin="round" />`
            : svg`<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.5" />`}
        </svg>
        <span>${shown}</span>
      </button>
      <span class="sr-only" role="status" aria-live="polite">${status === 'idle' ? '' : shown}</span>`;
  }
}
