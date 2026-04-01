---
'layerchart': minor
---

feat: Mark registration for automatic domain calculation, accessor aggregation, and implicit series

- Marks (Spline, Area, Points, Bars) now register their data, accessors, and colors with the Chart via `registerMark()`.
- Chart automatically aggregates y/x accessors from marks, removing the need to pass `y={['apples', 'oranges']}` when each mark specifies its own `y`. Works for both horizontal (`valueAxis='y'`) and vertical (`valueAxis='x'`) charts.
- Per-mark `data` props are included in the chart's domain calculation automatically.
- Implicit series are generated from mark registrations when no explicit `series` prop is provided, enabling tooltip and legend support without requiring series definitions.
