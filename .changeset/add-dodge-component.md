---
'layerchart': minor
---

feat(Dodge): Add Dodge component for deterministic non-overlapping layout

A new composition component (similar to `ForceSimulation`) that packs items along one axis to avoid overlaps. Modeled after [Observable Plot's `dodge` transform](https://observablehq.com/plot/transforms/dodge):

- `axis`: `'x'` or `'y'` — which axis to dodge along (default `'y'`)
- `anchor`: `'top'`/`'middle'`/`'bottom'` (for `axis='y'`) or `'left'`/`'middle'`/`'right'` (for `axis='x'`) — controls which edge items grow away from
- `padding`: minimum px gap between items
- `r`: collision radius per item (constant or accessor). When omitted, falls back to the chart's `r` accessor / `rScale` (matching `Points`), then to a default of `5`.
- `position`: override the anchor-axis pixel accessor (defaults to chart's `xGet`/`yGet`)

Yields each item's computed pixel `x`/`y` (and original `index`) via the children snippet, so you can render with any primitive (`Circle`, `Text`, etc.).

Also includes a `rowHeight` mode that switches from circular to row-based rectangular packing — useful for text labels where circular collision would produce unnecessarily large vertical gaps. The pure `dodge()` algorithm is exported from `Dodge.shared.svelte.ts` for direct use.

Algorithm modeled after Observable Plot / SveltePlot: maintains an interval tree of placed items keyed by anchor-axis extent, queries it for items in the new item's collision zone, and builds candidate dodge-axis positions from circle-tangency math. Currently implemented as a linear-scan tracker with the same API; can be swapped for a real interval tree without API changes if profiling demands it.
