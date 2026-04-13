---
'layerchart': patch
---

fix(ArcLabel): Support rotation in Canvas mode

Changed `centroid-rotated` and `centroid-radial` placements to pass `rotate` prop instead of SVG `transform` string to `Text`, enabling rotation in Canvas rendering.
