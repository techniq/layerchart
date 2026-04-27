---
title: "layerchart@2.0.0-next.58"
tag: "layerchart@2.0.0-next.58"
date: "2026-04-21T15:03:08Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.58"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Major Changes

-   breaking: Merge `Connector` into `Link`, remove `Connector` component ([#449](https://github.com/techniq/layerchart/pull/449))

    `Link` now supports both **pixel mode** (`x1`/`y1`/`x2`/`y2` props) and **data mode** (`data` + `source`/`target`/`x`/`y` accessors), mirroring the pattern used by primitives like `Circle`, `Text`, and `Rect`.

    **Migration:**

    -   `<Connector source={{...}} target={{...}} ... />` → `<Link x1={...} y1={...} x2={...} y2={...} ... />`
    -   `<Link explicitCoords={{ x1, y1, x2, y2 }} />` → `<Link {x1} {y1} {x2} {y2} />` (or `<Link {...linkPositions[i]} />`)

    All Connector props (`type`, `curve`, `sweep`, `radius`, `bend`, `orientation`, `radial`, markers, motion) are available directly on `Link`. The `explicitCoords` prop and `Connector` export are removed.

### Minor Changes

-   feat(AnnotationLine): Add `x1`/`y1`/`x2`/`y2` props for sloped lines ([#449](https://github.com/techniq/layerchart/pull/449))
    -   Pass any combination of `x1`, `y1`, `x2`, `y2` to draw a line between arbitrary points. Missing coordinates fall back to the corresponding axis range (so `x1`/`x2` alone still span the y range, etc.). The existing `x` / `y` shorthand for full-span vertical/horizontal lines is unchanged.
    -   Labels on sloped lines automatically rotate to follow the line angle (normalized to stay upright), with `labelPlacement`, `labelXOffset`, and `labelYOffset` applied along and perpendicular to the line.

-   feat(AnnotationPoint): Add `link` prop for ring-note style callouts, plus geo projection support ([#449](https://github.com/techniq/layerchart/pull/449))
    -   Pass `link={true}` or `link={{ type: 'beveled', radius: 20, ... }}` etc. to draw a `<Link>` from the ring edge to the label. Any `Link` prop (`type`, `curve`, `sweep`, `radius`, `bend`, `class`, ...) can be passed through.
    -   Inside a geo `<Chart>`, `x`/`y` are now interpreted as `[lon, lat]` and projected directly, so `AnnotationPoint` can be used on maps.

-   feat(Connector): Add `'swoop'` connector type ([#449](https://github.com/techniq/layerchart/pull/449))

    New `'swoop'` connector type draws a circular arc between source and target, equivalent to ObservablePlot's Arrow `bend` option. Configured via a new `bend` prop (degrees, default `22.5`) — positive bends right (clockwise from source to target), negative bends left, `0` draws a straight line. Works in both cartesian and radial modes; `Link` forwards it automatically.

-   feat(tooltipContext, Voronoi): Add `x`/`y` accessor overrides and default array endpoint to max ([#449](https://github.com/techniq/layerchart/pull/449))
    -   **New `x`/`y` props** on `tooltipContext` and `Voronoi` accept an `Accessor` (property name string or function). When set, hit-detection points use these accessors instead of the Chart's `x`/`y`. Useful when the Chart's accessor returns an array (e.g. `x={['POP_1980', 'POP_2015']}`) and you want detection at a specific endpoint:
        ```svelte
        <Chart {data} x={['POP_1980', 'POP_2015']} tooltipContext={{ mode: 'voronoi', x: 'POP_2015', y: 'R90_10_2015' }}>
        ```
    -   **Breaking (minor)**: when the chart's x/y accessor returns an array (duration bars, candlesticks, stacked areas, etc.), quadtree and voronoi hit-detection now default to the **max** value of the array instead of the **min**. For most use cases (target endpoint, stack top) this is the more natural hover position. If you need the old behavior, pass an explicit `x`/`y` accessor on `tooltipContext`/`Voronoi`.

### Patch Changes

-   fix(Chart): Explicit `<Chart data>` now takes precedence over marks' implicit-series data ([#449](https://github.com/techniq/layerchart/pull/449))

    When a mark registered its own filtered dataset via `markInfo` (e.g. a decorative `<Text data={highlighted}>` showing labels for a subset), two things went wrong:

    1.  `ctx.data` would silently switch to the filtered subset via `seriesState.visibleSeriesData`, causing sibling array-driven marks (like `<Link>`) to iterate only the subset.
    2.  An implicit series would be created from the decorative mark, narrowing the domain calculation to only the subset's values.

    Now when `<Chart data>` is explicit (non-empty):

    -   `ctx.data` always returns the chart's data.
    -   Marks whose axis accessor matches the chart's axis accessor (including any element of an array accessor like `y={['v1', 'v2']}`) are treated as decorative and don't create implicit series — even if they have their own `data` array.

    Marks with their own data still contribute to `flatData` for domain calculation when their accessor differs from the chart's (the multi-dataset / multi-series scenario).

-   fix(Connector, Link): Orient d3 step curves by `orientation` ([#449](https://github.com/techniq/layerchart/pull/449))
    -   Added `orientation?: 'horizontal' | 'vertical'` prop to `Connector` (defaults to `'horizontal'`). `Link` forwards its own orientation so step curves step along the natural flow direction.
    -   `curveStep`, `curveStepBefore`, and `curveStepAfter` now step along `y` in vertical orientation instead of always stepping along `x`.

-   fix(GeoPath): Avoid passing `undefined` event handlers to underlying `Path`, preventing a Svelte error while preserving canvas hit-testing for non-interactive paths ([#449](https://github.com/techniq/layerchart/pull/449))

-   fix: Allow negative string values (e.g. `y="-6"`) in `Text` position props to be treated as pixel values instead of data property names ([#449](https://github.com/techniq/layerchart/pull/449))
