---
title: '@next → state-refactor'
category: migrations
order: 2
---

This guide covers changes introduced on the `state-refactor` branch beyond what was already in `@next`. If you are migrating from v1 (stable), see the [v1 → v2 migration guide](/docs/guides/migrations/v1-to-v2) for earlier breaking changes (Svelte 5, Tailwind 4, LayerCake removal, etc.).

## New Features

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

Marks are also **series-aware** via the `seriesKey` prop. When provided, a mark automatically resolves its data, accessors, stack offsets, and color from the matching series definition — no manual wiring required:

```svelte
{#each context.series.visibleSeries as s (s.key)}
	<Spline seriesKey={s.key} />
{/each}
```

Simplified charts (`LineChart`, `BarChart`, etc.) handle this internally, iterating over visible series and passing `seriesKey` to each mark.

Implicit series are generated from mark registrations, enabling tooltip and legend support without explicit `series` definitions. See the [series guide](/docs/guides/series) and [state guide](/docs/guides/state) for more details.

### Data-Driven Primitives

Primitives (Circle, Ellipse, Group, Line, Polygon, Rect, Text) now accept string or function accessors for positional props to automatically resolve values through chart scales and iterate over data. Components also accept an optional `data` prop to override chart context data.

```svelte
<Circle x="date" y="value" r={5} />
<Rect x="category" y="amount" fill="group" />
```

Color properties (`fill`, `stroke`) can also be data-driven, resolving per-item through the chart's color scale (`cScale`). See the [primitives guide](/docs/guides/primitives) for usage details.

### Canvas Layer Improvements

Canvas rendering received significant fixes and new capabilities. See the [layers guide](/docs/guides/layers) for more on Svg, Canvas, and Html rendering.

**Unified component tree:** Canvas rendering now uses a unified component tree with proper `save()`/`restore()` scoping, fixing Group transforms (translate, opacity) leaking to sibling components.

**Newly supported in Canvas layers:**

- `ClipPath` — now works with Canvas contexts
- `strokeOpacity` — supported on Path, Rect, and other primitives
- Dashed strokes
- Rounded `Rect` via `rx`/`ry`
- Event handlers on `Group` components
- `style` attribute passthrough

**Performance:** Reduced computed style lookups with memoization, skip unnecessary hit canvas work when unneeded.

### New Components

| Component                                                               | Description                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`BoxPlot`](/docs/components/BoxPlot)                                   | Box-and-whisker plot (quartiles, whiskers, outliers)       |
| [`Violin`](/docs/components/Violin)                                     | Violin plot (KDE density curve with optional box/median)   |
| [`Density`](/docs/components/Density)                                   | 2D kernel density estimation contours from scatter data    |
| [`Contour`](/docs/components/Contour)                                   | Isolines/filled contour bands from scalar fields           |
| [`Raster`](/docs/components/Raster)                                     | Pixel-based heatmap from grids, functions, or scatter data |
| [`Cell`](/docs/components/Cell)                                         | Heatmap/matrix cells                                       |
| [`Chord`](/docs/components/Chord) / [`Ribbon`](/docs/components/Ribbon) | Chord diagrams                                             |
| [`Image`](/docs/components/Image)                                       | Image rendering in charts                                  |
| [`Vector`](/docs/components/Vector)                                     | Vector/arrow mark                                          |

New utility functions [`computeBoxStats`](/docs/utils/stats) and [`kde`](/docs/utils/stats) for computing box plot statistics and kernel density estimation. New [`interpolateGrid`](/docs/utils/rasterInterpolate) utility for spatial interpolation of scattered data onto regular grids (none, nearest, barycentric methods).

### Chart Export Utilities

New utilities to export charts as PNG/JPEG/WebP images or SVG files:

```ts
import { downloadImage, downloadSvg, getChartImageBlob, getChartSvgString } from 'layerchart';
```

### Transform Enhancements

- Cartesian pan/zoom via `transform={{ mode: 'domain' }}` with single or both axis support
- `scrollActivationKey` — require modifier key (meta, alt, control, shift) for scroll zoom/pan
- Inertia (momentum) support for drag gestures
- Zoom/pan constraints (`scaleExtent`, `translateExtent`, `constrain`, `domainExtent`)

See the [transform guide](/docs/guides/transform) for examples.

### Brush Redesign

The brush system has been rebuilt around a new `BrushState` class with programmatic control:

- `BrushState.move({ x?, y? })` — programmatic selection control
- `BrushState.selectAll()` — select full domain extent
- `BrushState.reset()` — clear selection
- `clickToReset` prop (default `true`)
- `zoomOnBrush` prop on simplified charts

See the [brush guide](/docs/guides/brush) for the full API.

### Geo Projection Support

- Primitives (Circle, Rect, etc.) now support geo projection
- Spline supports geo projection for route paths

See the [geo guide](/docs/guides/geo) for examples.

### Continuous Color Scales

`cScale` now supports sequential/diverging color scales (e.g. `scaleSequential(interpolateTurbo)`) without requiring `cRange`. Numeric `cDomain` values are auto-detected to use `extent` for continuous `[min, max]` domains. See the [scales guide](/docs/guides/scales) for details.

### Other Notable Features

- `SeriesState`: Support `selected` as part of [series](/docs/guides/series) declaration
- `Labels`: `seriesKey` filter for multi-series charts
- `Highlight`: Data-driven `r` prop for scaled highlight points
- `Bar`: Auto-computes mount animation initial values from chart scales when `motion` is set — no more hardcoding `initialY`/`initialHeight`. Per-property motion configs can also be a flat object:

  ```svelte diff
    bars: {
  -   initialY: context?.height,
  -   initialHeight: 0,
  -   motion: {
  -     y: { type: 'tween', duration: 500, easing: cubicInOut },
  -     height: { type: 'tween', duration: 500, easing: cubicInOut },
  -   },
  +   motion: { type: 'tween', duration: 500, easing: cubicInOut },
    },
  ```

- `Path`: Fixed `flattenPathData` to handle relative arc commands, fixing rounded bar mount animations starting below the baseline
- `Bar`: Fixed `width` / `height` props to override scale-derived dimensions
- `Rect`: New edge-based props (`x0`/`x1`/`y0`/`y1`) and `insets` support
- `Chart`: [`motion`](/docs/guides/animation) prop to transition x/y scales using tween or spring
- Default chart padding applied when using `marks`/`grid`/`axis` snippets (see [structure guide](/docs/guides/structure))

### New & Updated Examples

Over 100 new examples have been added across the docs. Here are some highlights:

**Pan/Zoom & Transform:**

- [Pan/zoom with overview](/docs/components/LineChart/pan-zoom-with-overview) — brush + transform working together across two synchronized charts
- [Zoomable bubble chart](/docs/components/ScatterChart/zoomable-bubble) — ScatterChart with zoom support
- [BarChart pan/zoom](/docs/components/BarChart/pan-zoom) — cartesian domain pan/zoom on bar charts
- [Pan/zoom with dynamic data](/docs/components/LineChart/pan-zoom-dynamic-data) — streaming data with constrained viewport
- [Globe with inertia](/docs/components/GeoPath/transform-globe-inertia) — drag with momentum on an animated globe
- [Planet distances](/docs/components/TransformContext/planet-distances) — interactive solar system scale explorer
- [World map transform](/docs/components/GeoPath/transform-world-projection) — click-to-zoom world map (canvas & projection modes)

**Geo & Maps:**

- [Satellite projection](/docs/components/GeoProjection/satellite) — tilted satellite view
- [College football map](/docs/components/Image/college-football-map) — geo-positioned images
- [Geo route paths](/docs/components/Spline/geo-routes) — Spline with geo projection for flight/route paths
- [Election wind map](/docs/components/Vector/election-wind-map) — vector field visualization

**Statistical & Scientific Visualization:**

- [BoxPlot](/docs/components/BoxPlot/basic) with [horizontal](/docs/components/BoxPlot/horizontal), [tooltip](/docs/components/BoxPlot/with-tooltip), and [violin overlay](/docs/components/BoxPlot/with-violin)
- [Violin](/docs/components/Violin/basic) with [box/median](/docs/components/Violin/with-box-median) and [bandwidth](/docs/components/Violin/bandwidth)
- [Density](/docs/components/Density/basic) with [bandwidth slider](/docs/components/Density/bandwidth), [thresholds slider](/docs/components/Density/thresholds), and [Walmart store density map](/docs/components/Density/walmart)
- [Contour](/docs/components/Contour/volcano-lines) with [volcano filled](/docs/components/Contour/volcano-filled), [sampled function](/docs/components/Contour/sampled), and [interactive controls](/docs/components/Contour/volcano-filled-interactive)
- [Raster](/docs/components/Raster/volcano) with [Mandelbrot fractal](/docs/components/Raster/mandelbrot), [contour overlay](/docs/components/Raster/with-contour-overlay), and [math functions](/docs/components/Raster/math-functions)

**New Component Examples:**

- [Cell heatmap](/docs/components/Cell/basic), [punchcard](/docs/components/Cell/punchcard), [color scale](/docs/components/Cell/color-scale)
- [Chord diagrams](/docs/components/Chord/basic) with [hover](/docs/components/Chord/hover), [gradient](/docs/components/Chord/gradient), and [ticks](/docs/components/Chord/ticks)
- [Image](/docs/components/Image/pixel-mode) with [country flags](/docs/components/Image/country-flags), [US presidents](/docs/components/Image/us-presidents), and [sports logos](/docs/components/Image/sports-logos)
- [Vector](/docs/components/Vector/basic) with [shapes](/docs/components/Vector/shapes), [wind map](/docs/components/Vector/wind-map), and [anchoring](/docs/components/Vector/anchor)

**Data-Driven Primitives:**

- Data mode examples for [Circle](/docs/components/Circle/data-mode), [Rect](/docs/components/Rect/data-mode-edge), [Text](/docs/components/Text/data-mode), [Line](/docs/components/Line/data-mode), [Ellipse](/docs/components/Ellipse/data-mode), [Polygon](/docs/components/Polygon/data-mode), and [Group](/docs/components/Group/data-mode)
- Color scale examples ([ordinal](/docs/components/Circle/color-via-ordinal-scale), [threshold](/docs/components/Circle/color-via-threshold-scale)) for each primitive

**Charts & Series:**

- [Ridgeline](/docs/components/Area/ridgeline) and [ridgeline KDE](/docs/components/Area/ridgeline-kde) charts
- [Oscilloscope ridgeline](/docs/components/Area/oscilloscope-ridgeline)
- [Series with separate data](/docs/components/BarChart/series-stack-separate-data) per series
- [Programmatic series control](/docs/components/LineChart/series-programmatic-control)
- [Brush programmatic control](/docs/components/BrushContext/programmatic-control)

Browse the full [examples gallery](/docs/examples) for more.

## Breaking Changes

### Chart

#### `tooltip` prop renamed to `tooltipContext`

The `tooltip` prop on `<Chart>` has been renamed to `tooltipContext` to avoid conflict with the new `tooltip` snippet. This also applies when **disabling** tooltips on simplified charts. See the [tooltip guide](/docs/guides/tooltip) for updated usage.

```svelte diff
- <Chart tooltip={{ mode: 'bisect-x' }}>
+ <Chart tooltipContext={{ mode: 'bisect-x' }}>

- <BarChart tooltip={false} />
+ <BarChart tooltipContext={false} />
```

#### `isVertical` removed from ChartState, `valueAxis` added to Chart

`ChartState.isVertical` has been removed in favor of `ChartState.valueAxis` (`'x'` | `'y'`), which explicitly defines which axis represents the value (dependent variable).

Simplified charts (`BarChart`, `LineChart`, etc.) **still accept `orientation`** as before — each chart maps it to the correct `valueAxis` internally. The `<Chart>` component uses `valueAxis` directly, since `orientation` is ambiguous at that level (a "vertical" BarChart has `valueAxis="y"`, while a "vertical" LineChart has `valueAxis="x"`).

When `valueAxis` is not explicitly set, it is now inferred from the scale types: if `yScale` is a band scale, `valueAxis` defaults to `'x'`; if `xScale` is a band scale, it defaults to `'y'`; otherwise `'y'`.

When accessing chart state programmatically:

```svelte diff
- if (ctx.isVertical) { ... }
+ if (ctx.valueAxis === 'y') { ... }
```

When using `<Chart>` directly (not simplified charts):

```svelte diff
- <Chart ...>
+ <Chart valueAxis="x" ...>
```

### GeoContext → GeoProjection

The component has been renamed. See the [geo guide](/docs/guides/geo) for updated examples.

```svelte diff
- import { GeoContext } from 'layerchart'
+ import { GeoProjection } from 'layerchart'

- <GeoContext projection={geoAlbersUsa}>
+ <GeoProjection projection={geoAlbersUsa}>
```

#### Tooltip data model changed

The old `payload` array (from recharts-style APIs) has been replaced with `tooltip.series` and `tooltip.data` on the chart context. If you are building custom tooltips that read from the tooltip context directly:

```svelte diff
- import { getTooltipContext } from 'layerchart'
- const tooltipCtx = getTooltipContext()
+ import { getChartContext } from 'layerchart'
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

### Tooltip prop on Arc, Pie, Calendar, GeoPath

These components simplified the tooltip prop from a config object to a boolean. See the [tooltip guide](/docs/guides/tooltip) for details.

```svelte diff
- <Arc tooltipContext={{ mode: 'item' }} />
+ <Arc tooltip />

- <GeoPath tooltipContext />
+ <GeoPath tooltip />
```

### Brush prop changes

The following props have been removed or replaced. See the [brush guide](/docs/guides/brush) for the new API.

| Removed                              | Replacement                                               |
| ------------------------------------ | --------------------------------------------------------- |
| `mode` ('integrated' \| 'separated') | Sync behavior driven by presence of `x`/`y` props         |
| `resetOnEnd`                         | Call `e.brush.reset()` in `onBrushEnd` handler            |
| `ignoreResetClick`                   | `clickToReset` (default `true`)                           |
| `onReset` event                      | Check `brush.active === false` in `onBrushEnd`/`onChange` |

### TransformContext

See the [transform guide](/docs/guides/transform) for updated examples.

#### `initialScrollMode` renamed to `scrollMode` (reactive)

```svelte diff
- <TransformContext initialScrollMode="zoom">
+ <TransformContext scrollMode="zoom">
```

#### `domainExtent: 'original'` renamed to `'data'`

```svelte diff
- <Chart transform={{ domainExtent: 'original' }}>
+ <Chart transform={{ domainExtent: 'data' }}>
```

### Simplified Chart `get*Props` helpers removed

Simplified charts (`BarChart`, `LineChart`, `AreaChart`, `ScatterChart`) previously exposed helper functions like `getBarsProps()`, `getSplineProps()`, `getAreaProps()`, `getPointsProps()`, etc. as parameters in the `marks` snippet. These have been removed — marks are now series-aware via `seriesKey` and resolve their own data, accessors, and styling from the chart context.

If you were using `get*Props` helpers in a custom `marks` snippet, pass `seriesKey` directly to the mark instead:

```svelte diff
- {#snippet marks({ visibleSeries, getBarsProps })}
-   {#each visibleSeries as s, i (s.key)}
-     <Bars {...getBarsProps(s, i)} />
-   {/each}
- {/snippet}

+ {#snippet marks({ context })}
+   {#each context.series.visibleSeries as s, i (s.key)}
+     <Bars seriesKey={s.key} />
+   {/each}
+ {/snippet}
```

Similarly, the `axis` snippet no longer receives a `getAxisProps` helper:

```svelte diff
- {#snippet axis({ getAxisProps })}
-   <Axis {...getAxisProps('x')} />
-   <Axis {...getAxisProps('y')} />
+ {#snippet axis({ context })}
+   <Axis placement="bottom" />
+   <Axis placement="left" />
  {/snippet}
```

Per-series overrides can be passed via the `props` field in [series definitions](/docs/guides/series), which get spread onto the mark automatically.

> **Note:** Chart-level `props` (e.g. `props={{ area: { curve: curveNatural } }}`) are **not** applied when you supply a custom `marks` snippet. Move those props directly onto the mark component or pass them through series `props`:
>
> ```svelte diff
>   <AreaChart
> -   props={{ area: { curve: curveNatural, fillOpacity: 0.4 } }}
>   >
> -   {#snippet marks({ series, getAreaProps })}
> -     {#each series as s, i (s.key)}
> -       <Area {...getAreaProps(s, i)} fill="url(#grad)" />
> +   {#snippet marks({ context })}
> +     {#each context.series.visibleSeries as s (s.key)}
> +       <Area seriesKey={s.key} curve={curveNatural} fillOpacity={0.4} {...s.props} fill="url(#grad)" />
>       {/each}
>     {/snippet}
>   </AreaChart>
> ```

The `points` snippet on `LineChart` only overrides point rendering; the `marks` snippet replaces the **entire** chart (lines + points). Do not rename a `points` snippet to `marks`:

```svelte diff
  <LineChart>
-   {#snippet points({ visibleSeries, getPointsProps })}
-     {#each visibleSeries as s, i (s.key)}
-       <Points {...getPointsProps(s, i)}>
+   {#snippet points({ context })}
+     {#each context.series.visibleSeries as s (s.key)}
+       <Points seriesKey={s.key} {...s.props}>
          ...
        </Points>
      {/each}
    {/snippet}
  </LineChart>
```

### Context / State API

The context system has been consolidated. See the [state guide](/docs/guides/state) for the new architecture.

#### Context getters/setters removed

Standalone context functions have been removed in favor of the unified `getChartContext()`:

```svelte diff
- import { getTooltipContext } from 'layerchart'
- const tooltip = getTooltipContext()
+ import { getChartContext } from 'layerchart'
+ const chart = getChartContext()
+ // chart.tooltip, chart.brushState, chart.transformState
```

Removed functions:

- `getTooltipContext()` / `setTooltipContext()`
- `getBrushContext()` / `setBrushContext()`
- `getTransformContext()` / `setTransformContext()`

#### `ChartContextValue` type renamed to `ChartState`

```svelte diff
- import { type ChartContextValue } from 'layerchart'
+ import { type ChartState } from 'layerchart'

- let context = $state<ChartContextValue>()
+ let context = $state<ChartState>()
```

#### Bind renames

```svelte diff
- <BrushContext bind:brushContext>
+ <BrushContext bind:state>

- <TransformContext bind:transformContext>
+ <TransformContext bind:state>
```

ChartState properties:

```svelte diff
- chartCtx.brushContext
+ chartCtx.brushState

- chartCtx.transformContext
+ chartCtx.transformState
```

#### Render context → Layer context

See the [layers guide](/docs/guides/layers) for the updated API.

```svelte diff
- import { getRenderContext } from 'layerchart'
+ import { getLayerContext } from 'layerchart'

// Component prop rename:
- supportedContexts={['svg', 'canvas']}
+ layers={['svg', 'canvas']}
```

## Quick Reference — Find & Replace

| Before                     | After                              | Scope                    |
| -------------------------- | ---------------------------------- | ------------------------ |
| `GeoContext`               | `GeoProjection`                    | Component rename         |
| `initialScrollMode`        | `scrollMode`                       | TransformContext prop    |
| `domainExtent: 'original'` | `domainExtent: 'data'`             | Transform config         |
| `ctx.isVertical`           | `ctx.valueAxis === 'y'`            | ChartState property      |
| `<Chart tooltip=`          | `<Chart tooltipContext=`           | Chart prop only          |
| `tooltipContext`           | `tooltip`                          | Arc/Pie/Calendar/GeoPath |
| `getTooltipContext`        | `getChartContext().tooltip`        | Context API              |
| `getBrushContext`          | `getChartContext().brushState`     | Context API              |
| `getTransformContext`      | `getChartContext().transformState` | Context API              |
| `getRenderContext`         | `getLayerContext`                  | Context API              |
| `bind:brushContext`        | `bind:state`                       | BrushContext             |
| `bind:transformContext`    | `bind:state`                       | TransformContext         |
| `brushContext`             | `brushState`                       | ChartState property      |
| `transformContext`         | `transformState`                   | ChartState property      |
| `supportedContexts`        | `layers`                           | Component prop           |
| `resetOnEnd`               | `e.brush.reset()` in onBrushEnd    | Brush                    |
| `ignoreResetClick`         | `clickToReset`                     | Brush                    |
| `onReset`                  | check `brush.active` in onBrushEnd | Brush                    |
| `get*Props(s, i)`          | `seriesKey={s.key}`                | Simplified chart marks   |
| `ChartContextValue`        | `ChartState`                       | TypeScript type          |
| `fill-opacity`             | `fillOpacity`                      | Primitive/mark prop      |
