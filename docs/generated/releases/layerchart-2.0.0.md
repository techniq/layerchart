---
title: "layerchart@2.0.0"
tag: "layerchart@2.0.0"
date: "2026-07-01T21:31:30Z"
url: "https://github.com/techniq/layerchart/releases/tag/layerchart%402.0.0"
draft: false
prerelease: false
author: "github-actions[bot]"
---
LayerChart 2.0 rebuilds the library on **Svelte 5** (runes & snippets) and **no longer requires Tailwind CSS** — components ship with their own default styles, with Tailwind 4 now optional. It also streamlines several component and context APIs for consistency. Upgrading from v1? Start with the **[v1 → v2 migration guide](https://layerchart.com/docs/guides/migrations/v1-to-v2)**.

**Highlights**

- **Svelte 5** — migrated to runes & snippets ([#458](https://github.com/techniq/layerchart/pull/458))
- **No CSS framework required** — components ship default styles (easy to override via `@layer`, `:where(.lc-*)`, and CSS variables); Tailwind 4 optional ([#449](https://github.com/techniq/layerchart/pull/449))
- **New documentation site**

**Key breaking changes** (full details below)

- Unified context access — standalone `get*Context()` getters removed in favor of `getChartContext()`
- `BrushContext` / `TransformContext` now use `bind:state` (`chartContext.brushState` / `transformState`)
- Render context → **layer context** (`getRenderContext` → `getLayerContext`, `supportedContexts` → `layers`)
- `GeoContext` → `GeoProjection`
- `Connector` merged into `Link` (pixel + data modes)
- `ChartState.isVertical` → `valueAxis` (`'x'` | `'y'`)
- `tooltipContext` → `tooltip` (boolean) on `Arc` / `Pie` / `Calendar` / `GeoPath`
- `domainExtent: 'original'` → `'data'`

### Major Changes

- breaking(BrushContext|TransformContext): Rename `bind:brushContext` / `bind:transformContext` to `bind:state` ([#663](https://github.com/techniq/layerchart/pull/663))

  Both `BrushContext` and `TransformContext` now use `bind:state` instead of their previous named bindings. Additionally, properties on `ChartState` have been renamed:
  - `chartContext.brushContext` → `chartContext.brushState`
  - `chartContext.transformContext` → `chartContext.transformState`

  ```diff
  - <BrushContext bind:brushContext>
  + <BrushContext bind:state>

  - <TransformContext bind:transformContext>
  + <TransformContext bind:state>
  ```

- breaking(TransformContext): Rename `domainExtent: 'original'` to `domainExtent: 'data'` ([#663](https://github.com/techniq/layerchart/pull/663))

  The `'original'` value for `domainExtent` has been renamed to `'data'` to better describe that it constrains pan/zoom to the data's domain bounds:

  ```diff
  - <Chart transform={{ domainExtent: 'original' }}>
  + <Chart transform={{ domainExtent: 'data' }}>
  ```

- breaking(GeoContext): Rename `GeoContext` component to `GeoProjection` ([#663](https://github.com/techniq/layerchart/pull/663))

  The `GeoContext` component has been renamed to `GeoProjection` to better describe its purpose. Update your imports and template usage:

  ```diff
  - import { GeoContext } from 'layerchart'
  + import { GeoProjection } from 'layerchart'
  ```

  ```diff
  - <GeoContext projection={geoAlbersUsa}>
  + <GeoProjection projection={geoAlbersUsa}>
  ```

- feat: New docs site ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking: Rename render context APIs to layer context ([#663](https://github.com/techniq/layerchart/pull/663))
  - `getRenderContext()` → `getLayerContext()`
  - `setRenderContext()` → `setLayerContext()`
  - `supportedContexts` prop → `layers` prop on components
  - Internal `layout/` directory moved to `layers/` (affects deep imports)

  ```diff
  - import { getRenderContext } from 'layerchart'
  + import { getLayerContext } from 'layerchart'
  ```

- breaking: Merge `Connector` into `Link`, remove `Connector` component ([#449](https://github.com/techniq/layerchart/pull/449))

  `Link` now supports both **pixel mode** (`x1`/`y1`/`x2`/`y2` props) and **data mode** (`data` + `source`/`target`/`x`/`y` accessors), mirroring the pattern used by primitives like `Circle`, `Text`, and `Rect`.

  **Migration:**
  - `<Connector source={{...}} target={{...}} ... />` → `<Link x1={...} y1={...} x2={...} y2={...} ... />`
  - `<Link explicitCoords={{ x1, y1, x2, y2 }} />` → `<Link {x1} {y1} {x2} {y2} />` (or `<Link {...linkPositions[i]} />`)

  All Connector props (`type`, `curve`, `sweep`, `radius`, `bend`, `orientation`, `radial`, markers, motion) are available directly on `Link`. The `explicitCoords` prop and `Connector` export are removed.

- breaking(Chart): Remove `isVertical` from ChartState, add `valueAxis` prop to `Chart` ([#663](https://github.com/techniq/layerchart/pull/663))

  `ChartState.isVertical` has been removed in favor of `ChartState.valueAxis` (`'x'` | `'y'`), which explicitly defines which axis represents the value (dependent variable).

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

- Tailwind 4 support ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking: Remove standalone context getter/setter functions ([#663](https://github.com/techniq/layerchart/pull/663))

  The following standalone context functions have been removed in favor of the unified `getChartContext()` API:
  - `getTooltipContext()` / `setTooltipContext()` → use `getChartContext().tooltip`
  - `getBrushContext()` / `setBrushContext()` → use `getChartContext().brushState`
  - `getTransformContext()` / `setTransformContext()` → use `getChartContext().transformState`

  ```diff
  - import { getTooltipContext } from 'layerchart'
  - const tooltip = getTooltipContext()
  + import { getChartContext } from 'layerchart'
  + const chart = getChartContext()
  + // access via chart.tooltip
  ```

- breaking(Arc|Pie|Calendar|GeoPath): Rename `tooltipContext` to simple `tooltip` (boolean), simplifying use case ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Migrate to Svelte 5 runes/snippets (issue #159) ([#458](https://github.com/techniq/layerchart/pull/458))

### Minor Changes

- feat: Add BoxPlot component for box-and-whisker plots ([#663](https://github.com/techniq/layerchart/pull/663))

  New composite mark that renders whiskers, caps, IQR box, median line, and outlier dots. Supports both pre-computed statistics (`min`, `q1`, `median`, `q3`, `max`, `outliers` accessors) and automatic computation from raw values via the `values` prop. Orientation-aware via `valueAxis` context.

- feat(Dodge): Add Dodge component for deterministic non-overlapping layout ([#862](https://github.com/techniq/layerchart/pull/862))

  A new composition component (similar to `ForceSimulation`) that packs items along one axis to avoid overlaps. Modeled after [Observable Plot's `dodge` transform](https://observablehq.com/plot/transforms/dodge):
  - `axis`: `'x'` or `'y'` — which axis to dodge along (default `'y'`)
  - `anchor`: `'top'`/`'middle'`/`'bottom'` (for `axis='y'`) or `'left'`/`'middle'`/`'right'` (for `axis='x'`) — controls which edge items grow away from
  - `padding`: minimum px gap between items
  - `r`: collision radius per item (constant or accessor). When omitted, falls back to the chart's `r` accessor / `rScale` (matching `Points`), then to a default of `5`.
  - `position`: override the anchor-axis pixel accessor (defaults to chart's `xGet`/`yGet`)

  Yields each item's computed pixel `x`/`y` (and original `index`) via the children snippet, so you can render with any primitive (`Circle`, `Text`, etc.).

  Also includes a `rowHeight` mode that switches from circular to row-based rectangular packing — useful for text labels where circular collision would produce unnecessarily large vertical gaps. The pure `dodge()` algorithm is exported from `Dodge.shared.svelte.ts` for direct use.

  Algorithm modeled after Observable Plot / SveltePlot: maintains an interval tree of placed items keyed by anchor-axis extent, queries it for items in the new item's collision zone, and builds candidate dodge-axis positions from circle-tangency math. Currently implemented as a linear-scan tracker with the same API; can be swapped for a real interval tree without API changes if profiling demands it.

- feat: New `GeoClipPath` component for clipping content to GeoJSON boundaries in both SVG and Canvas modes ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: New `GeoRaster` component for reprojecting raster imagery (e.g. NASA Blue Marble) onto any d3-geo projection via per-pixel inverse sampling on Canvas ([#815](https://github.com/techniq/layerchart/pull/815))

- feat(Pattern): Add `rects` shape definition for tile patterns for rendering one or more rectangles per pattern tile ([#864](https://github.com/techniq/layerchart/pull/864))

- feat(Labels): Add `smart` placement option ([#799](https://github.com/techniq/layerchart/pull/799))

  New `placement="smart"` mode that dynamically positions labels based on neighboring point values (peak, trough, rising, falling) to reduce overlapping.

- feat: Add statistical utility functions `computeBoxStats()` and `kde()` ([#663](https://github.com/techniq/layerchart/pull/663))
  - `computeBoxStats(values, k?)` computes the five-number summary and outliers using the Tukey IQR method
  - `kde(values, options?)` computes kernel density estimation using the Epanechnikov kernel with Silverman's rule-of-thumb bandwidth

- feat(Text): Add `segments` prop for inline mixed-style text ([#449](https://github.com/techniq/layerchart/pull/449))

  New `segments` prop accepts an array of `{ value, class }` objects to render text with different styles (font size, weight, color) inline. Works across SVG (via tspans), Canvas (via sequential measureText/fillText), and HTML layers. Useful for labels that combine a bold name with a lighter value, such as treemap headers.

- feat: New Trail component for variable-width lines ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Add Violin component for violin plots ([#663](https://github.com/techniq/layerchart/pull/663))

  New composite mark that renders a symmetric density curve (mirrored area) from raw data using kernel density estimation (Epanechnikov kernel). Supports pre-computed density data via `density` prop or automatic KDE from raw values via `values` prop. Optional `box` and `median` overlays. Configurable `bandwidth`, `thresholds`, and `curve`.

- feat(Waffle): Add Waffle component for countable-cell visualizations ([#864](https://github.com/techniq/layerchart/pull/864))

- feat(Spline): Support geo projection ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(AnnotationLine): Add `x1`/`y1`/`x2`/`y2` props for sloped lines ([#449](https://github.com/techniq/layerchart/pull/449))
  - Pass any combination of `x1`, `y1`, `x2`, `y2` to draw a line between arbitrary points. Missing coordinates fall back to the corresponding axis range (so `x1`/`x2` alone still span the y range, etc.). The existing `x` / `y` shorthand for full-span vertical/horizontal lines is unchanged.
  - Labels on sloped lines automatically rotate to follow the line angle (normalized to stay upright), with `labelPlacement`, `labelXOffset`, and `labelYOffset` applied along and perpendicular to the line.

- feat(AnnotationPoint): Add `link` prop for ring-note style callouts, plus geo projection support ([#449](https://github.com/techniq/layerchart/pull/449))
  - Pass `link={true}` or `link={{ type: 'beveled', radius: 20, ... }}` etc. to draw a `<Link>` from the ring edge to the label. Any `Link` prop (`type`, `curve`, `sweep`, `radius`, `bend`, `class`, ...) can be passed through.
  - Inside a geo `<Chart>`, `x`/`y` are now interpreted as `[lon, lat]` and projected directly, so `AnnotationPoint` can be used on maps.

- feat(ArcLabel): New component for positioning text labels on arc segments ([#817](https://github.com/techniq/layerchart/pull/817))

  `ArcLabel` is a new marking component for placing text (and optional leader lines) relative to an arc. It's used internally by `PieChart` and `ArcChart` when the `labels` prop is set, but can also be rendered directly inside an `Arc` children snippet.

  Supported placements:
  - `centroid` — at the arc centroid (horizontal text, default)
  - `centroid-rotated` — at the centroid, rotated to follow the arc tangent, flipped where needed so text stays upright
  - `centroid-radial` — at the centroid, rotated to read along the radial direction (center → outer edge)
  - `inner` / `middle` / `outer` — along the inner, medial, or outer arc path (centered via `startOffset: '50%'` by default)
  - `callout` — outside the arc with a leader line that bends horizontally to the label

  `ArcLabel` accepts a single `offset` prop that is routed to the placement-appropriate radial padding (centroid offset, `innerPadding`/`outerPadding`, or `calloutLineLength`), plus `calloutLineLength` / `calloutLabelOffset` / `calloutPadding` for fine-grained control of callout leader lines. The leader line renders via the `Path` primitive, so it works in both SVG and Canvas chart layers.

- breaking(Arc): Center arc text along path by default for `inner`/`middle`/`outer` positions ([#817](https://github.com/techniq/layerchart/pull/817))

  `getArcTextProps('inner' | 'middle' | 'outer')` now defaults to `startOffset: '50%'` with `textAnchor: 'middle'`, centering the text along the arc path rather than anchoring it at the arc start. When an explicit `startOffset` is provided, the anchor falls back to `'start'` so the text begins at that position (matching prior behavior for callers that set a start offset).

- feat(Arc): Add `innerPadding` option to `getArcTextProps` / `getTrackTextProps` ([#817](https://github.com/techniq/layerchart/pull/817))

  `ArcTextOptions` now supports an `innerPadding` option, symmetric to the existing `outerPadding`. Positive values shrink the inner radius used to build the `inner`/`middle` arc text paths, moving text inward (toward the chart center). Previously, offsetting an `inner`-placed arc label away from the arc edge required overriding the path manually; now it works the same as `outerPadding` does for `outer` text.

- feat(Chart, BrushState): Add band scale (categorical) support for transform pan/zoom and brush selection. Uses range-rescaling pattern to smoothly zoom and pan categorical bar charts. Automatically constrains panning to data boundaries and prevents zooming out past initial view. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Axis): Default `tickSpacing` to `null` for categorical band scales, showing all ticks by default instead of reducing them. Use `tickSpacing={80}` to opt-in to tick reducing on categorical band scale axes. ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Bar, Bars): Support `<Html>` layer ([#449](https://github.com/techniq/layerchart/pull/449))

  Bar/Bars now render in `<Html>` layers in addition to `<Svg>` and `<Canvas>`, including per-corner `rounded` variants (`top`, `bottom`, `left`, `right`, `edge`, and individual corners). Previously, any non-uniform `rounded` value fell through to a `<Path>` and was SVG-only.

- feat: New Connector component (issue #11) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: Add geo projection support for primitives (Circle, Rect, etc) ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Highlight): Add `r` prop to scale highlight points using the chart's rScale. Supports `r={true}` to use the chart's r config or a custom accessor. ([#663](https://github.com/techniq/layerchart/pull/663))

- breaking(Brush): Redesign brush API ([#663](https://github.com/techniq/layerchart/pull/663))

  **Breaking changes:**
  - Remove `mode` prop ('integrated' | 'separated') — sync behavior is now driven by presence of `x`/`y` props
  - Remove `resetOnEnd` — call `e.brush.reset()` in your `onBrushEnd` handler instead
  - Remove `ignoreResetClick` — replaced by `clickToReset` (default `true`)
  - Remove `onReset` event — check `brush.active === false` in `onBrushEnd`/`onChange` instead

  **New features:**
  - Add `BrushState.move({ x?, y? })` for programmatic selection control (like d3's `brush.move()`)
  - Add `BrushState.selectAll()` to select the full domain extent
  - Add `BrushState.reset()` to clear the selection
  - Add `clickToReset` prop (default `true`)
  - Add `zoomOnBrush` prop on Chart for simplified charts to opt into brush-to-zoom
  - Move domain clamping, edge adjustment, and range computation logic into `BrushState` class
  - Add `BrushChartContext` interface for easier testing

- feat(Brush): Add constraints to `BrushContext` / `BrushState`, similar to `TransformContext`'s `scaleExtent`/`translateExtent`/`constrain`. ([#879](https://github.com/techniq/layerchart/pull/879))

- feat: Integrate `annotations` into simplified charts ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(CircleLegend): New component for visualizing radius (`rScale`) values as nested circles ([#818](https://github.com/techniq/layerchart/pull/818))

  `CircleLegend` displays a set of bottom-aligned nested circles representing values from a radius scale, useful alongside bubble maps and scatter charts that encode magnitude via circle area. By default it reads `rScale` from the chart context, but a `scale` prop can also be passed to render standalone.

  Supports `tickValues` / `ticks` / `tickFormat` for value selection and formatting, a `title` rendered centered above the circles, and `labelPlacement="right" | "left" | "inline"` to render tick labels with a leader line on either side of the circles or centered inside each circle near the top.

- feat(ClipPath, RectClipPath, CircleClipPath, GeoClipPath): HTML layer support + unified `path` API ([#449](https://github.com/techniq/layerchart/pull/449))

  `ClipPath` now accepts a single `path: string` (SVG path `d` syntax) that drives all three layers:
  - **SVG**: rendered as `<path d={path}>` inside the `<clipPath>` element.
  - **Canvas**: wrapped in `Path2D` and applied via `ctx.clip(...)`.
  - **HTML**: emitted as `clip-path: path("${path}")` on a wrapper `<div>` covering the chart container.

  This replaces the previous `canvasClip` / `canvasClipDeps` callbacks (and skipped HTML entirely) with a single declarative value. The `clip` snippet is still accepted for advanced/custom SVG content.

  `RectClipPath`, `CircleClipPath`, and `GeoClipPath` are rewritten on top of this — they each compute a path string (d3-geo-path already emits one natively) and pass it through. All three now support `<Html>` layers in addition to `<Svg>` and `<Canvas>`.

  Note: `clip-path: path()` requires Chrome 88+, Safari 13.1+, Firefox 118+.

- feat(ClipPath, RectClipPath, CircleClipPath, GeoClipPath): Add `invert` prop to render content _outside_ the clip shape (cutouts/masks) across SVG, Canvas, and HTML layers ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Unified component tree for Canvas rendering with proper Group transform scoping. Fixes #662 ([#663](https://github.com/techniq/layerchart/pull/663))
  - New `registerComponentNode({ name, kind, canvasRender })` API replaces both `registerCanvasComponent` and the `InsideCompositeMark` boolean context with a single unified component tree.
  - Canvas rendering now walks the tree recursively with proper `save()`/`restore()` scoping, fixing Group transforms (translate, opacity) leaking to sibling components instead of only affecting children.
  - Composite marks (Area, Threshold, Hull, Labels, Grid) register as `'composite-mark'` nodes, automatically preventing child marks from registering with the chart without manual `_skipRegistration` props.
  - Removed `retainState` and `name` from `ComponentRender` type — Group's transform scoping is handled by tree position, and component names live on the tree node.

- feat(Connector): Add `'swoop'` connector type ([#449](https://github.com/techniq/layerchart/pull/449))

  New `'swoop'` connector type draws a circular arc between source and target, equivalent to ObservablePlot's Arrow `bend` option. Configured via a new `bend` prop (degrees, default `22.5`) — positive bends right (clockwise from source to target), negative bends left, `0` draws a straight line. Works in both cartesian and radial modes; `Link` forwards it automatically.

- - Made `ForceSimulation` generic over its nodes and links, i.e. `ForceSimulation<Node, Link>.` ([#527](https://github.com/techniq/layerchart/pull/527))
  - Exposed `links` via `children` snippet of `ForceSimulation`.

- Decoupled `ForceSimulation` from `ChartContext`, by taking nodes and links via `data` prop. ([#526](https://github.com/techniq/layerchart/pull/526))

- feat(Line, Rect, Circle, Text): Multi-layer compatible `dashArray` and inline color props ([#449](https://github.com/techniq/layerchart/pull/449))
  - Added a typed `dashArray` prop to `Line`, `Rect`, and `Circle`. Accepts a number, array, or SVG-style string and maps to `stroke-dasharray` (SVG), `setLineDash` (Canvas), and either `repeating-linear-gradient` (HTML lines) or `border-style: dashed` (HTML borders). Previously dashed styling was SVG-only when applied via CSS class or attribute.
  - `Text` and `Line` HTML branches now honor the `fill`/`stroke` props as inline `color`/`background`, so prop-based colors work across all three layers (not just SVG/Canvas).
  - `Grid.x`/`Grid.y` and `Axis.grid` now accept `stroke`, `strokeWidth`, `opacity`, and `dashArray` in their object form, matching the props forwarded to the underlying line.
  - `Rule` already forwarded arbitrary Line props via spread; `dashArray` now works there unchanged.
  - Exports `parseDashArray` and `dashArrayToGradient` helpers from `path` utils.

- feat: add `downloadImage`, `downloadSvg`, `getChartImageBlob`, and `getChartSvgString` utilities to export charts as PNG/JPEG/WebP images or SVG files ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Add Image component. Resolves #628 ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Pattern): Canvas support ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(SeriesState): Support passing `selected` as part of series declaration (Ex. ` <Chart series={...}>`) ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(GeoLegend): New scale-bar legend showing real-world distance for the current `Chart` projection ([#818](https://github.com/techniq/layerchart/pull/818))

  `GeoLegend` reads the active geo projection from the chart context and renders a labeled scale bar with tick subdivisions. By default it picks a "nice" round distance that covers ~25% of the chart width, but `distance` can be passed for an explicit value. Supports `units="km" | "mi"`, configurable `ticks`, `tickFormat`, `title`, and the standard `placement` props. Inspired by Harry Stevens' [d3-geo-scale-bar](https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar).

- feat(Chart): In projection mode, `scaleExtent` and `translateExtent` are now interpreted as relative values (like d3-zoom). `scaleExtent: [0.5, 8]` means 0.5x to 8x of the fitted projection scale. `translateExtent` is offset from the initial fitted position in pixels. ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Support pre-projected topologies in `GeoLegend` via `referenceScale` ([#449](https://github.com/techniq/layerchart/pull/449))

  Add a `referenceScale` prop to `GeoLegend` for charts that render pre-projected data with `geoIdentity` (e.g. `us-atlas`'s `counties-albers-10m` / `states-albers-10m`, pre-projected with `geoAlbersUsa().scale(1300)`). When provided, pixels-per-distance is derived from the chart's fit scale and the supplied base scale, bypassing the `projection.invert` + `geoDistance` path which only works for real lon/lat projections. The `GeoPath` bubble-map example now renders a correct scale bar.

- feat(BarChart): Radial support (vertical and horizontal) (issue #469) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Arc/Text): Arc path labels with inner/outer/middle placement and smart flipping (issue #7) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Circle, Ellipse): Support pattern/gradient `fill` values on the `<Html>` layer by switching from `background-color` to the `background` shorthand (with `background-origin: border-box` to keep patterns aligned under the border). Accepts values produced by `<Pattern>` / `<LinearGradient>` in HTML mode. ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Hull): Add CommonStyleProps (fill, fillOpacity, stroke, strokeOpacity, strokeWidth, opacity) for Canvas layer compatibility ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Labels): Add `middle` placement and change `center` to center within the bar body ([#449](https://github.com/techniq/layerchart/pull/449))

  `placement="center"` now positions the label at the center of the bar body (between the value edge and the baseline). The previous `center` behavior (label aligned to the value edge with a middle anchor) is now available as the new `placement="middle"`.

- feat(Rule): Support using as data-driven mark (ex. candlestick, lollipop) by default (`<Rule>` using Chart accessors) or passing explicit `x`/`y` accessors (ex. `<Rule y={["high", "low"]} />`). Resolves #64 ([#622](https://github.com/techniq/layerchart/pull/622))

- feat(Legend, CircleLegend): Show an indicator of the current tooltip value on the legend ([#818](https://github.com/techniq/layerchart/pull/818))

  `Legend` (ramp variant) now draws a small upward-pointing arrow below the color ramp at the position of the currently hovered value, and `CircleLegend` draws a 50%-opacity filled circle at the corresponding radius. Both auto-read the hovered data from `ctx.tooltip.data` and pipe it through the chart's color (`ctx.c`) / radius (`ctx.r`) accessors, so wiring is automatic for charts that configure `c` / `r` / `cScale` / `rScale` via `Chart` props.

  A new `value` prop on both components allows explicitly setting the indicator value (overriding the auto-detection), useful when the tooltip data shape doesn't match the chart's accessor.

  For `scaleThreshold` / `scaleQuantize` / `scaleQuantile` scales, the `Legend` indicator centers on the matching bucket swatch.

- feat(ForceSimulation): Added `onNodesChange` callback to `ForceSimulation` ([#607](https://github.com/techniq/layerchart/pull/607))

- feat(Blur): Add Canvas support ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Add data mode to primitive components (Circle, Ellipse, Group, Line, Polygon, Rect, Text) ([#663](https://github.com/techniq/layerchart/pull/663))

  Primitives now accept string or function accessors for positional props (e.g. `x="date"`, `y={d => d.value}`) to automatically resolve values through chart scales and iterate over data. Components also accept an optional `data` prop to override chart context data.

  Color properties (`fill`, `stroke`) can also be data-driven, resolving per-item through the chart's color scale (`cScale`). String values are disambiguated: data property names resolve through `cScale`, while literal CSS colors pass through unchanged.

- feat: Mark registration for automatic domain calculation, accessor aggregation, and implicit series ([#663](https://github.com/techniq/layerchart/pull/663))
  - Marks (Spline, Area, Points, Bars) now register their data, accessors, and colors with the Chart via `registerMark()`.
  - Chart automatically aggregates y/x accessors from marks, removing the need to pass `y={['apples', 'oranges']}` when each mark specifies its own `y`. Works for both horizontal (`valueAxis='y'`) and vertical (`valueAxis='x'`) charts.
  - Per-mark `data` props are included in the chart's domain calculation automatically.
  - Implicit series are generated from mark registrations when no explicit `series` prop is provided, enabling tooltip and legend support without requiring series definitions.

- feat: Add inertia (momentum) support for transform drag gestures ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Add Cell mark. Resolves #627. ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: New ArcChart component ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Pattern): Support `<Html>` layer by producing CSS `repeating-linear-gradient` (lines) and `radial-gradient` (circles) values usable as a `background`/`fill`. Gradient-valued `background` (e.g. `<Pattern background={gradient}>`) is also supported. ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Per-layer variants for primitives, compound marks, and high-level charts (`layerchart/svg`, `layerchart/canvas`, `layerchart/html`) ([#848](https://github.com/techniq/layerchart/pull/848))

  Layer-agnostic components auto-detect the surrounding `<Svg>`, `<Canvas>`, or `<Html>` layer and bundle every render path. The new sub-path exports expose layer-specific variants so consumers committed to a single rendering layer can opt into a smaller bundle.

  ```ts
  // Default: agnostic, dispatches at runtime — works in any layer
  import { Rect, Circle, Text, Path, LineChart } from 'layerchart';

  // SVG-only — skips canvas + html branches
  import { Rect, Circle, Text, Path, LineChart } from 'layerchart/svg';

  // Canvas-only
  import { Rect, Circle, Text, LineChart } from 'layerchart/canvas';

  // HTML-only — drops canvas + svg overhead (some primitives are ~95% smaller)
  import { Rect, Circle, Text, Pattern, LinearGradient } from 'layerchart/html';
  ```

  Each agnostic component (e.g. `Rect.svelte`) now dispatches to the corresponding per-layer variant under the hood (`Rect.svg.svelte`, `Rect.canvas.svelte`, `Rect.html.svelte`) — no breaking change for existing consumers.

  ### What's split

  **Primitives (13)** — the basic graphics building blocks
  `Circle`, `Text`, `Rect`, `Line`, `Path`, `Ellipse`, `Polygon`, `Group`, `Image`, `ClipPath`, `Pattern`, `LinearGradient`, `RadialGradient`

  **Compound marks (~30)** — chart axes, marks, annotations, and chart-relative shapes
  `Axis`, `Grid`, `Rule`, `Highlight`, `Layer`, `ChartChildren`, `ChartClipPath`, `CircleClipPath`, `Bars`, `Bar`, `Spline`, `Area`, `Pie`, `Arc`, `ArcLabel`, `Points`, `Cell`, `Frame`, `Threshold`, `Trail`, `Vector`, `Link`, `Labels`, `AnnotationLine`, `AnnotationPoint`, `AnnotationRange`, `Hull`, `Density`, `Voronoi`, `Contour`, `Raster`, `Violin`, `BoxPlot`, `Calendar`, `Month`

  **Geo components (`layerchart/geo`)**
  `GeoPath`, `GeoSpline`, `GeoPoint`, `GeoCircle`, `GeoTile`, `TileImage`, `Graticule`, `GeoClipPath`, `GeoEdgeFade`

  **Graph components (`layerchart/graph`)**
  `Ribbon`

  **High-level chart wrappers** — pre-composed charts with built-in tooltips, highlights, and series handling
  `LineChart`, `AreaChart`, `BarChart`, `ScatterChart`, `PieChart`, `ArcChart`

  The geo, graph, hierarchy, and force sub-paths also re-export every layer-agnostic helper they previously included, so a single `from 'layerchart/svg'` import covers a typical SVG chart end-to-end without falling back to `'layerchart'`.

  ### Standout per-layer wins (gz, vs agnostic baseline)

  **Primitives where the per-layer rendering is dramatically simpler:**
  - `Pattern` html: 14.81 → 0.92 KB (-94%) — HTML implementation is just CSS-string generation
  - `LinearGradient` html: 14.38 → 0.53 KB (-96%)
  - `Image` canvas: 14.95 → 3.73 KB (-75%)
  - `Text` svg/html: 29.13 → ~16 KB (-45%)
  - `Circle` / `Rect` / `Ellipse` / `Line` / `Path`: ~22–27% smaller per-layer

  **Compound marks:** typically 8–15% gz savings per-layer; outliers like `Highlight` (-30% canvas) and `Cell` (-22% svg) are larger because their HTML/canvas vs. SVG paths diverge significantly.

  **High-level charts:** ~5–12% gz savings (~5–11 KB) when imported from `layerchart/svg` or `layerchart/canvas`. A single-layer LineChart drops from 89.6 KB → 79.0 KB gz on the SVG path.

  For a consumer who migrates all imports to a single layer, cumulative savings across primitives and compound marks are 60–80 KB gz.

  ### Bundle reductions on the default `<Chart>` path

  In addition to opt-in per-layer variants, this release also makes a few previously-eager features lazy:
  - **`<TransformContext>`** is now dynamically imported when `<Chart transform={...}>` is set — saves ~2.8 KB gz on every chart that doesn't pan/zoom.
  - **`<BrushContext>`** was already lazy; nothing changes there.

  ### `<ChartCore>` for non-cartesian charts (new)

  A new `<ChartCore>` component is exported alongside `<Chart>` from each layer sub-path (`layerchart`, `layerchart/svg`, `layerchart/canvas`, `layerchart/html`). It provides the chart context, sizing, brush, transform, and tooltip plumbing — but skips `<ChartChildren>` and the `Layer` / `Axis` / `Grid` / `Rule` / `Highlight` / `ChartClipPath` import chain it pulls in.

  Use it for geo maps, custom layouts, or any chart that renders its own primitives directly via the `children` snippet:

  ```svelte
  <script>
    import { ChartCore, Svg, GeoProjection, GeoPath } from 'layerchart/svg';
  </script>

  <ChartCore data={countries}>
    {#snippet children({ context })}
      <Svg>
        <GeoProjection projection={geoMercator} fitGeojson={countries}>
          <GeoPath geojson={countries} fill="steelblue" />
        </GeoProjection>
      </Svg>
    {/snippet}
  </ChartCore>
  ```

  Measured savings (bundle scenarios):
  - `base` (`<Chart>`) → `core` (`<ChartCore>`): 83.42 → 50.93 KB gz (**−39%**)
  - `geo` (`<Chart>` + `GeoPath`/`GeoPoint`) → `core-geo` (`<ChartCore>` + `GeoProjection` + `GeoPath`): 87.23 → 54.67 KB gz (**−37%**)
  - `base-svg` (per-layer) → `core-svg` (per-layer): 77.37 → 50.88 KB gz (**−34%**)

  ### Behavior

  Identical to the agnostic versions: visual output, props, types, and bindable refs all match. The dispatcher pattern adds ~0.2 KB per primitive to `core` for users on the agnostic API (transitive cost from `Highlight` / `Axis` / `Chart`) — a worthwhile tradeoff for the opt-in per-layer savings.

  See the updated ["Bundle Size" guide](https://layerchart.com/docs/guides/bundle-size) for the full table, tradeoffs, and when to opt into per-layer imports.

- feat(PieChart/ArcChart): Add top-level `labels` prop ([#817](https://github.com/techniq/layerchart/pull/817))

  `PieChart` and `ArcChart` now accept a `labels` prop that renders text labels on each arc without requiring a custom `arc` snippet. Pass `true` to enable defaults (centroid placement, default value accessor), or an object to configure any `ArcLabel` props — placement, offset, value accessor, callout line lengths, leader line style, text class, etc.

  ```svelte
  <PieChart {data} labels={{ placement: 'callout', value: 'fruit' }} />
  ```

- breaking(Chart): Rename `tooltip` prop to `tooltipContext` to better describe purpose and fix conflict with new `tooltip` snippet ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Circle, Text): Inherit chart accessors by default in data mode ([#862](https://github.com/techniq/layerchart/pull/862))

  `<Circle>` and `<Text>` now fall back to the chart's `x`/`y`/`r` accessors (via `xGet`/`yGet`/`rGet`) when the corresponding position prop is omitted — matching how `<Points>` and the new `<Dodge>` work. This lets the chart be the single source of truth for `x`/`y`/`r` and removes the boilerplate of repeating those props on every primitive:

  ```svelte
  <!-- Before -->
  <Chart {data} x="date" y="value" r="size" rRange={[2, 10]}>
    <Circle {data} cx="date" cy="value" r="size" />
  </Chart>

  <!-- After -->
  <Chart {data} x="date" y="value" r="size" rRange={[2, 10]}>
    <Circle {data} />
  </Chart>
  ```

  `Circle` and `Text` also now enter data mode when `data` is explicitly passed (in addition to the existing trigger when `cx`/`cy`/`x`/`y` are data-driven), so the implicit-accessor pattern works without needing to pass redundant string accessors just to trigger iteration.

  Behavior is unchanged whenever any position prop is set explicitly — the hardcoded defaults (0/0/1) only apply when neither prop nor chart-level config is present. All existing usages in the docs pass explicit position props, so this is purely additive.

- breaking(Points): Remove `<Points links>` prop. Use `<Rule>` with x/y accessor instead ([#622](https://github.com/techniq/layerchart/pull/622))

- feat: Add Chord layout and Ribbon primitive ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Pattern): Simplified definitions via `lines`/`circles` props (issue #472) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Tree, Link, Connector): Add radial support ([#831](https://github.com/techniq/layerchart/pull/831))

  `Tree` now detects `<Chart radial>` and lays out with `d3.tree().size([2π, min(width, height)/2])` plus radial separation. Nodes emit polar coords (`x` = angle, `y` = radius).

  `Connector` gains a `radial` prop (defaults to `ctx.radial`) that interprets `source`/`target` as polar and dispatches to new `getConnectorRadialPresetPath` / `getConnectorRadialD3Path` helpers. Radial behavior per connector `type`:
  - `straight` — straight cartesian line
  - `square` — radial → arc at midR → radial
  - `beveled` — chord at source radius with chamfered corner (controlled by `radius`)
  - `rounded` — visx LinkRadialCurve Bezier
  - `d3` — `d3.linkRadial` by default; with a `curve` prop, `curveStep` / `curveStepBefore` / `curveStepAfter` map to polar arcs/radials, other curves go through `d3.lineRadial`

  `Link` forwards `radial` to `Connector` automatically when inside a radial `<Chart>`.

- feat: Add `Layer` component to easily switch between Svg, Canavs, and Html layers ([#458](https://github.com/techniq/layerchart/pull/458))

- feat(Rect): Add `corners` prop for per-corner rounding ([#449](https://github.com/techniq/layerchart/pull/449))

  New `corners` prop accepts either a number (equivalent to `rx`), a `[topLeft, topRight, bottomRight, bottomLeft]` tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`. Works across `<Svg>`, `<Canvas>`, and `<Html>` layers — Svg renders a `<rect>` when corners are uniform and a `<path>` when they differ, Canvas uses `roundRect`'s per-corner radii, and Html uses the 4-value `border-radius` shorthand.

  Also exports a shared `roundedRectPath(x, y, width, height, [tl, tr, br, bl])` helper from `path` utils for building per-corner rounded-rect path data.

- refactor: Remove LayerCake dependency (issue #432) ([#458](https://github.com/techniq/layerchart/pull/458))

- breaking(TransformContext): Rename `initialScrollMode` to `scrollMode` and make it reactive ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(TransformContext): Add `scrollActivationKey` option to require a modifier key (meta, alt, control, shift) for scroll/wheel zoom/pan, preventing accidental page scroll from triggering transforms ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Add `renderChart()` to `layerchart/server` for server-side chart-to-image rendering (PNG/JPEG) ([#813](https://github.com/techniq/layerchart/pull/813))

- feat(Transform): Add zoom/pan constraints (`scaleExtent`, `translateExtent`, `constrain`, `domainExtent`), replace `geo.applyTransform` with `transform.mode: 'projection' | 'rotate'`, and reactively sync initial transform values on projection changes ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Bar): Support fixed `width` and `height` props to override scale-derived dimensions, centering the bar within its band. Resolves #360 ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Auto-compute Bar/Bars mount animation initial values from chart scales ([#663](https://github.com/techniq/layerchart/pull/663))

  Bar now automatically derives `initialY`/`initialHeight` (vertical) or `initialX`/`initialWidth` (horizontal) from the chart's scale range when `motion` is configured, removing the need to hardcode pixel values.

  Also improves `valueAxis` inference on `ChartState` — when not explicitly set, it is now derived from scale types (band scale on y → `valueAxis: 'x'`, band scale on x → `valueAxis: 'y'`).

- feat(Chart): Add cartesian pan/zoom via `transform={{ mode: 'domain' }}` with single or both axis support. Resolves #366 ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Spline): Add motion support for mount animation from baseline ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Spline): Support function-valued `stroke`, `fill`, and `opacity` for per-segment styling ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking: Move heavy-dep components into sub-path exports ([#845](https://github.com/techniq/layerchart/pull/845))

  The following components are no longer re-exported from `'layerchart'` and must be imported from new sub-paths:
  - `'layerchart/geo'` — `GeoCircle`, `GeoClipPath`, `GeoEdgeFade`, `GeoLegend`, `GeoPath`, `GeoPoint`, `GeoProjection`, `GeoRaster`, `GeoSpline`, `GeoTile`, `GeoVisible`, `Graticule`, `TileImage`
  - `'layerchart/hierarchy'` — `Tree`, `Treemap`, `Pack`, `Partition`
  - `'layerchart/force'` — `ForceSimulation`
  - `'layerchart/graph'` — `Dagre`, `Sankey`, `Chord`, `Ribbon`

  This isolates each group's external d3 dependency (`@dagrejs/dagre` ~22 KB, `d3-geo` ~15 KB, `d3-force` ~7 KB, `d3-hierarchy` ~6 KB, `d3-sankey` ~6 KB, `d3-chord` ~2 KB) behind an opt-in import — defending against bundlers that don't tree-shake the root barrel cleanly.

  `Voronoi`/`Hull` stay at root (already lazy-loaded via `TooltipContext`). `Contour`/`Density`/`Raster`/`BoxPlot`/`Violin`/`Threshold` and high-level charts (`LineChart`, `BarChart`, etc.) remain at root.

  **Migration:** update affected imports, e.g.

  ```diff
  -import { Tree, GeoPath, ForceSimulation } from 'layerchart';
  +import { Tree } from 'layerchart/hierarchy';
  +import { GeoPath } from 'layerchart/geo';
  +import { ForceSimulation } from 'layerchart/force';
  ```

- feat(Text): Add `fontSize` prop with auto-derived `capHeight` ([#862](https://github.com/techniq/layerchart/pull/862))

  Adds a typed `fontSize?: number | string` prop on `<Text>` (number = pixels, string passes through). When set, `capHeight` defaults to `fontSize * 0.71` instead of the legacy `'0.71em'` — so per-item scaled labels with `verticalAnchor="middle"` align to a common visual baseline without an explicit `capHeight` override.

  Previously, `getPixelValue` resolved `'0.71em'` against a hard-coded 16px, so vertical centering was only correct for ~16px text. Larger labels sat too low, smaller ones too high — visible on text-driven beeswarms or any caller scaling labels per-element.

  ```svelte
  <!-- Before: needed both font-size and capHeight to center correctly -->
  <Text font-size={r * 1.4} capHeight="{r * 1.4 * 0.71}px" verticalAnchor="middle" ... />

  <!-- After: one prop, centering handled automatically -->
  <Text fontSize={r * 1.4} verticalAnchor="middle" ... />
  ```

- feat(Text): Add `format` prop and tween numeric `value` when `motion` is configured ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking: Extract `Path` primitive component from `Spline` for better separation of concerns ([#659](https://github.com/techniq/layerchart/pull/659))

- feat(Tooltip): Add `fadeDuration` prop to control fade in/out transition ([#828](https://github.com/techniq/layerchart/pull/828))

  The fade transition on `Tooltip.Root` is now configurable via the `fadeDuration` prop (default: `100`ms). Set to `0` to disable the fade transition entirely.

- feat(Tooltip): Portal tooltip to body by default to fix overflow clipping. Resolves #446 ([#828](https://github.com/techniq/layerchart/pull/828))

  Tooltip.Root now portals to `document.body` (or `.PortalTarget`) by default using the `portal` action from `@layerstack/svelte-actions`. This prevents tooltips from being clipped by ancestor elements with `overflow: hidden`. The tooltip uses `position: fixed` with viewport-relative coordinates when portaled. Set `portal={false}` to restore the previous inline behavior. Both `contained="container"` and `contained="window"` modes continue to work correctly with portaling.

- feat(tooltipContext, Voronoi): Add `x`/`y` accessor overrides and default array endpoint to max ([#449](https://github.com/techniq/layerchart/pull/449))
  - **New `x`/`y` props** on `tooltipContext` and `Voronoi` accept an `Accessor` (property name string or function). When set, hit-detection points use these accessors instead of the Chart's `x`/`y`. Useful when the Chart's accessor returns an array (e.g. `x={['POP_1980', 'POP_2015']}`) and you want detection at a specific endpoint:
    ```svelte
    <Chart {data} x={['POP_1980', 'POP_2015']} tooltipContext={{ mode: 'voronoi', x: 'POP_2015', y: 'R90_10_2015' }}>
    ```
  - **Breaking (minor)**: when the chart's x/y accessor returns an array (duration bars, candlesticks, stacked areas, etc.), quadtree and voronoi hit-detection now default to the **max** value of the array instead of the **min**. For most use cases (target endpoint, stack top) this is the more natural hover position. If you need the old behavior, pass an explicit `x`/`y` accessor on `tooltipContext`/`Voronoi`.

- feat: Add Annotation components (AnnotationPoint, AnnotationLine, AnnotationRange) ([#458](https://github.com/techniq/layerchart/pull/458))

- feat: Support continuous color scales via `cScale` prop without requiring `cRange` ([#663](https://github.com/techniq/layerchart/pull/663))
  - Allow `cScale` (e.g. `scaleSequential(interpolateTurbo)`) to activate without `cRange`, enabling pre-configured sequential/diverging color scales
  - Guard `createScale` against undefined `range` to avoid breaking interpolator-based scales
  - Auto-detect numeric `cDomain` values and use `extent` instead of `unique`, producing correct `[min, max]` domains for continuous scales
  - Prefer `cScale` color over default series color in tooltip/highlight when a color scale is configured

- feat(Labels): Support `seriesKey` in `labels` prop to filter which series renders labels. Resolves #633 ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Support css-only usage (no Tailwind required) while retaining first-class Tailwind support ([#557](https://github.com/techniq/layerchart/pull/557))

- feat(Rect): New edge-based props (`x0`/`x1`/`y0`/`y1`) along with existing (`x`/`y`/`width`/`height`) and `insets` support ([#663](https://github.com/techniq/layerchart/pull/663))

- feat: Add Vector component ([#663](https://github.com/techniq/layerchart/pull/663))

### Patch Changes

- fix: Prevent submitting forms when clicking legend buttons ([#841](https://github.com/techniq/layerchart/pull/841))

- fix(Area): Default y0 baseline to chart's yBaseline when set ([#663](https://github.com/techniq/layerchart/pull/663))

  Area's y0 fallback now respects the chart's `yBaseline` prop (e.g. `yBaseline={0}` set by AreaChart) instead of always using `min(yScale.domain())`. This fixes areas filling to the bottom of the chart instead of to the baseline when data goes negative.

- feat: Add `stroke` and `fill` props to `Axis` and `Grid` for explicit color control (useful for SSR where CSS variables are unavailable) ([#813](https://github.com/techniq/layerchart/pull/813))

- Support `tickSpacing` for band scales on Axis, thinning tick labels when the domain is larger than the available space. Automatically shows more tick labels when zoomed in on band scale transforms. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(ScatterChart): Change default tooltip mode from `voronoi` to `quadtree` ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(Threshold): Properly clip `above` snippet (resolving 1/2 width clipping issues when using Spline) ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Bars): Fix inverted rect when rendered top-to-bottom or right-to-left. Fixes #540 ([#613](https://github.com/techniq/layerchart/pull/613))

- fix(AreaChart|BarChar|LineChart): Use value axis (typically y) property name/accessor for tooltip label if defined as string (ex. `<AreaChart x="date" y="visitors">` will use `visitors` instead of `value`) ([#523](https://github.com/techniq/layerchart/pull/523))

- fix(TooltipContext): Handle chart padding when using `quadtree` mode ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking(AnnotationLine|AnnotationPoint): Change `labelOffset` into explicit `labelXOffset` and `labelYOffset` for greater control (aligns with AnnotationRange) ([#492](https://github.com/techniq/layerchart/pull/492))

- fix(Points|Labels): Correctly position when using x1 / y1 scales (issue #773) ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(GeoPath): Fix reactivity with `curve` when using Canvas context ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(Canvas): Fix pointer events (hit canvas) when using Brave browser with fingerprinting protection enabled ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(TooltipContext): Support `quadtree-x` and `quadtree-y` modes. Resolves #525 ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(ArcChart): (Re-)disable grid by default (regression from recent refactor) ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Tooltip): Correctly set tooltip position on chart enter and exit ([#655](https://github.com/techniq/layerchart/pull/655))

- fix(GeoPath): Do not register with hit canavs unless pointer events (onclick, onpointermove, etc) or tooltipContext are defined ([#549](https://github.com/techniq/layerchart/pull/549))

- fix(canvas): Compose globalAlpha multiplicatively so Group opacity propagates to children ([#831](https://github.com/techniq/layerchart/pull/831))

  Canvas `renderPathData` was overwriting `ctx.globalAlpha` with absolute values for element opacity, fill opacity, and stroke opacity. This meant a parent `<Group opacity={0.2}>` had no effect on child marks rendered on canvas — the child's own opacity (defaulting to 1) would replace the inherited value.

  Now all three sites multiply against the current `globalAlpha`, which correctly composes with ancestor Group opacity set via `save()`/`restore()` scoping. Also removes double-application of element `opacity` inside the fill/stroke blocks (it's already applied at the element level).

- fix(Chart): Explicit `<Chart data>` now takes precedence over marks' implicit-series data ([#449](https://github.com/techniq/layerchart/pull/449))

  When a mark registered its own filtered dataset via `markInfo` (e.g. a decorative `<Text data={highlighted}>` showing labels for a subset), two things went wrong:
  1. `ctx.data` would silently switch to the filtered subset via `seriesState.visibleSeriesData`, causing sibling array-driven marks (like `<Link>`) to iterate only the subset.
  2. An implicit series would be created from the decorative mark, narrowing the domain calculation to only the subset's values.

  Now when `<Chart data>` is explicit (non-empty):
  - `ctx.data` always returns the chart's data.
  - Marks whose axis accessor matches the chart's axis accessor (including any element of an array accessor like `y={['v1', 'v2']}`) are treated as decorative and don't create implicit series — even if they have their own `data` array.

  Marks with their own data still contribute to `flatData` for domain calculation when their accessor differs from the chart's (the multi-dataset / multi-series scenario).

- fix(Chart): Disable text selection to prevent selection while dragging ([#879](https://github.com/techniq/layerchart/pull/879))

- perf(Chart): Eliminate per-instance props spread in `ChartState` ([#857](https://github.com/techniq/layerchart/pull/857))

- fix(Chart): Don't compute `[undefined, undefined]` domain when `series` is metadata-only ([#449](https://github.com/techniq/layerchart/pull/449))

  When `series` is configured for legend/color metadata only (no per-series `data`, and items lack the series-key properties on the value axis), the value-axis domain calculation collected all-undefined values and returned `[undefined, undefined]`. Combined with `motion`, this threw `Cannot spring undefined values` whenever the series visibility changed (e.g. toggling a legend swatch).

  The series-aware branch now filters out null/undefined values and falls through to the other domain-resolution paths when nothing remains, instead of returning a poisoned extent.

- fix(HighlightKey): Define `set()` with arrow function to solve `current` access when passed directly ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Canvas): Support disabling the hit canavs (useful when animations are playing) ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(TooltipContext): Revert back to pointer events (instead of mouse/touch) but with `touch-action: pan-y`. Provides simplified events while allowing horizontal scrubbing with vertical scrolling. ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(PieChart): Do not pass `y` accessor to use linear scale fallback ([#631](https://github.com/techniq/layerchart/pull/631))

- fix(AnnotationPoint): Do not propagate mouse/touch move/leave events to TooltipContext after switching from pointer events. Fixes #598 ([#602](https://github.com/techniq/layerchart/pull/602))

- fix(LineChart): Restore passing xScale / yScale overrides ([#449](https://github.com/techniq/layerchart/pull/449))

- refactor(Chart): Add `debug` prop and update `settings` context ([#663](https://github.com/techniq/layerchart/pull/663))

- breaking: Change `defaultChartPadding(axis, legend)` to `defaultChartPadding({ axis, legend })` and support overrides (ex. `defaultChartPadding({ left: 50 })`) ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(TooltipContext): Fix touch scrolling on mobile. Fixes #255 ([#566](https://github.com/techniq/layerchart/pull/566))

- fix(Connector, Link): Orient d3 step curves by `orientation` ([#449](https://github.com/techniq/layerchart/pull/449))
  - Added `orientation?: 'horizontal' | 'vertical'` prop to `Connector` (defaults to `'horizontal'`). `Link` forwards its own orientation so step curves step along the natural flow direction.
  - `curveStep`, `curveStepBefore`, and `curveStepAfter` now step along `y` in vertical orientation instead of always stepping along `x`.

- fix(Highlight|TooltipContext): Support xInterval / yInterval ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(TooltipContext): Fix `band` mode regression when both x/y are scaleBand (ex. punchcard chart) ([#557](https://github.com/techniq/layerchart/pull/557))

- breaking(Treemap): Remove `selected` prop ([#516](https://github.com/techniq/layerchart/pull/516))

- feat(Spline): Add `value` to `startContent` and `endContent` snippets to easily access the `x` and `y` data values ([#537](https://github.com/techniq/layerchart/pull/537))

- fix(Canvas): Only apply text/font properties to canvas to improve performance ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(AnnotationRange|TooltipContext|Highlight): Fix using interval scales with reversed data (ex. xReverse) ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(SimplifiedCharts): Properly handle `legend` prop as object when determining bottom padding ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(Axis): Fix display of axis labels ([#591](https://github.com/techniq/layerchart/pull/591))

- fix(Text): Apply `fill: currentColor` to support more straightforward way of changing color (ex. `class="text-red-500"` or `style="color:red"`) ([#557](https://github.com/techniq/layerchart/pull/557))

- fix: Default chart padding now applied when using ChartChildren layout (marks snippet) ([#663](https://github.com/techniq/layerchart/pull/663))

  When `<Chart>` is used with `marks`/`grid`/`axis` snippets (no explicit `children` snippet), default padding is now applied to match the axes that ChartChildren renders by default. When `children` is provided directly (e.g. Treemap, Pack), no default padding is applied since the user controls layout. This can still be overridden with explicit `axis` or `padding` props.

- feat: Support passing `FormatConfig` (ex. `{ type: '...', options: { ... } }`) anywhere `FormatType` is supported to simplify custom formatting (ex. `variant`) ([#521](https://github.com/techniq/layerchart/pull/521))

- fix(Tooltip): Apply inverse transform for quadtree lookup when zoomed/panned ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(Treemap): Add `maintainAspectRatio` (default: false) to opt into tiling function adjustment (primarily for zoom) ([#516](https://github.com/techniq/layerchart/pull/516))

- fix(ForceSimulation): Restore performance to at/near Svelte 4 performance (issue #451) ([#458](https://github.com/techniq/layerchart/pull/458))

- breaking(Legend): Rename `classes.swatches` to `classes.item` ([#571](https://github.com/techniq/layerchart/pull/571))

- fix: Improve memory leak caused by detached DOM increase when using Canvas rendering due to sometimes still rendering Svg components (ex. `<g>` vs `<Group>`) (#490) ([#490](https://github.com/techniq/layerchart/pull/490))

- fix(Highlight): Properly handle area highlights with y-axis time scales ([#562](https://github.com/techniq/layerchart/pull/562))

- fix(Group): Default `opacity` to `undefined` instead of `1` to allow overriding via class (ex. `opacity-20`) ([#520](https://github.com/techniq/layerchart/pull/520))

- feat: Support passing `PeriodTypeCode` strings for simplified date formatting and reduce imports. Example: `format={PeriodType.Day}` is now `format="day"`. Also supported with config object for passing additional options (ex. `format={{ type: 'day', options: { variant: 'long' } }}`). Supported for all `format` props include Axis, Labels, Legend and Tooltip. ([#521](https://github.com/techniq/layerchart/pull/521))

- fix(Legend): Improve / simplify responsive use cases with additional default classes (center, shrink, truncate) ([#571](https://github.com/techniq/layerchart/pull/571))

- docs: Add examples for standalone, daisyUI v5, shadcn-svelte v1, Skeleton v3, and Svelte UX v2 (next) (including light/dark theming) ([#557](https://github.com/techniq/layerchart/pull/557))

- Update dependencies ([#629](https://github.com/techniq/layerchart/pull/629))

- fix(autoScale): Ignore `null` domain values, fixing some brush examples ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking(Axis): Rename `x="left|right"` and `y="top|bottom"` props with `$` prefix (ex. `<Axis x="$left">`) ([#622](https://github.com/techniq/layerchart/pull/622))

- refactor: Rename simplified charts `renderContext` prop to `layer` ([#659](https://github.com/techniq/layerchart/pull/659))

- feat(LineChart): Support `orientation="vertical"`. Resolves #640 ([#557](https://github.com/techniq/layerchart/pull/557))

- perf: Optimize primitive component instantiation (~3-5x faster for Rect, Circle, Ellipse, Line, Text, Path, Group) ([#449](https://github.com/techniq/layerchart/pull/449))
  - `createMotion`: Fast-path passthrough when no `motion` prop is provided, avoiding `$state`/`$effect` overhead per axis
  - `createDataMotionMap`: Short-circuit when `motion` is `undefined`, skipping `parseMotionProp` overhead
  - `createKey`: Only create fill/stroke key trackers in canvas layer (skipped for SVG/HTML)
  - `registerComponent`: Skip `registerMark` for empty `MarkInfo` (pixel-mode marks)
  - All primitives: Skip `$effect` for data motion tracking when no motion is configured
  - Rect/Image: Avoid per-axis `parseMotionProp` calls when `motion` is `undefined`

- feat(Marker): Add `square` and `square-stroke` types ([#805](https://github.com/techniq/layerchart/pull/805))

- fix(AnnotationRange): Don't extend past chart bounds when `x` is omitted on band scales, and treat `null` on either side of `x`/`y` as "extend to chart edge". ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(ArcLabel): Support rotation in Canvas mode ([#449](https://github.com/techniq/layerchart/pull/449))

  Changed `centroid-rotated` and `centroid-radial` placements to pass `rotate` prop instead of SVG `transform` string to `Text`, enabling rotation in Canvas rendering.

- fix(Area): Handle degenerate domains (e.g. all-zero data) and unify y0/y1 baseline logic ([#663](https://github.com/techniq/layerchart/pull/663))
  - Guard against degenerate scale domains where min === max (e.g. `[0, 0]`), which caused `yScale()` to return `NaN` and break area path rendering
  - Unify Area y0/y1 path computation to consistently use accessors through the scale, removing duplicate fallback logic

- fix(BarChart): automatically round the outer edge of each direction in `stackDiverging` layout ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(canvas): Resolve `currentColor` for `fill`/`stroke` (and other style props) ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Pattern): fix alignment and sharply render on high-DPI displays when using Canvas layers ([#864](https://github.com/techniq/layerchart/pull/864))

- fix(downloadImage / getChartImageBlob): Fix image download (container sizing and text clipping) ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Remove TypeScript `as` casts from `class={...}` attributes in `Path` and `GeoPoint` to fix unocss compat. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: guard against undefined accessor in printScale ([#875](https://github.com/techniq/layerchart/pull/875))

  When activeGetters includes z or r scales that are not configured, the accessor is undefined, causing acc.toString() to throw. Added null check.

- fix: Skip mark x/y/data from domain/series calculation when geo projection is active ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(GeoPath): Fix canvas tooltip by conditionally passing onclick to Path, preventing non-interactive overlays from capturing hit canvas events ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(GeoPath): Avoid passing `undefined` event handlers to underlying `Path`, preventing a Svelte error while preserving canvas hit-testing for non-interactive paths ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(ChartState): Don't create spurious implicit series when mark accessor matches chart's own axis accessor, fixing domain corruption for heatmap/Cell charts ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Pattern): Restore canvas layer support by registering as a `group` node so snippet children (e.g. `<Rect fill={pattern}>`) render correctly ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Pie and Arc components now correctly use Chart's `xRange` prop for angle degrees instead of the computed viewport pixel range, and compute radius from chart dimensions instead of scale range ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(scaleBandInvert): Account for range offset in band scale inversion. Previously assumed range started at 0, causing incorrect pixel-to-category mapping when the scale range was transformed. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(SeriesState): Avoid `derived_inert` crash when chart unmounts under a `<svelte:boundary>` ([#855](https://github.com/techniq/layerchart/pull/855))

  The `selectedKeys` sync effect was wrapped in `$effect.root`, creating an isolated scope that survived chart unmount. When the parent chart was destroyed (e.g. an example reloading inside the docs `<svelte:boundary>` after an async `$derived` re-evaluated), the `#series` derived became inert while the orphaned effect kept reading it — producing `Reading a derived belonging to a now-destroyed effect may result in stale values` warnings followed by `TypeError: e.some is not a function`. The effect now lives in the constructor, scoped to the component that instantiated `SeriesState`, so it is torn down with the chart.

- fix(Spline): Allow CSS class `opacity` to fade lines on the Canvas layer. `Spline` was always passing `opacity={1}` to the underlying `Path` when no series fade was active, which became `constantStyles.opacity = 1` in the canvas renderer and shadowed the value resolved from a user's `class` (e.g. `class="opacity-20"`). Now skip passing `opacity` when the computed series fade is the no-fade default, so the class can take effect — matching SVG behavior where CSS class rules override the presentation attribute. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Spline): Restore `series.props.opacity` (and other style props) precedence over the computed series fade opacity. Regression introduced by per-segment styling refactor where the explicit `opacity` was spread after `series.props`, clobbering per-series opacity values (e.g. `series={[{ props: { opacity: 0.1 } }, ...]}`). ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Allow negative string values (e.g. `y="-6"`) in `Text` position props to be treated as pixel values instead of data property names ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(TransformContext): Reactively sync `processTranslate` and `disablePointer` to TransformState when props change. Fixes inverted globe dragging when dynamically switching between flat and globe projections. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Arc, RectClipPath, ChartClipPath): Restore on-mount tween animations ([#855](https://github.com/techniq/layerchart/pull/855))

  Two related regressions introduced in the layer-component split (#848) prevented `motion` + `initial*` props from animating on mount.

  **`Arc`** — `motion`, `value`, `initialValue` and the rest of Arc's geometry props (`domain`, `range`, `startAngle`, `endAngle`, `innerRadius`, `outerRadius`, `cornerRadius`, `padAngle`, `track*`, `offset`) were not destructured in `Arc.base.svelte`, so they leaked through `{...restProps}` onto the inner `<Path>`. The forwarded `motion` made `Path` _also_ tween the path-string on top of the end-angle tween that `ArcState` already drives, producing visibly wrong arcs (NaN coordinates, runaway radii). They are now extracted and passed explicitly to `ArcState`.

  **`RectClipPath` / `ChartClipPath`** — `motion`, `initialX`, `initialY`, `initialWidth`, `initialHeight` were declared on the type but never consumed: the path was a plain `$derived` of the static `x`/`y`/`width`/`height` props, so passing `<ChartClipPath initialWidth={0} motion={{ width: { type: 'tween', … } }}>` rendered the final width on mount with no animation. Each dimension now flows through its own `createMotion` (using the corresponding `initial*` value as the animation start), and the path is built from the animated values.

- fix(ChartState): Don't filter explicit `x1Domain`/`y1Domain` by visible series when no series are configured. Restores grouped layout for composable `<Chart>` usage (e.g. `<Bars>` with `x1`/`x1Domain`/`x1Range`) where the visible-series filter previously emptied the secondary band scale domain, collapsing all bars to a single category position. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: `flattenPathData` now handles relative arc commands, fixing rounded bars starting below the baseline during mount animation ([#663](https://github.com/techniq/layerchart/pull/663))

- refactor: Move contexts to separate `$lib/contexts` module ([#659](https://github.com/techniq/layerchart/pull/659))

- feat(Layer): Allow `type` to be optional, fallbacking back to `settings.layer` type ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Calendar): Pass `cellSize` to children snippet (useful when responsive) ([#558](https://github.com/techniq/layerchart/pull/558))

- fix(Axis): Correctly place multiline parts based on placement ([#574](https://github.com/techniq/layerchart/pull/574))

- fix(Axis): Key using tick value instead string representation to support millisecond precision ([#508](https://github.com/techniq/layerchart/pull/508))

- fix(Rect): Support rounded (rx/ry) in Canvas layers (fixes [#481](https://github.com/techniq/layerchart/issues/481)) ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Axis): Filter distinct tick values (useful when manually injecting extra values) ([#615](https://github.com/techniq/layerchart/pull/615))

- feat: Support global settings (layer type, debug, etc) ([#659](https://github.com/techniq/layerchart/pull/659))

- feat(TooltipContext): Support `band` mode with time scale (similar to band scale) ([#562](https://github.com/techniq/layerchart/pull/562))

- fix(Axis): Add time duration aware tick value/format support ([#508](https://github.com/techniq/layerchart/pull/508))

- fix: Default geo projection `translate` to container center when `translate` and `fitGeojson` are not specified, instead of using d3-geo's fixed default (`[480, 250]`) ([#815](https://github.com/techniq/layerchart/pull/815))

- fix(Chart): Enable scroll zoom for globe projections by including `scale: true` in default `transformApply` for globes. ([#449](https://github.com/techniq/layerchart/pull/449))

- Removed lodash-es dependency ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Area|Highlight): Properly handling diveraging stack layouts for negative values (line, highlight point) ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(Bar): Fix browser lockup when switching between group and stack layouts ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(AreaChart|LineChart|DefaultTooltip): Handle per-series data with different length ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(Calendar): Respect `start` instead of always start of year ([#657](https://github.com/techniq/layerchart/pull/657))

- feat(Highlight): Support passing `opacity` ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(LineChart): Change default tooltip mode from `bisect-x` to `quadtree-x` (works with catagorical data and does not require data to be sorted) ([#578](https://github.com/techniq/layerchart/pull/578))

- feat(Circle|Rect): Support passing children snippet for Html layers ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(SimplifiedChart): Still add selected legend item opacity when item classes are also applied ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(Rect): On the `<Html>` layer, set `background-origin: border-box` so fills/patterns start at the outer edge — previously the CSS `background` shorthand reset origin to `padding-box`, shifting patterns inward by `border-width` when a stroke was applied. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Rect, Circle, Ellipse): Apply `box-sizing: border-box` on the `<Html>` layer so the visual extent equals `width`×`height` (or `r * 2`, `rx * 2`×`ry * 2`) — the border is drawn within that extent instead of added to it, matching SVG bounds. ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Rect, Circle, Ellipse): On the `<Html>` layer, default `border-width` to `1px` when `stroke` is set without an explicit `strokeWidth`, matching SVG's implicit `stroke-width: 1`. Also ensures Circle/Ellipse `border-width` gets the required `px` unit. ([#449](https://github.com/techniq/layerchart/pull/449))

- docs: Document each component's context support (svg, canvas, html) with interactive toggle ([#549](https://github.com/techniq/layerchart/pull/549))

- feat(Legend): Add `selected` prop to fade out unselected items (if passed and non-empty) ([#557](https://github.com/techniq/layerchart/pull/557))

- docs: Add non-radial BarChart duration example and improve radial example ([#496](https://github.com/techniq/layerchart/pull/496))

- feat(Chart): Support passing explicit `width` and `height` instead of requiring parent dimensions ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Image): Stop disabling pointer events by default ([#862](https://github.com/techniq/layerchart/pull/862))

- fix(force-simulation): Fixed a bug that would sometimes keep a simulation running, when its inputs change, even if `alpha < alphaMin` ([#546](https://github.com/techniq/layerchart/pull/546))

- fix(Bar): Fix bar rounding direction when using xReverse/yReverse with interval scales ([#659](https://github.com/techniq/layerchart/pull/659))

- feat: Add `applyLanes()` array util to support densely packing timelines ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(TooltipContext): Add `touchEvents` to control touch event behavior. Defaults to `pan-y` to allow vertical scrolling but horizontal scrubbing. ([#557](https://github.com/techniq/layerchart/pull/557))

- perf: Lazy-load opt-in features in `core` path ([#845](https://github.com/techniq/layerchart/pull/845))

  5 components/dependencies that previously sat in every `<Chart>` user's sync graph are now dynamically imported only when the corresponding feature is used:
  - `BrushContext` in `Chart` — only loads when `<Chart brush={...}>` is set (default `undefined`)
  - `DefaultTooltip` in `ChartChildren` — only loads when `tooltipContext` is set and no custom `tooltip` snippet is provided
  - `d3-quadtree` in `TooltipContext` — only loads when `mode` is `'quadtree'`, `'quadtree-x'`, or `'quadtree-y'`
  - `Spline` in `Grid` — only loads when rendering radial linear grid lines (`<Chart radial>` with `radialY="linear"`)
  - `Bar` in `Highlight` — only loads when `<Chart highlight={{ bar: ... }}>` is set (default `false`)

  Result: **~10 KB gz off `core`** (115.6 → 105.25 KB) and comparable savings on every cartesian/geo/graph/hierarchy scenario, with no impact on rendered output for users who already opt into these features.

  Also switches internal `@layerstack/svelte-actions` imports from the barrel (`@layerstack/svelte-actions`) to sub-paths (`@layerstack/svelte-actions/styles`, `@layerstack/svelte-actions/portal`). No production bundle effect — bundlers already tree-shake the unused `popover.js` — but it stops the Svelte REPL/CDN from eagerly fetching `@floating-ui/dom` (popover's transitive dep) when consumers load `layerchart` from a CDN.

- feat(Voronoi): Support passing `r` to define a max radius (clip path) ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Axis): Use `format` to filter ticks (integer and date/time). Helpful to keep ticks above a threshold for wide charts or short durations. ([#615](https://github.com/techniq/layerchart/pull/615))

- fix(GeoPath): Improve performance by only using custom geoCurvePath when `curve` overridden ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(Highlight): Fix display of lines for first values (`0` coord). Fixes #568 ([#569](https://github.com/techniq/layerchart/pull/569))

- fix(Tooltip): Use standard CSS classes (non-tailwind) for root element to simplify some usage (including shadcn-svelte) ([#511](https://github.com/techniq/layerchart/pull/511))

- fix(Points|Labels): Correctly position when using array accessors (duration charts, etc). Fixes #633 ([#663](https://github.com/techniq/layerchart/pull/663))

- fix: Workaround Svelte 5.52+ regression (Parse failure: Expected '{', got '(') ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Points): Update `point.x` / `point.y` based on `ctx.radial` to simplify children snippet usage ([#611](https://github.com/techniq/layerchart/pull/611))

- feat(SeriesState): Add `isHighlighted(seriesKey)` to easy check if series is hightlight (or should be faded) ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(TooltipContext): correct `bisect-band` hit detection by accounting for chart padding ([#806](https://github.com/techniq/layerchart/pull/806))

- feat(Axis): Support multiline ticks for time intervals ([#508](https://github.com/techniq/layerchart/pull/508))

- fix(Treemap): Fix reactivity of props (tile, padding, etc) ([#516](https://github.com/techniq/layerchart/pull/516))

- feat(Raster, Contour): support bounded geo raster overlays with projected interpolation ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(BarChart): Support time scale with `xInterval` / `yInterval` props ([#562](https://github.com/techniq/layerchart/pull/562))

- fix(ClipPath): Support canvas layers. Resolves #660 ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(TooltipList): Align label to top (start) instead of center by default ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Bar): Clamp radius to width/height to not cause artifacts with small values (including `0`) when rounding a single edge. Fixes #383 ([#610](https://github.com/techniq/layerchart/pull/610))

- feat: Add Polygon primitive ([#533](https://github.com/techniq/layerchart/pull/533))

- breaking(Blur): Remove children snippet props (not needed and easier to support canvas in the future) ([#549](https://github.com/techniq/layerchart/pull/549))

- fix(Axis): Fix memory leak and improve performance when tick values are `Date` instances ([#586](https://github.com/techniq/layerchart/pull/586))

- fix(BarChart): Improve handling time scale for value axis (ex. xScale for horizontal orientation) ([#496](https://github.com/techniq/layerchart/pull/496))

- fix(Calendar): Support showing month labels without path via `monthLabel` prop (true by default) ([#449](https://github.com/techniq/layerchart/pull/449))

- perf: Reduce per-tick reactive overhead in `Path` / `Link` (force-simulation graphs) ([#855](https://github.com/techniq/layerchart/pull/855))

  In mark-heavy scenes (force simulations with hundreds of links flowing through `Link → Path`) several reactive structures unconditionally subscribed every `<path>` template updater to props that don't change on a tick, causing per-frame work to scale with the number of props × the number of marks. Each fix below is independent; together they take the lattice (n=20, 760 links) example from ~5–6 fps to ~9 fps during simulation.

  **`PathState.tweenedPathData` now reads only `pathData`, not all Path props.**
  Pre-fix, the getter resolved `pathData` via `getProps()`, a function that constructs an object literal of every reactive Path prop. Each read of `tweenedPathData` (i.e. each per-tick `<path d=...>` update) therefore subscribed the updater to every Path prop and re-read all of them. `PathState` now takes a dedicated `getPathData` getter alongside `getProps`, and the hot-path tween / DOM read only touches `pathData`. `Path.svg.svelte` and `Path.canvas.svelte` pass them as separate getters.

  **`Link.base.svelte` passes a stable `getPathData` function rather than `motionPath.current` directly.**
  Reading `motionPath.current` from `Link.base.svelte`'s template subscribed the entire `<Path>` block to every tick, forcing the parent's prop spread (`{...restProps}`) and `cls(...)` evaluation to re-run on every change. Passing a stable function reference moves the per-tick read inside `<Path>`'s own template, keeping `Link.base.svelte` stable. Requires the new `pathData?: string | (() => string)` form on `Path`.

  **`Path.svg.svelte` allocates `draw`-related state lazily.**
  - `endPoint = createControlledMotion(..., { type: 'none' })` was created for every `Path`, even when no `draw` transition was configured. Now only created when `draw` is set.
  - The `$effect` that tracked `tweenedPathData` for `startContent` / `endContent` positioning ran on every `Path`, even when neither prop was provided. Now only registered when at least one is set.
  - `drawKey` is only ever set when `draw` is configured, so the `{#key c.drawKey}` block is a no-op for paths without a draw transition. The block stays unconditional — splitting it behind `{#if draw}` showed no measurable benefit over leaving the inert subscription in place.

  **`Path.svg.svelte` extracts styling props out of `...rest`.**
  `pathData`, `class`, `fill` / `fillOpacity` / `stroke` / `strokeOpacity` / `strokeWidth` / `opacity` and `motion` are now destructured out of `$props()` rather than left in `...rest`, so the `<path>` element's `{...rest}` spread doesn't re-evaluate every frame when those props change (`pathData` changes on every force-sim tick; `class` is typically a fresh `cls(...)` string per parent render).

  **`Link.base.svelte` drops a redundant prop spread.**
  Removed `{...extractLayerProps(restProps, 'lc-link')}` before `{...restProps}` — the call's only contribution (`class`) was being immediately overridden by the explicit `class={cls('lc-link', …)}` that follows, making the spread pure overhead.

- fix(Calendar|MonthPath): Support canvas by using `Spline` instead of `path` ([#549](https://github.com/techniq/layerchart/pull/549))

- refactor: Replace `date-fns` usage with existing `d3-time` to reduce bundle size ([#551](https://github.com/techniq/layerchart/pull/551))

- feat: Add Month component ([#671](https://github.com/techniq/layerchart/pull/671))

- fix: Support `opacity` prop/style when Canvas rendered for all primatives ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(LinearGradient): Support Html context ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(ArcChart): Do not pass y accessor to use linear scale fallback ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(ForceSimulation): Refined `onstart`/`ontick`/`onend` events of `ForceSimulation` ([#547](https://github.com/techniq/layerchart/pull/547))

- refactor: Update `@layerstack/svelte-state` and replace remaining `@layerstack/svelte-stores` usage (media query) (mostly docs related except Canvas) ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Axis): Support responsive tick counts via `tickSpacing` prop ([#508](https://github.com/techniq/layerchart/pull/508))

- fix(Primatives): Apply default classes when using Canvas context (like Svg). Resolves #544 ([#557](https://github.com/techniq/layerchart/pull/557))

- chore: Update deps (including dagre from 1.x to 2.x) ([#449](https://github.com/techniq/layerchart/pull/449))

- breaking(Bar): Rename `bar` prop to `data` to better represent usage ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: improve compatibility with UnoCSS Svelte scoped preprocessing ([#813](https://github.com/techniq/layerchart/pull/813))
  - Remove TypeScript-only `as` assertions from exported Svelte markup in core mark components so preprocessors that parse markup expressions as plain JavaScript can consume packaged components without failing

- fix(Axis): Additional multiline month fix for day ticks ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Reduce bundle size by removing culori as transitive dependency ([#563](https://github.com/techniq/layerchart/pull/563))

- fix(ScatterChart): Support color scales based on value (such as threshold) ([#458](https://github.com/techniq/layerchart/pull/458))

- fix(Rect): Support non-uniform `corners` in data/edge mode ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(TooltipContext): Support `quadtree` mode for geo visualizations ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Chart): Support `motion` prop to transition x/y scales using tween or spring ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Chart): Add `xInterval` / `yInterval` for time scales usage with bar charts ([#562](https://github.com/techniq/layerchart/pull/562))

- fix(Highlight): Support radial area (issue #112) ([#458](https://github.com/techniq/layerchart/pull/458))

- fix: Update dependencies, notable @layerstack/utils with improved metric number formatting ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Chart): Automatically determine scale based on data and domain values (instead of defaulting to scaleLinear) ([#624](https://github.com/techniq/layerchart/pull/624))

- feat(Chart|Svg|Html): Support passing `clip` prop to hide overflown content ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(AreaChart): Change default tooltip mode from `bisect-x` to `quadtree-x` (works with catagorical data and does not require data to be sorted) ([#578](https://github.com/techniq/layerchart/pull/578))

- fix(Text): Support explicit "\n" and set line-height (to match svg/canvas) for html layers ([#659](https://github.com/techniq/layerchart/pull/659))

- perf: Skip mark-info `$effect` for pixel-mode primitives ([#855](https://github.com/techniq/layerchart/pull/855))

  `registerComponent` now probes `markInfo()` once at construction; if the result is initially empty (pixel-mode primitives where `cx`/`cy`/`r`/etc. are numbers rather than string/function accessors), it skips creating the tracking `$effect` entirely. Saves one effect frame per primitive — adds up in mark-heavy scenes (force simulations, scatter plots with hundreds of nodes).

  Trade-off: a primitive that starts in pixel mode and later flips to data mode at runtime (e.g. `cx` mutates from a number to a string) will not register a mark. Mark mode is typically static; if a chart needs runtime data-mode marks, define an explicit `series` on the chart instead.

- fix(ForceSimulation): Expose default values by exporting them as constants ([#530](https://github.com/techniq/layerchart/pull/530))

- feat: Update `applyLanes()` util to support nested string key and function accessors for start/end properties ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Spline): Only re-draw on data/path changes and not other context (such as width/height). Fixes #504 ([#505](https://github.com/techniq/layerchart/pull/505))

- fix(Axis): Fix multiline month when day tick does not align on first of month ([#517](https://github.com/techniq/layerchart/pull/517))

- fix: Update `dagreAncestors()` and `dagreDescendants()` util types ([#629](https://github.com/techniq/layerchart/pull/629))

- fix: Add `applyLanes()` as top-level export ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Add classes for underlying element styling ([#458](https://github.com/techniq/layerchart/pull/458))

- fix: Resolves "Target div has zero or negative height" console warning (issue #291) ([#458](https://github.com/techniq/layerchart/pull/458))

- fix(Canavs): Support `style` attribute ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Canavs): support `strokeOpacity` for Path component ([#663](https://github.com/techniq/layerchart/pull/663))

- feat(Chart): Support `class` prop ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Canavs): Suppport dashed stroke (fix: #652) ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(Spline): Make motion prop reactive so toggling between tween/none updates without remount ([#449](https://github.com/techniq/layerchart/pull/449))

- refactor: Remove use of `layerClass` and apply `lc-{name}` class directly to allow easy component <style> targetting within LayerChart ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(Treemap): Fix `padding*` prop types to support function or number constant ([#516](https://github.com/techniq/layerchart/pull/516))

- feat(TooltipContext): Support `radius` for voronoi mode ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Text): Apply `dominant-baseline` to `<textPath>` instead of `<text>` to fix Safari. Fixes #507 ([#508](https://github.com/techniq/layerchart/pull/508))

- Switch from @tailwindcss/postcss to @tailwindcss/vite. Update all non-major packages ([#449](https://github.com/techniq/layerchart/pull/449))

- fix: Support passing `<*Chart tooltip={...}>` to underlying TooltipContext (as types already indicate) ([#576](https://github.com/techniq/layerchart/pull/576))

- breaking(Spline): Rename `splineRef` to `pathRef` ([#549](https://github.com/techniq/layerchart/pull/549))

- feat(Text): Support explicit word wrapping with `\n` character ([#508](https://github.com/techniq/layerchart/pull/508))

- fix(Text): handle inline styles and CSS class-based text-anchor ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(AnnotationRange): Fix passing non-class/fill props (ex. pointer events) via `props.rect` ([#449](https://github.com/techniq/layerchart/pull/449))

- fix(Tooltip): Fade non-highlighted series items on hover to match chart highlight state ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(Canvas): Improve performace by reducing computed style lookups and memoizing responses ([#561](https://github.com/techniq/layerchart/pull/561))

- fix(ForceSimulation): Export Forces<NodeDatum, LinkDatum> type. ([#531](https://github.com/techniq/layerchart/pull/531))

- fix(Text): Respect font weight when canvas rendered ([#458](https://github.com/techniq/layerchart/pull/458))

- fix(Axis|Text): Improve Text y placement using lineHeight/capHeight and remove explicit adjustments, aligning with Html rendering ([#449](https://github.com/techniq/layerchart/pull/449))

- feat(Layer): Support showing chart and full frame boundaries with `settings.debug` ([#659](https://github.com/techniq/layerchart/pull/659))

- fix(TooltipContext): Support band mode with array-based range accessors (e.g. histograms using `x={['x0', 'x1']}`) ([#663](https://github.com/techniq/layerchart/pull/663))

- fix(Canvas): Improve performance by skipping unnecessary work when hit canvas is unneeded ([#561](https://github.com/techniq/layerchart/pull/561))

- docs: Rename "Dot Plot" to "Duration" and add bars example along with points ([#496](https://github.com/techniq/layerchart/pull/496))

- fix(Text): Performance improvement by only determining word width if `width` prop defined (for word wrapping) ([#554](https://github.com/techniq/layerchart/pull/554))

- feat: Simplify daisyUI, shadcn-svelte, and Skeleton integrations with single line `@import 'layerchart/{library}.css'` added to `app.css` ([#557](https://github.com/techniq/layerchart/pull/557))

- fix(LinearGradient, RadialGradient): Register as `group` instead of `mark` in canvas component tree so wrapped children (e.g. Arc, Path) are rendered ([#449](https://github.com/techniq/layerchart/pull/449))

- feat: Add Ellipse primitive ([#533](https://github.com/techniq/layerchart/pull/533))

- fix(Spline): Pass `fillOpacity` prop (instead of `fill-opacity`) to support Canvas ([#449](https://github.com/techniq/layerchart/pull/449))