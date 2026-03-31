---
'layerchart': major
---

breaking: Remove standalone context getter/setter functions

The following standalone context functions have been removed in favor of the unified `getChartContext()` API:

- `getTooltipContext()` / `setTooltipContext()` → use `getChartContext().tooltip`
- `getBrushContext()` / `setBrushContext()` → use `getChartContext().brushState`
- `getTransformContext()` / `setTransformContext()` → use `getChartContext().transformState`

```diff
- import { getTooltipContext } from 'layerchart'
- const tooltip = getTooltipContext()
+ import { getChartContext } from 'layerchart'
+ const chart = getChartContext()
+ // access via chart.tooltip
```
