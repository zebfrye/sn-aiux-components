import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AIUXElement } from '../base/index.js';
import { avatarStyles } from './avatar.styles.js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = '' | 'online' | 'away' | 'busy' | 'offline';

/** Up to two initials: first letter of the first and last word. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const first = Array.from(words[0])[0] ?? '';
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Stable hue (0-359) derived from a string so one person always gets one colour. */
export function hueFromString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash % 360;
}

/**
 * User / entity avatar: photo with initials fallback and optional presence dot.
 *
 * @fires aiux-avatar-error - The image failed to load and initials are shown instead.
 */
@customElement('aiux-avatar')
export class AIUXAvatar extends AIUXElement {
  static styles = avatarStyles;

  @property() name = '';
  @property() src = '';
  @property({ reflect: true }) size: AvatarSize = 'md';
  @property({ reflect: true }) shape: 'circle' | 'square' = 'circle';
  @property({ reflect: true }) status: AvatarStatus = '';
  @state() private _imageFailed = false;

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('src')) this._imageFailed = false;
  }

  private _onError(): void {
    this._imageFailed = true;
    this.dispatchEvent(new CustomEvent('aiux-avatar-error', { bubbles: true, composed: true }));
  }

  protected render(): TemplateResult {
    const showImage = !!this.src && !this._imageFailed;
    const initials = getInitials(this.name);
    const style = `background:hsl(${hueFromString(this.name || 'anonymous')} 45% 38%)`;
    return html`
      <span class="avatar" part="avatar" role="img" aria-label=${this.name || 'Avatar'} style=${showImage ? '' : style}>
        ${showImage
          ? html`<img src=${this.src} alt="" loading="lazy" @error=${this._onError} />`
          : initials || html`<svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true"><path fill="currentColor" d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5Z"/></svg>`}
      </span>
      ${this.status ? html`<span class="status ${this.status}" part="status" title=${this.status}></span>` : nothing}
    `;
  }
}
