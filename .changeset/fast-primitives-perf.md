---
'layerchart': patch
---

perf: Optimize primitive component instantiation (~3-5x faster for Rect, Circle, Ellipse, Line, Text, Path, Group)

- `createMotion`: Fast-path passthrough when no `motion` prop is provided, avoiding `$state`/`$effect` overhead per axis
- `createDataMotionMap`: Short-circuit when `motion` is `undefined`, skipping `parseMotionProp` overhead
- `createKey`: Only create fill/stroke key trackers in canvas layer (skipped for SVG/HTML)
- `registerComponent`: Skip `registerMark` for empty `MarkInfo` (pixel-mode marks)
- All primitives: Skip `$effect` for data motion tracking when no motion is configured
- Rect/Image: Avoid per-axis `parseMotionProp` calls when `motion` is `undefined`
