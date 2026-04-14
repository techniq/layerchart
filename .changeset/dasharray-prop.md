---
'layerchart': minor
---

feat(Line, Rect, Circle, Text): Multi-layer compatible `dashArray` and inline color props

- Added a typed `dashArray` prop to `Line`, `Rect`, and `Circle`. Accepts a number, array, or SVG-style string and maps to `stroke-dasharray` (SVG), `setLineDash` (Canvas), and either `repeating-linear-gradient` (HTML lines) or `border-style: dashed` (HTML borders). Previously dashed styling was SVG-only when applied via CSS class or attribute.
- `Text` and `Line` HTML branches now honor the `fill`/`stroke` props as inline `color`/`background`, so prop-based colors work across all three layers (not just SVG/Canvas).
- `Grid.x`/`Grid.y` and `Axis.grid` now accept `stroke`, `strokeWidth`, `opacity`, and `dashArray` in their object form, matching the props forwarded to the underlying line.
- `Rule` already forwarded arbitrary Line props via spread; `dashArray` now works there unchanged.
- Exports `parseDashArray` and `dashArrayToGradient` helpers from `path` utils.
