---
'layerchart': patch
---

fix(Area): Default y0 baseline to chart's yBaseline when set

Area's y0 fallback now respects the chart's `yBaseline` prop (e.g. `yBaseline={0}` set by AreaChart) instead of always using `min(yScale.domain())`. This fixes areas filling to the bottom of the chart instead of to the baseline when data goes negative.
