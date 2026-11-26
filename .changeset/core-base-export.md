---
'layerchart': minor
---

feat: `layerchart/base` exports the layer-agnostic bases of the marks and charts (ex. `PieBase`), with the primitives they draw with left to the caller, and the state of `Group`, `Points`, and `Arc` (`GroupState`, `PointsState`, `ArcState`), for drawing LayerChart's components in a layer of your own (as `@layerchart/webgl` does)
