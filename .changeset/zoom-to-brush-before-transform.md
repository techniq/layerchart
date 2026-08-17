---
'layerchart': minor
---

feat(Chart): Add `transform.initialDomain` to open a chart zoomed to a range, i.e. restoring a saved one. `TransformContext` loads lazily, so the domain now renders from the initial transform rather than flashing the full extent and zooming in afterwards. A `zoomToBrush()` called before the chart mounts is held the same way, instead of being silently dropped onto the no-op fallback transform.
