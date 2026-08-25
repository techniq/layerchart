---
'layerchart': patch
---

fix(Highlight): Resolve `c`-grouped points against the chart's rows rather than its `data`, so a chart whose data is nested (a `stack()` passing its rows as `flatData`) no longer hands the position accessors a series, and a category whose value is a span (`y={[0, 1]}`) is pointed by the series path instead of being scaled to `NaN`
