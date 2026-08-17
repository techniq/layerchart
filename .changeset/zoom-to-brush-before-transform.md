---
'layerchart': patch
---

fix(Chart): Apply `zoomToBrush()` called before the chart mounts, which previously landed on the no-op fallback transform and was silently dropped.
