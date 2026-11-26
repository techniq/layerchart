---
'layerchart': patch
---

fix: LayerChart's marks draw nothing outside an `Svg`, `Canvas`, or `Html` layer (ex. in `@layerchart/webgl`'s), rather than throw, and `GeoPoint` draws in an `Html` layer
