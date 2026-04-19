---
title: "layerchart@2.0.0-next.52"
tag: "layerchart@2.0.0-next.52"
date: "2026-04-09T12:55:03Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.52"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Minor Changes

-   feat(ArcLabel): New component for positioning text labels on arc segments ([#817](https://github.com/techniq/layerchart/pull/817))

    `ArcLabel` is a new marking component for placing text (and optional leader lines) relative to an arc. It's used internally by `PieChart` and `ArcChart` when the `labels` prop is set, but can also be rendered directly inside an `Arc` children snippet.

    Supported placements:

    -   `centroid` — at the arc centroid (horizontal text, default)
    -   `centroid-rotated` — at the centroid, rotated to follow the arc tangent, flipped where needed so text stays upright
    -   `centroid-radial` — at the centroid, rotated to read along the radial direction (center → outer edge)
    -   `inner` / `middle` / `outer` — along the inner, medial, or outer arc path (centered via `startOffset: '50%'` by default)
    -   `callout` — outside the arc with a leader line that bends horizontally to the label

    `ArcLabel` accepts a single `offset` prop that is routed to the placement-appropriate radial padding (centroid offset, `innerPadding`/`outerPadding`, or `calloutLineLength`), plus `calloutLineLength` / `calloutLabelOffset` / `calloutPadding` for fine-grained control of callout leader lines. The leader line renders via the `Path` primitive, so it works in both SVG and Canvas chart layers.

-   breaking(Arc): Center arc text along path by default for `inner`/`middle`/`outer` positions ([#817](https://github.com/techniq/layerchart/pull/817))

    `getArcTextProps('inner' | 'middle' | 'outer')` now defaults to `startOffset: '50%'` with `textAnchor: 'middle'`, centering the text along the arc path rather than anchoring it at the arc start. When an explicit `startOffset` is provided, the anchor falls back to `'start'` so the text begins at that position (matching prior behavior for callers that set a start offset).

-   feat(Arc): Add `innerPadding` option to `getArcTextProps` / `getTrackTextProps` ([#817](https://github.com/techniq/layerchart/pull/817))

    `ArcTextOptions` now supports an `innerPadding` option, symmetric to the existing `outerPadding`. Positive values shrink the inner radius used to build the `inner`/`middle` arc text paths, moving text inward (toward the chart center). Previously, offsetting an `inner`-placed arc label away from the arc edge required overriding the path manually; now it works the same as `outerPadding` does for `outer` text.

-   feat(CircleLegend): New component for visualizing radius (`rScale`) values as nested circles ([#818](https://github.com/techniq/layerchart/pull/818))

    `CircleLegend` displays a set of bottom-aligned nested circles representing values from a radius scale, useful alongside bubble maps and scatter charts that encode magnitude via circle area. By default it reads `rScale` from the chart context, but a `scale` prop can also be passed to render standalone.

    Supports `tickValues` / `ticks` / `tickFormat` for value selection and formatting, a `title` rendered centered above the circles, and `labelPlacement="right" | "left" | "inline"` to render tick labels with a leader line on either side of the circles or centered inside each circle near the top.

-   feat(GeoLegend): New scale-bar legend showing real-world distance for the current `Chart` projection ([#818](https://github.com/techniq/layerchart/pull/818))

    `GeoLegend` reads the active geo projection from the chart context and renders a labeled scale bar with tick subdivisions. By default it picks a "nice" round distance that covers ~25% of the chart width, but `distance` can be passed for an explicit value. Supports `units="km" | "mi"`, configurable `ticks`, `tickFormat`, `title`, and the standard `placement` props. Inspired by Harry Stevens' [d3-geo-scale-bar](https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar).

-   feat(Labels): Add `middle` placement and change `center` to center within the bar body ([#449](https://github.com/techniq/layerchart/pull/449))

    `placement="center"` now positions the label at the center of the bar body (between the value edge and the baseline). The previous `center` behavior (label aligned to the value edge with a middle anchor) is now available as the new `placement="middle"`.

-   feat(Legend, CircleLegend): Show an indicator of the current tooltip value on the legend ([#818](https://github.com/techniq/layerchart/pull/818))

    `Legend` (ramp variant) now draws a small upward-pointing arrow below the color ramp at the position of the currently hovered value, and `CircleLegend` draws a 50%-opacity filled circle at the corresponding radius. Both auto-read the hovered data from `ctx.tooltip.data` and pipe it through the chart's color (`ctx.c`) / radius (`ctx.r`) accessors, so wiring is automatic for charts that configure `c` / `r` / `cScale` / `rScale` via `Chart` props.

    A new `value` prop on both components allows explicitly setting the indicator value (overriding the auto-detection), useful when the tooltip data shape doesn't match the chart's accessor.

    For `scaleThreshold` / `scaleQuantize` / `scaleQuantile` scales, the `Legend` indicator centers on the matching bucket swatch.

-   feat(PieChart/ArcChart): Add top-level `labels` prop ([#817](https://github.com/techniq/layerchart/pull/817))

    `PieChart` and `ArcChart` now accept a `labels` prop that renders text labels on each arc without requiring a custom `arc` snippet. Pass `true` to enable defaults (centroid placement, default value accessor), or an object to configure any `ArcLabel` props — placement, offset, value accessor, callout line lengths, leader line style, text class, etc.

    ```svelte
    <PieChart {data} labels={{ placement: 'callout', value: 'fruit' }} />
    ```
