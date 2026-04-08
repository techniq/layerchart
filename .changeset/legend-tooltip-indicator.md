---
'layerchart': minor
---

feat(Legend, CircleLegend): Show an indicator of the current tooltip value on the legend

`Legend` (ramp variant) now draws a small upward-pointing arrow below the color ramp at the position of the currently hovered value, and `CircleLegend` draws a 50%-opacity filled circle at the corresponding radius. Both auto-read the hovered data from `ctx.tooltip.data` and pipe it through the chart's color (`ctx.c`) / radius (`ctx.r`) accessors, so wiring is automatic for charts that configure `c` / `r` / `cScale` / `rScale` via `Chart` props.

A new `value` prop on both components allows explicitly setting the indicator value (overriding the auto-detection), useful when the tooltip data shape doesn't match the chart's accessor.

For `scaleThreshold` / `scaleQuantize` / `scaleQuantile` scales, the `Legend` indicator centers on the matching bucket swatch.
