---
'layerchart': minor
---

feat(Rect): Add `corners` prop for per-corner rounding

New `corners` prop accepts either a number (equivalent to `rx`), a `[topLeft, topRight, bottomRight, bottomLeft]` tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`. Works across `<Svg>`, `<Canvas>`, and `<Html>` layers — Svg renders a `<rect>` when corners are uniform and a `<path>` when they differ, Canvas uses `roundRect`'s per-corner radii, and Html uses the 4-value `border-radius` shorthand.

Also exports a shared `roundedRectPath(x, y, width, height, [tl, tr, br, bl])` helper from `path` utils for building per-corner rounded-rect path data.
