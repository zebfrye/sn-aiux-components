# sn-aiux-components

Custom Lit elements for small UI primitives that `@servicenow/aiux` does not ship. Elements extend
`AIUXElement`, use `@lit/localize` for strings and fall back to AIUX theme tokens
(`--color-primary`, `--color-error`, `--radius-box`, ...) with neutral defaults.

| Element | Purpose | Key API |
|---|---|---|
| `aiux-badge` | Status/count/category label | `variant`, `size`, `appearance`, `dot` |
| `aiux-tag` | Removable chip (badge) | `removable`, `value`, event `aiux-badge-remove` |
| `aiux-avatar` / `aiux-avatar-group` | Photo/initials avatar, presence dot, "+N" overflow | `name`, `src`, `size`, `status`; group `max` |
| `aiux-progress` | Bar or ring, determinate or indeterminate | `value`, `max`, `shape`, `variant`, `indeterminate`, `show-value` |
| `aiux-skeleton` | Loading placeholder | `shape`, `lines`, `width`, `height` |
| `aiux-stat-tile` | KPI tile with delta and sparkline slot | `label`, `value`, `delta`, `lower-is-better`, `loading` |
| `aiux-copy-button` / `aiux-code-block` | Copy to clipboard, read-only code block | `value`; event `aiux-copy`; `code`, `language`, `wrap` |

```ts
import 'sn-aiux-components'; // registers every element
```

`@servicenow/aiux` is an optional peer dependency: tests and the demo alias
`@servicenow/aiux/aiux-components-core` to a thin `LitElement` stub (see `vite.config.ts`).
Inside an AIUX app the real `AIUXElement` is used.

## Scripts
- `npm run dev`: demo at `/demo/index.html`
- `npm test`: Vitest + jsdom
- `npm run build`: typecheck and build the demo
