import { describe, expect, it } from 'vitest';
import './index.js';
import { buildJsonTree, containerPaths } from './index.js';
import type { AIUXJsonViewer } from './index.js';
import { fixture, shadow } from '../test-stubs/fixture.js';

const sample = { id: 1, tags: ['a', 'b'], 'odd key': { ok: true, none: null } };

describe('buildJsonTree', () => {
  it('builds typed nodes with JSONPath-like paths', () => {
    const tree = buildJsonTree(sample);
    expect(tree.type).toBe('object');
    expect(tree.children.map((c) => c.path)).toEqual(['$.id', '$.tags', '$["odd key"]']);
    expect(tree.children[1].children[0].path).toBe('$.tags[0]');
    expect(tree.children[2].children[1].type).toBe('null');
  });
  it('survives circular references', () => {
    const a: Record<string, unknown> = {};
    a.self = a;
    expect(buildJsonTree(a).children[0].value).toBe('[Circular]');
  });
});

describe('containerPaths', () => {
  it('limits by depth', () => {
    const tree = buildJsonTree(sample);
    expect(containerPaths(tree, 1)).toEqual(['$']);
    expect(containerPaths(tree)).toEqual(['$', '$.tags', '$["odd key"]']);
  });
});

describe('aiux-json-viewer', () => {
  it('expands the first level and toggles children', async () => {
    const el = await fixture<AIUXJsonViewer>('<aiux-json-viewer></aiux-json-viewer>');
    el.data = sample;
    await el.updateComplete;
    expect(shadow(el).querySelector('[role=tree]')).toBeTruthy();
    const tags = [...shadow(el).querySelectorAll('li')].find((li) => li.querySelector(':scope > .row > .key')?.textContent === 'tags')!;
    expect(tags.getAttribute('aria-expanded')).toBe('false');
    (tags.querySelector('.toggle') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(shadow(el).querySelectorAll('li').length).toBeGreaterThan(5);
  });

  it('parses the json attribute and reports invalid JSON', async () => {
    const ok = await fixture<AIUXJsonViewer>(`<aiux-json-viewer json='{"a":1}'></aiux-json-viewer>`);
    expect(shadow(ok).textContent).toContain('1');
    const bad = await fixture<AIUXJsonViewer>(`<aiux-json-viewer json='{oops'></aiux-json-viewer>`);
    expect(shadow(bad).querySelector('[role=alert]')).toBeTruthy();
  });

  it('expandAll / collapseAll', async () => {
    const el = await fixture<AIUXJsonViewer>('<aiux-json-viewer></aiux-json-viewer>');
    el.data = sample;
    await el.updateComplete;
    el.expandAll();
    await el.updateComplete;
    const expanded = shadow(el).querySelectorAll('li[aria-expanded=true]').length;
    el.collapseAll();
    await el.updateComplete;
    expect(shadow(el).querySelectorAll('li[aria-expanded=true]').length).toBeLessThan(expanded);
  });
});
