---
'layerchart': minor
---

feat(Brush): Add `<Brush>`, along with the `brushable` attachment and `brushGesture` handler beneath it, so a chart can carry several independent selections — one per axis of a parallel coordinates plot, say — sharing the chart brush's drag/move/resize gesture. `bind:state` reads back the `BrushState` it owns.
