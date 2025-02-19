---
'layerchart': patch
---

fix(TooltipContext): Call `hideTooltip()` for all tooltip modes on `pointerleave` to fix `band` (BarChart) and `voronoi` (ScatterPlot) modes not always closing on chart pointerleave due to recent chart delay / tooltip hover changes
