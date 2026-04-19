---
title: "layerchart@2.0.0-next.47"
tag: "layerchart@2.0.0-next.47"
date: "2026-03-31T15:26:46Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0-next.47"
draft: false
prerelease: true
author: "github-actions[bot]"
---
### Major Changes

-   breaking(BrushContext|TransformContext): Rename `bind:brushContext` / `bind:transformContext` to `bind:state` ([#663](https://github.com/techniq/layerchart/pull/663))

    Both `BrushContext` and `TransformContext` now use `bind:state` instead of their previous named bindings. Additionally, properties on `ChartState` have been renamed:

    -   `chartContext.brushContext` → `chartContext.brushState`
    -   `chartContext.transformContext` → `chartContext.transformState`

    ```diff
    - <BrushContext bind:brushContext>
    + <BrushContext bind:state>

    - <TransformContext bind:transformContext>
    + <TransformContext bind:state>
    ```

-   breaking(TransformContext): Rename `domainExtent: 'original'` to `domainExtent: 'data'` ([#663](https://github.com/techniq/layerchart/pull/663))

    The `'original'` value for `domainExtent` has been renamed to `'data'` to better describe that it constrains pan/zoom to the data's domain bounds:

    ```diff
    - <Chart transform={{ domainExtent: 'original' }}>
    + <Chart transform={{ domainExtent: 'data' }}>
    ```

-   breaking(GeoContext): Rename `GeoContext` component to `GeoProjection` ([#663](https://github.com/techniq/layerchart/pull/663))

    The `GeoContext` component has been renamed to `GeoProjection` to better describe its purpose. Update your imports and template usage:

    ```diff
    - import { GeoContext } from 'layerchart'
    + import { GeoProjection } from 'layerchart'
    ```

    ```diff
    - <GeoContext projection={geoAlbersUsa}>
    + <GeoProjection projection={geoAlbersUsa}>
    ```

-   breaking: Rename render context APIs to layer context ([#663](https://github.com/techniq/layerchart/pull/663))

    -   `getRenderContext()` → `getLayerContext()`
    -   `setRenderContext()` → `setLayerContext()`
    -   `supportedContexts` prop → `layers` prop on components
    -   Internal `layout/` directory moved to `layers/` (affects deep imports)

    ```diff
    - import { getRenderContext } from 'layerchart'
    + import { getLayerContext } from 'layerchart'
    ```

-   breaking(Chart): Remove `isVertical` from ChartState, add `valueAxis` prop to `Chart` ([#663](https://github.com/techniq/layerchart/pull/663))

    `ChartState.isVertical` has been removed in favor of `ChartState.valueAxis` (`'x'` \| `'y'`), which explicitly defines which axis represents the value (dependent variable).

    Simplified charts (`BarChart`, `LineChart`, `AreaChart`, `ScatterChart`) still accept the `orientation` prop as before — each chart maps it to the correct `valueAxis` internally. The `<Chart>` component itself now uses `valueAxis` directly, since `orientation` is ambiguous at that level (a "vertical" BarChart has `valueAxis="y"` while a "vertical" LineChart has `valueAxis="x"`).

    When accessing chart state:

    ```diff
    - if (chartContext.isVertical) { ... }
    + if (chartContext.valueAxis === 'y') { ... }
    ```

    When using `<Chart>` directly (not simplified charts):

    ```diff
    - <Chart ...>
    + <Chart valueAxis="x" ...>
    ```

-   breaking: Remove standalone context getter/setter functions ([#663](https://github.com/techniq/layerchart/pull/663))

    The following standalone context functions have been removed in favor of the unified `getChartContext()` API:

    -   `getTooltipContext()` / `setTooltipContext()` → use `getChartContext().tooltip`
    -   `getBrushContext()` / `setBrushContext()` → use `getChartContext().brushState`
    -   `getTransformContext()` / `setTransformContext()` → use `getChartContext().transformState`

    ```diff
    - import { getTooltipContext } from 'layerchart'
    - const tooltip = getTooltipContext()
    + import { getChartContext } from 'layerchart'
    + const chart = getChartContext()
    + // access via chart.tooltip
    ```

-   breaking(Arc|Pie|Calendar|GeoPath): Rename `tooltipContext` to simple `tooltip` (boolean), simplifying use case ([#663](https://github.com/techniq/layerchart/pull/663))

### Minor Changes

-   feat: Add BoxPlot component for box-and-whisker plots ([#663](https://github.com/techniq/layerchart/pull/663))

    New composite mark that renders whiskers, caps, IQR box, median line, and outlier dots. Supports both pre-computed statistics (`min`, `q1`, `median`, `q3`, `max`, `outliers` accessors) and automatic computation from raw values via the `values` prop. Orientation-aware via `valueAxis` context.

-   feat: Add statistical utility functions `computeBoxStats()` and `kde()` ([#663](https://github.com/techniq/layerchart/pull/663))
    -   `computeBoxStats(values, k?)` computes the five-number summary and outliers using the Tukey IQR method
    -   `kde(values, options?)` computes kernel density estimation using the Epanechnikov kernel with Silverman's rule-of-thumb bandwidth

-   feat: Add Violin component for violin plots ([#663](https://github.com/techniq/layerchart/pull/663))

    New composite mark that renders a symmetric density curve (mirrored area) from raw data using kernel density estimation (Epanechnikov kernel). Supports pre-computed density data via `density` prop or automatic KDE from raw values via `values` prop. Optional `box` and `median` overlays. Configurable `bandwidth`, `thresholds`, and `curve`.

-   feat(Spline): Support geo projection ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Add geo projection support for primitives (Circle, Rect, etc) ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(Highlight): Add `r` prop to scale highlight points using the chart's rScale. Supports `r={true}` to use the chart's r config or a custom accessor. ([#663](https://github.com/techniq/layerchart/pull/663))

-   breaking(Brush): Redesign brush API ([#663](https://github.com/techniq/layerchart/pull/663))

    **Breaking changes:**

    -   Remove `mode` prop ('integrated' | 'separated') — sync behavior is now driven by presence of `x`/`y` props
    -   Remove `resetOnEnd` — call `e.brush.reset()` in your `onBrushEnd` handler instead
    -   Remove `ignoreResetClick` — replaced by `clickToReset` (default `true`)
    -   Remove `onReset` event — check `brush.active === false` in `onBrushEnd`/`onChange` instead

    **New features:**

    -   Add `BrushState.move({ x?, y? })` for programmatic selection control (like d3's `brush.move()`)
    -   Add `BrushState.selectAll()` to select the full domain extent
    -   Add `BrushState.reset()` to clear the selection
    -   Add `clickToReset` prop (default `true`)
    -   Add `zoomOnBrush` prop on Chart for simplified charts to opt into brush-to-zoom
    -   Move domain clamping, edge adjustment, and range computation logic into `BrushState` class
    -   Add `BrushChartContext` interface for easier testing

-   feat: Unified component tree for Canvas rendering with proper Group transform scoping. Fixes #662 ([#663](https://github.com/techniq/layerchart/pull/663))
    -   New `registerComponentNode({ name, kind, canvasRender })` API replaces both `registerCanvasComponent` and the `InsideCompositeMark` boolean context with a single unified component tree.
    -   Canvas rendering now walks the tree recursively with proper `save()`/`restore()` scoping, fixing Group transforms (translate, opacity) leaking to sibling components instead of only affecting children.
    -   Composite marks (Area, Threshold, Hull, Labels, Grid) register as `'composite-mark'` nodes, automatically preventing child marks from registering with the chart without manual `_skipRegistration` props.
    -   Removed `retainState` and `name` from `ComponentRender` type — Group's transform scoping is handled by tree position, and component names live on the tree node.

-   feat: add `downloadImage`, `downloadSvg`, `getChartImageBlob`, and `getChartSvgString` utilities to export charts as PNG/JPEG/WebP images or SVG files ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Add Image component. Resolves #628 ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(SeriesState): Support passing `selected` as part of series declaration (Ex. ` <Chart series={...}>`) ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Add data mode to primitive components (Circle, Ellipse, Group, Line, Polygon, Rect, Text) ([#663](https://github.com/techniq/layerchart/pull/663))

    Primitives now accept string or function accessors for positional props (e.g. `x="date"`, `y={d => d.value}`) to automatically resolve values through chart scales and iterate over data. Components also accept an optional `data` prop to override chart context data.

    Color properties (`fill`, `stroke`) can also be data-driven, resolving per-item through the chart's color scale (`cScale`). String values are disambiguated: data property names resolve through `cScale`, while literal CSS colors pass through unchanged.

-   feat: Mark registration for automatic domain calculation, accessor aggregation, and implicit series ([#663](https://github.com/techniq/layerchart/pull/663))
    -   Marks (Spline, Area, Points, Bars) now register their data, accessors, and colors with the Chart via `registerMark()`.
    -   Chart automatically aggregates y/x accessors from marks, removing the need to pass `y={['apples', 'oranges']}` when each mark specifies its own `y`. Works for both horizontal (`valueAxis='y'`) and vertical (`valueAxis='x'`) charts.
    -   Per-mark `data` props are included in the chart's domain calculation automatically.
    -   Implicit series are generated from mark registrations when no explicit `series` prop is provided, enabling tooltip and legend support without requiring series definitions.

-   feat: Add inertia (momentum) support for transform drag gestures ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Add Cell mark. Resolves #627. ([#663](https://github.com/techniq/layerchart/pull/663))

-   breaking(Chart): Rename `tooltip` prop to `tooltipContext` to better describe purpose and fix conflict with new `tooltip` snippet ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Add Chord layout and Ribbon primitive ([#663](https://github.com/techniq/layerchart/pull/663))

-   breaking(TransformContext): Rename `initialScrollMode` to `scrollMode` and make it reactive ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(TransformContext): Add `scrollActivationKey` option to require a modifier key (meta, alt, control, shift) for scroll/wheel zoom/pan, preventing accidental page scroll from triggering transforms ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(Transform): Add zoom/pan constraints (`scaleExtent`, `translateExtent`, `constrain`, `domainExtent`), replace `geo.applyTransform` with `transform.mode: 'projection' | 'rotate'`, and reactively sync initial transform values on projection changes ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(Bar): Support fixed `width` and `height` props to override scale-derived dimensions, centering the bar within its band. Resolves #360 ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Auto-compute Bar/Bars mount animation initial values from chart scales ([#663](https://github.com/techniq/layerchart/pull/663))

    Bar now automatically derives `initialY`/`initialHeight` (vertical) or `initialX`/`initialWidth` (horizontal) from the chart's scale range when `motion` is configured, removing the need to hardcode pixel values.

    Also improves `valueAxis` inference on `ChartState` — when not explicitly set, it is now derived from scale types (band scale on y → `valueAxis: 'x'`, band scale on x → `valueAxis: 'y'`).

-   feat(Chart): Add cartesian pan/zoom via `transform={{ mode: 'domain' }}` with single or both axis support. Resolves #366 ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(Spline): Add motion support for mount animation from baseline ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Support continuous color scales via `cScale` prop without requiring `cRange` ([#663](https://github.com/techniq/layerchart/pull/663))
    -   Allow `cScale` (e.g. `scaleSequential(interpolateTurbo)`) to activate without `cRange`, enabling pre-configured sequential/diverging color scales
    -   Guard `createScale` against undefined `range` to avoid breaking interpolator-based scales
    -   Auto-detect numeric `cDomain` values and use `extent` instead of `unique`, producing correct `[min, max]` domains for continuous scales
    -   Prefer `cScale` color over default series color in tooltip/highlight when a color scale is configured

-   feat(Labels): Support `seriesKey` in `labels` prop to filter which series renders labels. Resolves #633 ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(Rect): New edge-based props (`x0`/`x1`/`y0`/`y1`) along with existing (`x`/`y`/`width`/`height`) and `insets` support ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat: Add Vector component ([#663](https://github.com/techniq/layerchart/pull/663))

### Patch Changes

-   fix(Area): Default y0 baseline to chart's yBaseline when set ([#663](https://github.com/techniq/layerchart/pull/663))

    Area's y0 fallback now respects the chart's `yBaseline` prop (e.g. `yBaseline={0}` set by AreaChart) instead of always using `min(yScale.domain())`. This fixes areas filling to the bottom of the chart instead of to the baseline when data goes negative.

-   fix(Points|Labels): Correctly position when using x1 / y1 scales (issue #773) ([#663](https://github.com/techniq/layerchart/pull/663))

-   refactor(Chart): Add `debug` prop and update `settings` context ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix: Default chart padding now applied when using ChartChildren layout (marks snippet) ([#663](https://github.com/techniq/layerchart/pull/663))

    When `<Chart>` is used with `marks`/`grid`/`axis` snippets (no explicit `children` snippet), default padding is now applied to match the axes that ChartChildren renders by default. When `children` is provided directly (e.g. Treemap, Pack), no default padding is applied since the user controls layout. This can still be overridden with explicit `axis` or `padding` props.

-   fix(Tooltip): Apply inverse transform for quadtree lookup when zoomed/panned ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(Area): Handle degenerate domains (e.g. all-zero data) and unify y0/y1 baseline logic ([#663](https://github.com/techniq/layerchart/pull/663))
    -   Guard against degenerate scale domains where min === max (e.g. `[0, 0]`), which caused `yScale()` to return `NaN` and break area path rendering
    -   Unify Area y0/y1 path computation to consistently use accessors through the scale, removing duplicate fallback logic

-   fix(BarChart): automatically round the outer edge of each direction in `stackDiverging` layout ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix: `flattenPathData` now handles relative arc commands, fixing rounded bars starting below the baseline during mount animation ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(Area|Highlight): Properly handling diveraging stack layouts for negative values (line, highlight point) ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(Points|Labels): Correctly position when using array accessors (duration charts, etc). Fixes #633 ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(TooltipContext): correct `bisect-band` hit detection by accounting for chart padding ([#806](https://github.com/techniq/layerchart/pull/806))

-   fix(ClipPath): Support canvas layers. Resolves #660 ([#663](https://github.com/techniq/layerchart/pull/663))

-   feat(Chart): Support `motion` prop to transition x/y scales using tween or spring ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(Canavs): support `strokeOpacity` for Path component ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(Text): handle inline styles and CSS class-based text-anchor ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(Tooltip): Fade non-highlighted series items on hover to match chart highlight state ([#663](https://github.com/techniq/layerchart/pull/663))

-   fix(TooltipContext): Support band mode with array-based range accessors (e.g. histograms using `x={['x0', 'x1']}`) ([#663](https://github.com/techniq/layerchart/pull/663))
