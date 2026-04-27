---
'layerchart': patch
---

perf: Lazy-load opt-in features in `core` path

Three components that previously sat in every `<Chart>` user's sync graph are now dynamically imported only when the corresponding feature is used:

- `Spline` in `Grid` — only loads when rendering radial linear grid lines (`<Chart radial>` with `radialY="linear"`)
- `Bar` in `Highlight` — only loads when `<Chart highlight={{ bar: ... }}>` is set (default `false`)
- `BrushContext` in `Chart` — only loads when `<Chart brush={...}>` is set (default `undefined`)

Result: **~4 KB gz off `core`** (115.6 → 111.3 KB) and comparable savings on every cartesian/geo/graph/hierarchy scenario, with no impact on rendered output for users who already opt into these features.

Also switches internal `@layerstack/svelte-actions` imports from the barrel (`@layerstack/svelte-actions`) to sub-paths (`@layerstack/svelte-actions/styles`, `@layerstack/svelte-actions/portal`). No production bundle effect — bundlers already tree-shake the unused `popover.js` — but it stops the Svelte REPL/CDN from eagerly fetching `@floating-ui/dom` (popover's transitive dep) when consumers load `layerchart` from a CDN.
