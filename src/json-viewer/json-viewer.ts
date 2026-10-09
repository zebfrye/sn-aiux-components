import { css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { AIUXElement } from '../base/index.js';
import { hostStyles, tokenStyles } from '../styles/tokens.js';
import { copyText } from '../copy-button/copy-button.js';

export type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export interface JsonNode {
  key: string;
  /** JSONPath-like path, e.g. `$.items[0].name`. */
  path: string;
  type: JsonType;
  value: unknown;
  children: JsonNode[];
}

export interface JsonCopyDetail {
  path: string;
  value: unknown;
}

const IDENT = /^[A-Za-z_$][\w$]*$/;

/** Convert any JSON-compatible value into a tree of nodes with stable paths. */
export function buildJsonTree(value: unknown, key = '$', path = '$', seen = new WeakSet<object>()): JsonNode {
  if (value === null || value === undefined) return { key, path, type: 'null', value: null, children: [] };
  if (Array.isArray(value)) {
    if (seen.has(value)) return { key, path, type: 'string', value: '[Circular]', children: [] };
    seen.add(value);
    return {
      key, path, type: 'array', value,
      children: value.map((v, i) => buildJsonTree(v, String(i), `${path}[${i}]`, seen))
    };
  }
  if (typeof value === 'object') {
    if (seen.has(value)) return { key, path, type: 'string', value: '[Circular]', children: [] };
    seen.add(value);
    return {
      key, path, type: 'object', value,
      children: Object.entries(value as Record<string, unknown>).map(([k, v]) =>
        buildJsonTree(v, k, IDENT.test(k) ? `${path}.${k}` : `${path}[${JSON.stringify(k)}]`, seen)
      )
    };
  }
  const type: JsonType = typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string';
  return { key, path, type, value: type === 'string' ? String(value) : value, children: [] };
}

/** Paths of every container node up to `depth` levels (root = depth 0); `Infinity` for all. */
export function containerPaths(node: JsonNode, depth = Infinity, level = 0): string[] {
  if (!node.children.length || level >= depth) return [];
  return [node.path, ...node.children.flatMap((c) => containerPaths(c, depth, level + 1))];
}

/**
 * Collapsible JSON tree with copy-path support.
 * Set `data` (any value) or `json` (string); invalid JSON shows an error.
 *
 * @fires aiux-json-copy - A path was copied; `detail` is `{ path, value }`.
 */
@customElement('aiux-json-viewer')
export class AIUXJsonViewer extends AIUXElement {
  static styles = [
    tokenStyles,
    hostStyles,
    css`
      :host { display: block; font: 0.8125rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--_text); }
      ul { list-style: none; margin: 0; padding: 0; }
      ul ul { margin-inline-start: 1.1rem; border-inline-start: 1px dashed var(--_border); padding-inline-start: 0.5rem; }
      .row { display: flex; align-items: baseline; gap: 0.35rem; }
      .toggle { all: unset; cursor: pointer; width: 1rem; color: var(--_neutral); text-align: center; }
      .toggle:focus-visible { outline: 2px solid var(--_primary); border-radius: 2px; }
      .spacer { width: 1rem; display: inline-block; }
      .key { color: var(--_primary); }
      .string { color: var(--_success); }
      .number { color: var(--_info); }
      .boolean, .null { color: var(--_warning); }
      .meta { color: var(--_neutral); }
      .key + .meta { margin-inline-start: -0.3rem; }
      .copy { all: unset; cursor: pointer; opacity: 0; color: var(--_neutral); font-size: 0.75rem; }
      .row:hover .copy, .copy:focus-visible { opacity: 1; }
      .error { color: var(--_error); }
    `
  ];

  @property({ attribute: false }) data: unknown = undefined;
  @property() json = '';
  /** Levels expanded initially (root = 0). */
  @property({ type: Number, attribute: 'expand-depth' }) expandDepth = 1;
  @state() private _expanded = new Set<string>();
  @state() private _tree: JsonNode | null = null;
  @state() private _error = '';

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('data') || changed.has('json') || changed.has('expandDepth')) {
      this._error = '';
      let source: unknown = this.data;
      if (this.data === undefined && this.json) {
        try {
          source = JSON.parse(this.json);
        } catch (e) {
          this._tree = null;
          this._error = (e as Error).message;
          return;
        }
      }
      this._tree = source === undefined ? null : buildJsonTree(source);
      this._expanded = new Set(this._tree ? containerPaths(this._tree, this.expandDepth) : []);
    }
  }

  expandAll(): void {
    if (this._tree) this._expanded = new Set(containerPaths(this._tree));
  }

  collapseAll(): void {
    this._expanded = new Set();
  }

  private _toggle(path: string): void {
    const next = new Set(this._expanded);
    next.has(path) ? next.delete(path) : next.add(path);
    this._expanded = next;
  }

  private async _copy(node: JsonNode): Promise<void> {
    await copyText(node.path);
    this.dispatchEvent(
      new CustomEvent<JsonCopyDetail>('aiux-json-copy', { detail: { path: node.path, value: node.value }, bubbles: true, composed: true })
    );
  }

  private _preview(node: JsonNode): string {
    const n = node.children.length;
    return node.type === 'array' ? `[${n}]` : `{${n}}`;
  }

  private _renderNode(node: JsonNode, isRoot: boolean): TemplateResult {
    const container = node.children.length > 0;
    const open = this._expanded.has(node.path);
    const label = isRoot ? nothing : html`<span class="key">${node.key}</span><span class="meta">:</span>`;
    return html`<li role="treeitem" aria-expanded=${container ? String(open) : nothing as unknown as string}>
      <div class="row">
        ${container
          ? html`<button class="toggle" type="button" aria-label=${open ? msg('Collapse') : msg('Expand')} @click=${() => this._toggle(node.path)}>${open ? '▾' : '▸'}</button>`
          : html`<span class="spacer"></span>`}
        ${label}
        ${container
          ? html`<span class="meta">${open ? (node.type === 'array' ? '[' : '{') : this._preview(node)}</span>`
          : node.type === 'object' || node.type === 'array'
            ? html`<span class="meta">${node.type === 'array' ? '[]' : '{}'}</span>`
            : html`<span class=${node.type}>${node.type === 'string' ? JSON.stringify(node.value) : String(node.value)}</span>`}
        <button class="copy" type="button" aria-label=${msg('Copy path')} @click=${() => this._copy(node)}>${msg('copy path')}</button>
      </div>
      ${container && open ? html`<ul role="group">${node.children.map((c) => this._renderNode(c, false))}</ul>` : nothing}
    </li>`;
  }

  protected render(): TemplateResult {
    if (this._error) return html`<div class="error" role="alert">${this._error}</div>`;
    if (!this._tree) return html`${nothing}`;
    return html`<ul role="tree" aria-label=${msg('JSON')}>${this._renderNode(this._tree, true)}</ul>`;
  }
}
