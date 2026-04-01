---
'layerchart': major
---

breaking(Chart): Remove `isVertical` from ChartState, add `valueAxis` prop to `Chart`

`ChartState.isVertical` has been removed in favor of `ChartState.valueAxis` (`'x'` | `'y'`), which explicitly defines which axis represents the value (dependent variable).

Simplified charts (`BarChart`, `LineChart`, `AreaChart`, `ScatterChart`) still accept the `orientation` prop as before — each chart maps it to the correct `valueAxis` internally. The `<Chart>` component itself now uses `valueAxis` directly, since `orientation` is ambiguous at that level (a "vertical" BarChart has `valueAxis="y"` while a "vertical" LineChart has `valueAxis="x"`).

When accessing chart state:
```diff
- if (chartContext.isVertical) { ... }
+ if (chartContext.valueAxis === 'y') { ... }
```

When using `<Chart>` directly (not simplified charts):
```diff
- <Chart ...>
+ <Chart valueAxis="x" ...>
```
