---
'layerchart': minor
---

feat(AnnotationLine): Add `x1`/`y1`/`x2`/`y2` props for sloped lines

- Pass any combination of `x1`, `y1`, `x2`, `y2` to draw a line between arbitrary points. Missing coordinates fall back to the corresponding axis range (so `x1`/`x2` alone still span the y range, etc.). The existing `x` / `y` shorthand for full-span vertical/horizontal lines is unchanged.
- Labels on sloped lines automatically rotate to follow the line angle (normalized to stay upright), with `labelPlacement`, `labelXOffset`, and `labelYOffset` applied along and perpendicular to the line.
