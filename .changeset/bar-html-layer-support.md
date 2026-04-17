---
'layerchart': minor
---

feat(Bar, Bars): Support `<Html>` layer

Bar/Bars now render in `<Html>` layers in addition to `<Svg>` and `<Canvas>`, including per-corner `rounded` variants (`top`, `bottom`, `left`, `right`, `edge`, and individual corners). Previously, any non-uniform `rounded` value fell through to a `<Path>` and was SVG-only.
