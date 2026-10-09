import '../src/index.js';
import type { AIUXBreadcrumbs, AIUXSegmentedControl, AIUXJsonViewer, AIUXMarkdown } from '../src/index.js';

const $ = <T extends Element>(sel: string) => document.querySelector(sel) as T;

$<AIUXBreadcrumbs>('#crumbs').items = ['Home', 'Incidents', 'Network', 'INC0010001', 'Details'].map((label, i) => ({
  label,
  href: `#${i}`
}));
$<AIUXSegmentedControl>('#seg').options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year', disabled: true }
];
$<AIUXJsonViewer>('#json').data = {
  number: 'INC0010001',
  priority: 1,
  active: true,
  assigned_to: null,
  tags: ['network', 'vpn'],
  caller: { name: 'Ada Lovelace', 'sys id': 'abc123' }
};
$<AIUXMarkdown>('#md').content = `## Summary

The **VPN** outage was caused by an expired certificate. Steps taken:

1. Renewed the cert
2. Restarted \`vpn-gw\`

> Monitor for 24h.

| Host | Status |
|---|---|
| gw-1 | ok |

[Runbook](https://example.com)`;
