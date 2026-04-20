---
'layerchart': patch
---

fix(Chart): Explicit `<Chart data>` now takes precedence over marks' implicit-series data

When a mark registered its own filtered dataset via `markInfo` (e.g. a decorative `<Text data={highlighted}>` showing labels for a subset), `ctx.data` would silently switch to that filtered subset via `seriesState.visibleSeriesData`, causing sibling array-driven marks (like `<Link>`) to iterate only the subset.

Now `ctx.data` prefers an explicit non-empty `<Chart data>` when present, falling back to `visibleSeriesData` only when the chart has no own data (the series-driven chart case). Marks with their own data still contribute to `flatData` for domain calculation, so scale extents are unchanged.
