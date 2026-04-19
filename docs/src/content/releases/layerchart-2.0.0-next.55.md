---
title: "layerchart@2.0.0-next.55"
tag: "layerchart@2.0.0-next.55"
date: "2026-04-17T12:02:43Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.55"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Bar, Bars): Support `<Html>` layer ([#449](https://github.com/techniq/layerchart/pull/449))

    Bar/Bars now render in `<Html>` layers in addition to `<Svg>` and `<Canvas>`, including per-corner `rounded` variants (`top`, `bottom`, `left`, `right`, `edge`, and individual corners). Previously, any non-uniform `rounded` value fell through to a `<Path>` and was SVG-only.

-   feat(ClipPath, RectClipPath, CircleClipPath, GeoClipPath): HTML layer support + unified `path` API ([#449](https://github.com/techniq/layerchart/pull/449))

    `ClipPath` now accepts a single `path: string` (SVG path `d` syntax) that drives all three layers:

    -   **SVG**: rendered as `<path d={path}>` inside the `<clipPath>` element.
    -   **Canvas**: wrapped in `Path2D` and applied via `ctx.clip(...)`.
    -   **HTML**: emitted as `clip-path: path("${path}")` on a wrapper `<div>` covering the chart container.

    This replaces the previous `canvasClip` / `canvasClipDeps` callbacks (and skipped HTML entirely) with a single declarative value. The `clip` snippet is still accepted for advanced/custom SVG content.

    `RectClipPath`, `CircleClipPath`, and `GeoClipPath` are rewritten on top of this — they each compute a path string (d3-geo-path already emits one natively) and pass it through. All three now support `<Html>` layers in addition to `<Svg>` and `<Canvas>`.

    Note: `clip-path: path()` requires Chrome 88+, Safari 13.1+, Firefox 118+.

-   feat(ClipPath, RectClipPath, CircleClipPath, GeoClipPath): Add `invert` prop to render content _outside_ the clip shape (cutouts/masks) across SVG, Canvas, and HTML layers ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Line, Rect, Circle, Text): Multi-layer compatible `dashArray` and inline color props ([#449](https://github.com/techniq/layerchart/pull/449))
    -   Added a typed `dashArray` prop to `Line`, `Rect`, and `Circle`. Accepts a number, array, or SVG-style string and maps to `stroke-dasharray` (SVG), `setLineDash` (Canvas), and either `repeating-linear-gradient` (HTML lines) or `border-style: dashed` (HTML borders). Previously dashed styling was SVG-only when applied via CSS class or attribute.
    -   `Text` and `Line` HTML branches now honor the `fill`/`stroke` props as inline `color`/`background`, so prop-based colors work across all three layers (not just SVG/Canvas).
    -   `Grid.x`/`Grid.y` and `Axis.grid` now accept `stroke`, `strokeWidth`, `opacity`, and `dashArray` in their object form, matching the props forwarded to the underlying line.
    -   `Rule` already forwarded arbitrary Line props via spread; `dashArray` now works there unchanged.
    -   Exports `parseDashArray` and `dashArrayToGradient` helpers from `path` utils.

-   feat(Tree, Link, Connector): Add radial support ([#831](https://github.com/techniq/layerchart/pull/831))

    `Tree` now detects `<Chart radial>` and lays out with `d3.tree().size([2π, min(width, height)/2])` plus radial separation. Nodes emit polar coords (`x` = angle, `y` = radius).

    `Connector` gains a `radial` prop (defaults to `ctx.radial`) that interprets `source`/`target` as polar and dispatches to new `getConnectorRadialPresetPath` / `getConnectorRadialD3Path` helpers. Radial behavior per connector `type`:

    -   `straight` — straight cartesian line
    -   `square` — radial → arc at midR → radial
    -   `beveled` — chord at source radius with chamfered corner (controlled by `radius`)
    -   `rounded` — visx LinkRadialCurve Bezier
    -   `d3` — `d3.linkRadial` by default; with a `curve` prop, `curveStep` / `curveStepBefore` / `curveStepAfter` map to polar arcs/radials, other curves go through `d3.lineRadial`

    `Link` forwards `radial` to `Connector` automatically when inside a radial `<Chart>`.

-   feat(Rect): Add `corners` prop for per-corner rounding ([#449](https://github.com/techniq/layerchart/pull/449))

    New `corners` prop accepts either a number (equivalent to `rx`), a `[topLeft, topRight, bottomRight, bottomLeft]` tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`. Works across `<Svg>`, `<Canvas>`, and `<Html>` layers — Svg renders a `<rect>` when corners are uniform and a `<path>` when they differ, Canvas uses `roundRect`'s per-corner radii, and Html uses the 4-value `border-radius` shorthand.

    Also exports a shared `roundedRectPath(x, y, width, height, [tl, tr, br, bl])` helper from `path` utils for building per-corner rounded-rect path data.

### Patch Changes

-   fix(canvas): Compose globalAlpha multiplicatively so Group opacity propagates to children ([#831](https://github.com/techniq/layerchart/pull/831))

    Canvas `renderPathData` was overwriting `ctx.globalAlpha` with absolute values for element opacity, fill opacity, and stroke opacity. This meant a parent `<Group opacity={0.2}>` had no effect on child marks rendered on canvas — the child's own opacity (defaulting to 1) would replace the inherited value.

    Now all three sites multiply against the current `globalAlpha`, which correctly composes with ancestor Group opacity set via `save()`/`restore()` scoping. Also removes double-application of element `opacity` inside the fill/stroke blocks (it's already applied at the element level).
