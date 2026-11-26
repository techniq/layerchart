---
'layerchart': minor
---

feat: `layerchart/base` exports the layer-agnostic bases of the marks and charts (ex. `PieBase`) and their state, for drawing LayerChart's components in a layer of your own
feat: `settings.layer` accepts `webgl`, drawn by `@layerchart/webgl`'s `Layer`
fix: Marks draw nothing outside an `Svg`, `Canvas`, or `Html` layer rather than throw, and `GeoPoint` draws in an `Html` layer
