---
'layerchart': patch
---

perf: Lazy-load opt-in features in `core` path

5 components/dependencies that previously sat in every `<Chart>` user's sync graph are now dynamically imported only when the corresponding feature is used:

- `BrushContext` in `Chart` — only loads when `<Chart brush={...}>` is set (default `undefined`)
- `DefaultTooltip` in `ChartChildren` — only loads when `tooltipContext` is set and no custom `tooltip` snippet is provided
- `d3-quadtree` in `TooltipContext` — only loads when `mode` is `'quadtree'`, `'quadtree-x'`, or `'quadtree-y'`
- `Spline` in `Grid` — only loads when rendering radial linear grid lines (`<Chart radial>` with `radialY="linear"`)
- `Bar` in `Highlight` — only loads when `<Chart highlight={{ bar: ... }}>` is set (default `false`)

Result: **~10 KB gz off `core`** (115.6 → 105.25 KB) and comparable savings on every cartesian/geo/graph/hierarchy scenario, with no impact on rendered output for users who already opt into these features.

Also switches internal `@layerstack/svelte-actions` imports from the barrel (`@layerstack/svelte-actions`) to sub-paths (`@layerstack/svelte-actions/styles`, `@layerstack/svelte-actions/portal`). No production bundle effect — bundlers already tree-shake the unused `popover.js` — but it stops the Svelte REPL/CDN from eagerly fetching `@floating-ui/dom` (popover's transitive dep) when consumers load `layerchart` from a CDN.
