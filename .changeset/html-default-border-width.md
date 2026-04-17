---
'layerchart': patch
---

fix(Rect, Circle, Ellipse): On the `<Html>` layer, default `border-width` to `1px` when `stroke` is set without an explicit `strokeWidth`, matching SVG's implicit `stroke-width: 1`. Also ensures Circle/Ellipse `border-width` gets the required `px` unit.
