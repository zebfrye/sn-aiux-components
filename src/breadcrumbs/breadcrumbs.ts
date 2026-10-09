import { css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';

export interface Crumb {
  label: string;
  href?: string;
}

export interface BreadcrumbClickDetail {
  item: Crumb;
  index: number;
}

export type CrumbEntry = { crumb: Crumb; index: number } | { ellipsis: true };

/**
 * Keep the first crumb and the last `max - 1`; collapse the middle into one ellipsis entry.
 * `max <= 0` (or a trail that already fits) returns every crumb.
 */
export function collapseCrumbs(items: Crumb[], max: number): CrumbEntry[] {
  const all: CrumbEntry[] = items.map((crumb, index) => ({ crumb, index }));
  if (max <= 1 || items.length <= max) return all;
  const tail = max - 1;
  return [all[0], { ellipsis: true }, ...all.slice(items.length - tail)];
}

/**
 * Navigation trail. The last item is the current page.
 *
 * @fires aiux-breadcrumb-click - Cancelable. `detail` is `{ item, index }`; calling
 *   `preventDefault()` stops the link navigation (useful for client-side routing).
 */
@customElement('aiux-breadcrumbs')
export class AIUXBreadcrumbs extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: block; }
      ol { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem; margin: 0; padding: 0; list-style: none; font-size: 0.875rem; }
      li { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--_neutral); }
      li:not(:last-child)::after { content: '/'; color: var(--_border); }
      :host([separator='chevron']) li:not(:last-child)::after { content: '›'; }
      a, button { color: var(--_primary); text-decoration: none; }
      a:hover, button:hover { text-decoration: underline; }
      a:focus-visible, button:focus-visible { outline: 2px solid var(--_primary); outline-offset: 2px; border-radius: 2px; }
      button { all: unset; cursor: pointer; color: var(--_primary); }
      button:focus-visible { outline: 2px solid var(--_primary); outline-offset: 2px; }
      [aria-current='page'] { color: var(--_text); font-weight: 600; }
    `
  ];

  @property({ attribute: false }) items: Crumb[] = [];
  /** Maximum visible crumbs before the middle collapses to "…". `0` shows all. */
  @property({ type: Number }) max = 0;
  @property({ reflect: true }) separator: 'slash' | 'chevron' = 'slash';
  @property({ attribute: 'aria-label' }) override ariaLabel: string | null = null;
  @state() private _expanded = false;

  private _click(event: MouseEvent, item: Crumb, index: number): void {
    const notPrevented = this.dispatchEvent(
      new CustomEvent<BreadcrumbClickDetail>('aiux-breadcrumb-click', {
        detail: { item, index },
        bubbles: true,
        composed: true,
        cancelable: true
      })
    );
    if (!notPrevented) event.preventDefault();
  }

  protected render(): TemplateResult {
    const entries = this._expanded ? collapseCrumbs(this.items, 0) : collapseCrumbs(this.items, this.max);
    const last = this.items.length - 1;
    return html`<nav aria-label=${this.ariaLabel || msg('Breadcrumb')}>
      <ol part="list">
        ${entries.map((entry) =>
          'ellipsis' in entry
            ? html`<li>
                <button type="button" aria-label=${msg('Show full path')} @click=${() => (this._expanded = true)}>…</button>
              </li>`
            : html`<li>
                ${entry.index === last || !entry.crumb.href
                  ? html`<span aria-current=${entry.index === last ? 'page' : nothing}>${entry.crumb.label}</span>`
                  : html`<a href=${entry.crumb.href} @click=${(e: MouseEvent) => this._click(e, entry.crumb, entry.index)}>${entry.crumb.label}</a>`}
              </li>`
        )}
      </ol>
    </nav>`;
  }
}
