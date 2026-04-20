---
'layerchart': patch
---

fix(Chart): Explicit `<Chart data>` now takes precedence over marks' implicit-series data

When a mark registered its own filtered dataset via `markInfo` (e.g. a decorative `<Text data={highlighted}>` showing labels for a subset), two things went wrong:

1. `ctx.data` would silently switch to the filtered subset via `seriesState.visibleSeriesData`, causing sibling array-driven marks (like `<Link>`) to iterate only the subset.
2. An implicit series would be created from the decorative mark, narrowing the domain calculation to only the subset's values.

Now when `<Chart data>` is explicit (non-empty):
- `ctx.data` always returns the chart's data.
- Marks whose axis accessor matches the chart's axis accessor (including any element of an array accessor like `y={['v1', 'v2']}`) are treated as decorative and don't create implicit series — even if they have their own `data` array.

Marks with their own data still contribute to `flatData` for domain calculation when their accessor differs from the chart's (the multi-dataset / multi-series scenario).
