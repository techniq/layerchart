---
'layerchart': minor
---

feat: Auto-compute Bar/Bars mount animation initial values from chart scales

Bar now automatically derives `initialY`/`initialHeight` (vertical) or `initialX`/`initialWidth` (horizontal) from the chart's scale range when `motion` is configured, removing the need to hardcode pixel values.

Also improves `valueAxis` inference on `ChartState` — when not explicitly set, it is now derived from scale types (band scale on y → `valueAxis: 'x'`, band scale on x → `valueAxis: 'y'`).
