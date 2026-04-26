---
'layerchart': minor
---

feat(ClipPath, RectClipPath, CircleClipPath, GeoClipPath): HTML layer support + unified `path` API

`ClipPath` now accepts a single `path: string` (SVG path `d` syntax) that drives all three layers:

- **SVG**: rendered as `<path d={path}>` inside the `<clipPath>` element.
- **Canvas**: wrapped in `Path2D` and applied via `ctx.clip(...)`.
- **HTML**: emitted as `clip-path: path("${path}")` on a wrapper `<div>` covering the chart container.

This replaces the previous `canvasClip` / `canvasClipDeps` callbacks (and skipped HTML entirely) with a single declarative value. The `clip` snippet is still accepted for advanced/custom SVG content.

`RectClipPath`, `CircleClipPath`, and `GeoClipPath` are rewritten on top of this — they each compute a path string (d3-geo-path already emits one natively) and pass it through. All three now support `<Html>` layers in addition to `<Svg>` and `<Canvas>`.

Note: `clip-path: path()` requires Chrome 88+, Safari 13.1+, Firefox 118+.
