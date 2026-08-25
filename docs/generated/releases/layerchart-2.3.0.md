---
title: "layerchart@2.3.0"
tag: "layerchart@2.3.0"
date: "2026-08-20T19:24:17Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.3.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
### Minor Changes

- feat(ChartGroup): Add `<ChartGroup>` and `ChartGroupState` to synchronize the tooltip/highlight, brush selection, zoom domain, and series highlight/visibility across charts ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Chart): Add `fx` / `fy` faceting, drawing the chart once per distinct value into a grid of panels that share the position scales ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Chart): Add `seriesLayout="auto"` (default) with automatic stacking when applicable (ex. Area, Bars). Can still pass explicit `seriesLayout` (ex. `overlap`, `group`, `stack`) when needed ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Bar|Bars): Accept a per-row accessor for `fillOpacity`, `strokeWidth`, and `opacity`, matching `Rect` and `Circle` ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Spline|Area): Resolve `stroke`, `fill`, `opacity`, and `class` per line/area (and segment). A string naming a data property now resolves through the chart's color scale, like other primitives (ex. `Circle`) ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Chart): Default the color scale to the colors declared on `series`, so marks match their legend swatch ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Legend): Support ordinal `c` scale similar to `series` including highlight and filter capability. An ordinal scale now draws labelled swatches rather than a color ramp — pass `variant="ramp"` for the old appearance ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Tooltip): Add `tooltip.show({ point, value, data })` to control tooltip programmatically (buttons, keyboard events, etc.) ([#901](https://github.com/techniq/layerchart/pull/901))

- feat: New Brush component to manually position, useful for multiple / independent brushes (ex. parallel coordinates). Also includes new `brushable` attachment and `brushGesture` handler for even more granular control of `BrushState` ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(AnnotationPoint|AnnotationLine|AnnotationRange): Support `seriesKey` prop to associate an annotation with a series, positioning points and lines on its stacked segment ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Chart): Add `id` prop, applied to the root element and identifying the chart within a `ChartGroup` ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Rect): Support `ref` in html layers and forward `pointerdown` in canvas layers ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Spline|Area): Add `z` accessor to draw one line/area per distinct value, defaulting to `stroke` / `fill` / `c` ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Spline): Support `seriesKey` prop to follow that series' stacked top ([#901](https://github.com/techniq/layerchart/pull/901))

- feat(Chart): Add `transform.initialDomain` to open a chart zoomed to a range ([#901](https://github.com/techniq/layerchart/pull/901))

### Patch Changes

- fix(BrushContext): Fix clearing on double-clicking the selection (root select-all was immediately undoing) ([#901](https://github.com/techniq/layerchart/pull/901))

- fix(PieChart): Stop drawing a cartesian grid behind the arcs when using `series` ([#901](https://github.com/techniq/layerchart/pull/901))

- fix(Chart): Stack each `x1` sub-band separately, so grouped-and-stacked bars no longer share one running total ([#901](https://github.com/techniq/layerchart/pull/901))

- fix(Chart): Apply `zoomToBrush()` when called before the chart mounts or when the scale clamps to `scaleExtent` ([#901](https://github.com/techniq/layerchart/pull/901))