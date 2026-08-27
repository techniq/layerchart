---
'layerchart': patch
---

fix(Highlight): Point `c`-grouped rows from `flatData`, fixing a crash on nested `stack()` data and `NaN` points where a category's value is a span (`y={[0, 1]}`)
