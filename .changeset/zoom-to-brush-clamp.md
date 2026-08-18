---
'layerchart': patch
---

fix(Chart): Keep `zoomToBrush()` anchored to the selection when the scale clamps to `scaleExtent` — the translate was left over from the scale it asked for, carrying the view past where the selection starts.
