---
title: "layerchart@2.0.0-next.49"
tag: "layerchart@2.0.0-next.49"
date: "2026-04-02T19:28:26Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.49"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(Labels): Add `smart` placement option ([#799](https://github.com/techniq/layerchart/pull/799))

    New `placement="smart"` mode that dynamically positions labels based on neighboring point values (peak, trough, rising, falling) to reduce overlapping.

-   feat(Chart, BrushState): Add band scale (categorical) support for transform pan/zoom and brush selection. Uses range-rescaling pattern to smoothly zoom and pan categorical bar charts. Automatically constrains panning to data boundaries and prevents zooming out past initial view. ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Chart): In projection mode, `scaleExtent` and `translateExtent` are now interpreted as relative values (like d3-zoom). `scaleExtent: [0.5, 8]` means 0.5x to 8x of the fitted projection scale. `translateExtent` is offset from the initial fitted position in pixels. ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Spline): Support function-valued `stroke`, `fill`, and `opacity` for per-segment styling ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Text): Add `format` prop and tween numeric `value` when `motion` is configured ([#449](https://github.com/techniq/layerchart/pull/449))

### Patch Changes

-   Support `tickSpacing` for band scales on Axis, thinning tick labels when the domain is larger than the available space. Automatically shows more tick labels when zoomed in on band scale transforms. ([#449](https://github.com/techniq/layerchart/pull/449))

-   perf: Optimize primitive component instantiation (~3-5x faster for Rect, Circle, Ellipse, Line, Text, Path, Group) ([#449](https://github.com/techniq/layerchart/pull/449))
    -   `createMotion`: Fast-path passthrough when no `motion` prop is provided, avoiding `$state`/`$effect` overhead per axis
    -   `createDataMotionMap`: Short-circuit when `motion` is `undefined`, skipping `parseMotionProp` overhead
    -   `createKey`: Only create fill/stroke key trackers in canvas layer (skipped for SVG/HTML)
    -   `registerComponent`: Skip `registerMark` for empty `MarkInfo` (pixel-mode marks)
    -   All primitives: Skip `$effect` for data motion tracking when no motion is configured
    -   Rect/Image: Avoid per-axis `parseMotionProp` calls when `motion` is `undefined`

-   feat(Marker): Add `square` and `square-stroke` types ([#805](https://github.com/techniq/layerchart/pull/805))

-   fix(GeoPath): Fix canvas tooltip by conditionally passing onclick to Path, preventing non-interactive overlays from capturing hit canvas events ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(scaleBandInvert): Account for range offset in band scale inversion. Previously assumed range started at 0, causing incorrect pixel-to-category mapping when the scale range was transformed. ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(TransformContext): Reactively sync `processTranslate` and `disablePointer` to TransformState when props change. Fixes inverted globe dragging when dynamically switching between flat and globe projections. ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix(Chart): Enable scroll zoom for globe projections by including `scale: true` in default `transformApply` for globes. ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat(Raster, Contour): support bounded geo raster overlays with projected interpolation ([#449](https://github.com/techniq/layerchart/pull/449))

-   feat: Add Month component ([#671](https://github.com/techniq/layerchart/pull/671))

-   fix(LinearGradient, RadialGradient): Register as `group` instead of `mark` in canvas component tree so wrapped children (e.g. Arc, Path) are rendered ([#449](https://github.com/techniq/layerchart/pull/449))
