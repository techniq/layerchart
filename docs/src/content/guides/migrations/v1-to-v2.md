---
title: 'v1 → v2'
category: migrations
order: 1
---

This guide covers migrating from LayerChart v1 (Svelte 4, Tailwind 3) to v2 (Svelte 5, Tailwind 4 (optional)). If you are already on `@next` and only need changes since then, see the [state-refactor migration guide](/docs/guides/migrations/state-refactor).

## New Features

### CSS-Only Usage & Styling

LayerChart no longer requires Tailwind CSS. Components ship with their own default styles via Svelte `<style>` blocks, so they work out of the box with no CSS framework.

All component styles are designed for easy overriding:

- **CSS layers** — styles are wrapped in `@layer base { }`, so any user styles take precedence without needing `!important`
- **`:where()` selectors** — all component selectors use `:where(.lc-*)` for zero specificity, making them trivial to override
- **CSS variables** — components expose `--fill-color`, `--stroke-color`, and other variables for theming
- **`lc-*` class names** — every component has a targetable class (e.g. `.lc-rect`, `.lc-axis`, `.lc-spline`) for custom styling

For framework integrations, single-line imports are available:

```css
/* daisyUI v5 */
@import 'layerchart/daisyui-5.css';

/* shadcn-svelte v1 */
@import 'layerchart/shadcn-svelte.css';

/* Skeleton v3 */
@import 'layerchart/skeleton-3.css';
```

See the [styles guide](/docs/guides/styles) for details.

### New Components

| Component                                                                                                                                                          | Description                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`ArcChart`](/docs/components/ArcChart)                                                                                                                           | Simplified arc/donut chart                                              |
| [`Layer`](/docs/components/Layer)                                                                                                                                 | Easy switch between Svg, Canvas, and Html [layers](/docs/guides/layers) |
| [`Path`](/docs/components/Path)                                                                                                                                   | Low-level path primitive (extracted from Spline)                        |
| [`AnnotationLine`](/docs/components/AnnotationLine) / [`AnnotationPoint`](/docs/components/AnnotationPoint) / [`AnnotationRange`](/docs/components/AnnotationRange) | Annotation system                                                       |
| [`Ellipse`](/docs/components/Ellipse)                                                                                                                             | Ellipse primitive                                                       |
| [`Polygon`](/docs/components/Polygon)                                                                                                                             | Polygon primitive with custom shapes                                    |
| [`BoxPlot`](/docs/components/BoxPlot)                                                                                                                             | Box-and-whisker plot (quartiles, whiskers, outliers)                    |
| [`Violin`](/docs/components/Violin)                                                                                                                               | Violin plot (KDE density curve with optional box/median)                |
| [`Density`](/docs/components/Density)                                                                                                                             | 2D kernel density estimation contours from scatter data                |
| [`Contour`](/docs/components/Contour)                                                                                                                             | Isolines / filled contour bands from scalar fields                      |
| [`Raster`](/docs/components/Raster)                                                                                                                               | Pixel-based heatmap from grids, functions, or scatter data              |
| [`Cell`](/docs/components/Cell)                                                                                                                                   | Heatmap/matrix cells                                                    |
| [`Chord`](/docs/components/Chord) / [`Ribbon`](/docs/components/Ribbon)                                                                                           | Chord diagrams                                                          |
| [`Image`](/docs/components/Image)                                                                                                                                 | Image rendering in charts                                               |
| [`Vector`](/docs/components/Vector)                                                                                                                               | Vector / arrow mark                                                     |
| [`Trail`](/docs/components/Trail)                                                                                                                                 | Variable-width line                                                     |
| [`Dodge`](/docs/components/Dodge)                                                                                                                                 | Deterministic non-overlapping layout (beeswarm, labels)                 |
| [`Waffle`](/docs/components/Waffle)                                                                                                                               | Countable-cell (waffle) visualizations                                  |
| [`ArcLabel`](/docs/components/ArcLabel)                                                                                                                           | Text labels positioned along / around arc segments                      |
| [`CircleLegend`](/docs/components/CircleLegend)                                                                                                                   | Nested-circle legend for radius (`rScale`) values                       |
| [`GeoLegend`](/docs/components/GeoLegend)                                                                                                                         | Scale-bar legend showing real-world distance for a projection           |
| [`GeoRaster`](/docs/components/GeoRaster)                                                                                                                         | Reproject raster imagery onto any d3-geo projection                     |

### Annotation Integration

Annotations can now be passed directly to simplified charts:

```svelte
<LineChart annotations={[{ x: threshold, label: 'Target' }]} />
```

### BarChart Radial Support

`BarChart` now supports radial layout in both vertical and horizontal orientations.

### Rule as Data-Driven Mark

`Rule` now supports data-driven usage for candlestick, lollipop, and similar charts:

```svelte
<Rule y={['low', 'high']} />
```

### Arc Path Labels

`Arc` and `Text` support arc path labels with inner/outer/middle placement and smart flipping.

### Pattern Improvements

- Canvas support for patterns
- Simplified definitions via `lines`/`circles` props

### ForceSimulation Improvements

- Generic over nodes and links: `ForceSimulation<Node, Link>`
- Decoupled from `ChartContext` — takes nodes and links via `data` prop
- `onNodesChange` callback
- `links` exposed via `children` snippet

### Mark Registration & Implicit Series

Marks now register their data and accessors with the Chart automatically. No more manually passing all accessor arrays to `<Chart>`:

```svelte diff
- <Chart y={['apples', 'oranges']}>
-   <Spline y="apples" />
-   <Spline y="oranges" />
- </Chart>
+ <Chart>
+   <Spline y="apples" />
+   <Spline y="oranges" />
+ </Chart>
```

Implicit series are generated from mark registrations, enabling tooltip and legend support without explicit `series` definitions. See the [series guide](/docs/guides/series) and [state guide](/docs/guides/state).

### Data-Driven Primitives

Primitives (Circle, Ellipse, Group, Line, Polygon, Rect, Text) now accept string or function accessors for positional props to automatically resolve values through chart scales and iterate over data:

```svelte
<Circle x="date" y="value" r={5} />
<Rect x="category" y="amount" fill="group" />
```

Color properties (`fill`, `stroke`) can also be data-driven via the chart's color scale (`cScale`). See the [primitives guide](/docs/guides/primitives).

### Transform & Brush Enhancements

- Cartesian pan/zoom via `transform={{ mode: 'domain' }}` with single or both axis support
- `scrollActivationKey` — require modifier key for scroll zoom/pan
- Inertia (momentum) support for drag gestures
- Zoom/pan constraints (`scaleExtent`, `translateExtent`, `constrain`, `domainExtent`)
- Brush redesign with `BrushState` class for programmatic control (`move`, `selectAll`, `reset`)

See the [transform guide](/docs/guides/transform) and [brush guide](/docs/guides/brush).

### Chart Export Utilities

```ts
import { downloadImage, downloadSvg, getChartImageBlob, getChartSvgString } from 'layerchart';
```

For server-side rendering, `layerchart/server` exposes `renderChart()` to render a chart to a PNG/JPEG image:

```ts
import { renderChart } from 'layerchart/server';
```

### Geo Projection Support

- Primitives (Circle, Rect, etc.) support geo projection
- Spline supports geo projection for route paths
- `quadtree` tooltip mode for geo visualizations

See the [geo guide](/docs/guides/geo).

### Continuous Color Scales

`cScale` now supports sequential/diverging color scales (e.g. `scaleSequential(interpolateTurbo)`) without requiring `cRange`. See the [scales guide](/docs/guides/scales).

### Canvas Improvements

- Unified component tree with proper Group transform scoping
- `ClipPath` support in Canvas
- `strokeOpacity` on Path, Rect, and other primitives
- Rounded `Rect` via `rx`/`ry`
- Dashed stroke support
- Event handlers on `Group` components
- `style` attribute passthrough
- Default `lc-*` classes applied in Canvas (matching Svg)
- Disableable hit canvas (useful during animations)
- Reduced computed style lookups with memoization

### Global Settings

New `settings` context for configuring global defaults like default layer type and debug mode. See the [layers guide](/docs/guides/layers).

### Other Features

- `Chart`: `class` and `clip` props
- `Chart`: Explicit `width` / `height` instead of requiring parent dimensions
- `Chart`: Automatic scale detection based on data and domain values
- `Chart`: `xInterval` / `yInterval` for time scale bar charts
- `LineChart`: `orientation="vertical"` support
- `Axis`: Responsive tick counts via `tickSpacing`
- `Axis`: Multiline ticks for time intervals
- `Axis`: Time duration aware tick formatting
- `Axis`: `format` to filter ticks (integer and date/time)
- `Tooltip`: Standard CSS classes (non-tailwind) for root element
- `TooltipContext`: `quadtree-x` / `quadtree-y` modes, `band` mode with time scale
- `TooltipContext`: `quadtree` mode for geo visualizations
- `TooltipContext`: `touchEvents` control (defaults to `pan-y` for vertical scrolling with horizontal scrubbing)
- `Voronoi`: `r` prop for max radius clip path
- `Legend`: `selected` prop to fade unselected items
- `SeriesState`: `isHighlighted(seriesKey)` helper
- `Text`: Word wrapping with `\n`, `fill: currentColor` default
- `Highlight`: Radial area support, `opacity` prop, data-driven `r` prop
- `Bar`: Fixed `width` / `height` props to override scale-derived dimensions
- `Rect`: New edge-based props (`x0`/`x1`/`y0`/`y1`) and `insets` support
- `Chart`: [`motion`](/docs/guides/animation) prop to transition x/y scales using tween or spring
- `SeriesState`: Support `selected` as part of [series](/docs/guides/series) declaration
- `Labels`: `seriesKey` filter for multi-series charts
- Default chart padding applied when using `marks`/`grid`/`axis` snippets (see [structure guide](/docs/guides/structure))
- `LinearGradient`: Html context support
- `Circle` / `Rect`: `children` snippet for Html layers
- `Spline`: `value` in `startContent` / `endContent` snippets
- `FormatConfig` objects for custom formatting (ex. `format={{ type: 'day', options: { variant: 'long' } }}`)
- `PeriodTypeCode` strings for simplified date formatting (ex. `format="day"`)
- `applyLanes()` util for densely packing timelines

### Per-Layer Imports & `ChartCore`

Layer-agnostic components auto-detect the surrounding `<Svg>`, `<Canvas>`, or `<Html>` layer and bundle every render path. If you're committed to a single layer, new sub-path exports ship a smaller, layer-specific variant:

```ts
// Default: agnostic, dispatches at runtime — works in any layer
import { Rect, Circle, Text, LineChart } from 'layerchart';

// SVG-only — skips canvas + html branches
import { Rect, Circle, Text, LineChart } from 'layerchart/svg';

// Canvas-only / HTML-only
import { Rect, Circle, Text } from 'layerchart/canvas';
import { Rect, Circle, Text } from 'layerchart/html';
```

This is purely additive — existing `'layerchart'` imports are unchanged. A new `<ChartCore>` component (exported from each sub-path) provides the chart context, sizing, brush, transform, and tooltip plumbing without pulling in the `Layer`/`Axis`/`Grid`/`Rule`/`Highlight` chain — useful for geo maps and custom layouts (~34–39% smaller than `<Chart>`). See the [bundle size guide](/docs/guides/bundle-size).

## Foundational Changes

### Svelte 5

LayerChart v2 requires **Svelte 5**. All components have been migrated to runes and snippets.

**Slots → Snippets:**

```svelte diff
- <Chart let:width let:height>
-   <text>{width} x {height}</text>
- </Chart>

+ <Chart>
+   {#snippet children({ width, height })}
+     <text>{width} x {height}</text>
+   {/snippet}
+ </Chart>
```

**Stores → Runes:**

If you were accessing context stores (e.g. from `getChartContext()`), these are now rune-based state objects. Replace `$store` syntax with direct property access. See the [state guide](/docs/guides/state) for the new architecture.

### Tailwind CSS v4

LayerChart v2 targets **Tailwind CSS v4**. Tailwind is no longer required — see CSS-Only Usage above.

### LayerCake Removal

LayerCake is no longer a dependency. All chart context, scales, and layout are managed internally by LayerChart's own `ChartState`. If you were importing anything from LayerCake through LayerChart, use the LayerChart equivalents instead.

### Reduced Bundle Size

The documentation site has been extracted from `packages/layerchart/` into a standalone `docs/` workspace package, so docs-only dependencies no longer affect the library's install size or dependency tree.

The following transitive dependencies have also been removed:

- `lodash-es` — replaced with internal utilities
- `date-fns` — replaced with `d3-time`
- `culori` — removed
- `@layerstack/svelte-stores` — replaced with `@layerstack/svelte-state`

## Breaking Changes

### Simplified Charts

#### `renderContext` renamed to `layer`

```svelte diff
- <LineChart renderContext="canvas">
+ <LineChart layer="canvas">
```

#### `get*Props` helpers removed from `marks` / `axis` snippets

Simplified charts (`BarChart`, `LineChart`, `AreaChart`, `ScatterChart`) previously exposed helper functions like `getBarsProps()`, `getSplineProps()`, `getAreaProps()`, `getPointsProps()`, and `getAxisProps()` as parameters of the `marks` / `axis` snippets. These are gone — marks are now series-aware via `seriesKey` and resolve their own data, accessors, and styling from the chart context.

```svelte diff
- {#snippet marks({ visibleSeries, getBarsProps })}
-   {#each visibleSeries as s, i (s.key)}
-     <Bars {...getBarsProps(s, i)} />
-   {/each}
- {/snippet}
+ {#snippet marks({ context })}
+   {#each context.series.visibleSeries as s (s.key)}
+     <Bars seriesKey={s.key} {...s.props} />
+   {/each}
+ {/snippet}
```

The `axis` snippet no longer receives `getAxisProps` either — use `placement` directly (`<Axis placement="bottom" />`, `<Axis placement="left" />`). Per-series overrides move to the `props` field of [series definitions](/docs/guides/series).

> **Note:** chart-level `props` (e.g. `props={{ area: { curve: curveNatural } }}`) are **not** applied when you supply a custom `marks` snippet — move those onto the mark or into series `props`. Also, the `points` snippet only overrides point rendering, whereas `marks` replaces the entire chart (lines + points), so don't rename a `points` snippet to `marks`. See the [state-refactor guide](/docs/guides/migrations/state-refactor) for the full details.

### Axis

#### Position props require `$` prefix

```svelte diff
- <Axis x="left">
+ <Axis x="$left">

- <Axis y="top">
+ <Axis y="$top">
```

### Bar

#### `bar` prop renamed to `data`

```svelte diff
- <Bar {bar} />
+ <Bar {data} />
```

### Points

#### `links` prop removed

Use the new `Rule` component with x/y accessors instead:

```svelte diff
- <Points links />
+ <Points />
+ <Rule y={['start', 'end']} />
```

### Spline / Path

#### `Path` extracted as separate component

`Path` is now a standalone [primitive](/docs/guides/primitives) component, extracted from `Spline`. If you were using low-level path rendering, import `Path` directly:

```ts
import { Path } from 'layerchart';
```

#### `splineRef` renamed to `pathRef`

```svelte diff
- <Spline bind:splineRef />
+ <Spline bind:pathRef />
```

### Annotations

#### `labelOffset` split into `labelXOffset` / `labelYOffset`

```svelte diff
- <AnnotationLine labelOffset={10} />
+ <AnnotationLine labelXOffset={10} labelYOffset={0} />

- <AnnotationPoint labelOffset={10} />
+ <AnnotationPoint labelXOffset={10} labelYOffset={0} />
```

### Legend

#### `classes.swatches` renamed to `classes.item`

```svelte diff
- <Legend classes={{ swatches: 'gap-2' }} />
+ <Legend classes={{ item: 'gap-2' }} />
```

### Treemap

#### `selected` prop removed

The `selected` prop has been removed from Treemap.

### Blur

#### Children snippet props removed

```svelte diff
- <Blur>{#snippet children({ ... })}{/snippet}</Blur>
+ <Blur>{#snippet children()}{/snippet}</Blur>
```

### `defaultChartPadding()` signature changed

```svelte diff
- defaultChartPadding(axis, legend)
+ defaultChartPadding({ axis, legend })

// Now also supports explicit overrides:
+ defaultChartPadding({ left: 50 })
```

### Chart

#### `tooltip` prop renamed to `tooltipContext`

```svelte diff
- <Chart tooltip={{ mode: 'bisect-x' }}>
+ <Chart tooltipContext={{ mode: 'bisect-x' }}>
```

#### `isVertical` removed from ChartState, `valueAxis` added

`ChartState.isVertical` has been removed in favor of `ChartState.valueAxis`. Simplified charts still accept `orientation`.

```svelte diff
- if (ctx.isVertical) { ... }
+ if (ctx.valueAxis === 'y') { ... }
```

### GeoContext → GeoProjection

```svelte diff
- import { GeoContext } from 'layerchart';
+ import { GeoProjection } from 'layerchart';

- <GeoContext projection={geoAlbersUsa}>
+ <GeoProjection projection={geoAlbersUsa}>
```

### Tooltip prop on Arc, Pie, Calendar, GeoPath

Simplified from config object to boolean:

```svelte diff
- <Arc tooltipContext={{ mode: 'item' }} />
+ <Arc tooltip />
```

### Custom tooltips: data model changed

If you build custom tooltips that read from the tooltip context directly, the old recharts-style `payload` array has been replaced with `tooltip.data` (the raw hovered datum) and `tooltip.series` (the per-series entries) on the chart context:

```svelte diff
- import { getTooltipContext } from 'layerchart';
- const tooltipCtx = getTooltipContext()
+ import { getChartContext } from 'layerchart';
+ const ctx = getChartContext()

  // x-axis value (e.g. a Date)
- item.label
+ ctx.x(ctx.tooltip.data)

  // series name
- item.name
+ item.label

  // raw data object
- item.payload
+ ctx.tooltip.data

  // per-item color
- item.payload.color
+ item.config?.color

  // iterate over series
- tooltipCtx.payload
+ ctx.tooltip.series
```

### Brush API redesign

See the [brush guide](/docs/guides/brush) for the new `BrushState` API. Removed props: `mode`, `resetOnEnd`, `ignoreResetClick`, `onReset`.

### TransformContext

```svelte diff
- <TransformContext initialScrollMode="zoom">
+ <TransformContext scrollMode="zoom">

- <Chart transform={{ domainExtent: 'original' }}>
+ <Chart transform={{ domainExtent: 'data' }}>
```

### Context / State API

Standalone context getters removed — use `getChartContext()` instead:

```svelte diff
- import { getTooltipContext } from 'layerchart';
+ import { getChartContext } from 'layerchart';
+ const chart = getChartContext()
+ // chart.tooltip, chart.brushState, chart.transformState
```

Bind and property renames:

```svelte diff
- <BrushContext bind:brushContext>
+ <BrushContext bind:state>

- <TransformContext bind:transformContext>
+ <TransformContext bind:state>

- import { getRenderContext } from 'layerchart';
+ import { getLayerContext } from 'layerchart';
```

The `ChartContextValue` type has also been renamed to `ChartState`:

```svelte diff
- import { type ChartContextValue } from 'layerchart';
+ import { type ChartState } from 'layerchart';

- let context = $state<ChartContextValue>()
+ let context = $state<ChartState>()
```

See the [state guide](/docs/guides/state) for the new architecture.

### Style props now camelCase

Primitive and mark style props use camelCase names rather than the hyphenated SVG attribute names:

```svelte diff
- <Area fill-opacity={0.4} />
+ <Area fillOpacity={0.4} />
```

The same applies to `stroke-width` → `strokeWidth`, `stroke-opacity` → `strokeOpacity`, etc. (`class` and inline `style` are unaffected).

### Default tooltip modes changed

- `AreaChart`: `bisect-x` → `quadtree-x`
- `LineChart`: `bisect-x` → `quadtree-x`
- `ScatterChart`: `voronoi` → `quadtree`

These new defaults work with categorical data and don't require sorted data. See the [tooltip guide](/docs/guides/tooltip) for all available modes.

## Quick Reference — Find & Replace

| Before                      | After                              | Scope                    |
| --------------------------- | ---------------------------------- | ------------------------ |
| `GeoContext`                | `GeoProjection`                    | Component rename         |
| `renderContext=`            | `layer=`                           | Simplified charts        |
| `<Axis x="left">`           | `<Axis x="$left">`                 | Axis position            |
| `<Axis x="right">`          | `<Axis x="$right">`                | Axis position            |
| `<Axis y="top">`            | `<Axis y="$top">`                  | Axis position            |
| `<Axis y="bottom">`         | `<Axis y="$bottom">`               | Axis position            |
| `bar={` / `{bar}`           | `data={` / `{data}`                | Bar component            |
| `splineRef`                 | `pathRef`                          | Spline bind              |
| `labelOffset=`              | `labelXOffset=`                    | AnnotationLine/Point     |
| `classes={{ swatches`       | `classes={{ item`                  | Legend                   |
| `<Points links`             | `<Points />` + `<Rule>`            | Points component         |
| `defaultChartPadding(a, b)` | `defaultChartPadding({ ... })`     | Utility                  |
| `ctx.isVertical`            | `ctx.valueAxis === 'y'`            | ChartState property      |
| `<Chart tooltip=`           | `<Chart tooltipContext=`           | Chart prop only          |
| `tooltipContext`            | `tooltip`                          | Arc/Pie/Calendar/GeoPath |
| `initialScrollMode`         | `scrollMode`                       | TransformContext prop    |
| `domainExtent: 'original'`  | `domainExtent: 'data'`             | Transform config         |
| `getTooltipContext`         | `getChartContext().tooltip`        | Context API              |
| `getBrushContext`           | `getChartContext().brushState`     | Context API              |
| `getTransformContext`       | `getChartContext().transformState` | Context API              |
| `getRenderContext`          | `getLayerContext`                  | Context API              |
| `bind:brushContext`         | `bind:state`                       | BrushContext             |
| `bind:transformContext`     | `bind:state`                       | TransformContext         |
| `brushContext`              | `brushState`                       | ChartState property      |
| `transformContext`          | `transformState`                   | ChartState property      |
| `supportedContexts`         | `layers`                           | Component prop           |
| `resetOnEnd`                | `e.brush.reset()` in onBrushEnd    | Brush                    |
| `ignoreResetClick`          | `clickToReset`                     | Brush                    |
| `onReset`                   | check `brush.active` in onBrushEnd | Brush                    |
| `get*Props(s, i)`           | `seriesKey={s.key}`                | Simplified chart marks   |
| `getAxisProps('x')`         | `<Axis placement="bottom" />`      | Simplified chart axis    |
| `ChartContextValue`         | `ChartState`                       | TypeScript type          |
| `fill-opacity`              | `fillOpacity`                      | Primitive/mark prop      |
| `item.payload`              | `ctx.tooltip.data`                 | Custom tooltip           |
| `tooltipCtx.payload`        | `ctx.tooltip.series`               | Custom tooltip           |
| `Connector`                 | `Link`                             | Component merged         |
