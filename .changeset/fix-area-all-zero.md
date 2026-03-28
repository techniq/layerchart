---
'layerchart': patch
---

fix(Area): Handle degenerate domains (e.g. all-zero data) and unify y0/y1 baseline logic

- Guard against degenerate scale domains where min === max (e.g. `[0, 0]`), which caused `yScale()` to return `NaN` and break area path rendering
- Unify Area y0/y1 path computation to consistently use accessors through the scale, removing duplicate fallback logic
