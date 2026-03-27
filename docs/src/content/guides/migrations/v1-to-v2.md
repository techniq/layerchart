---
title: 'v1 → v2'
category: migrations
order: 1
---

This guide covers migrating from LayerChart v1 (Svelte 4, Tailwind 3) to v2 (Svelte 5, Tailwind 4 (optional)). For changes specific to the `state-refactor` branch beyond `@next`, see the [state-refactor migration guide](/docs/guides/migrations/state-refactor).

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

| Component                                                                                                                                                           | Description                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`ArcChart`](/docs/components/ArcChart)                                                                                                                             | Simplified arc/donut chart                                              |
| [`Connector`](/docs/components/Connector)                                                                                                                           | Connection lines between elements                                       |
| [`Layer`](/docs/components/Layer)                                                                                                                                   | Easy switch between Svg, Canvas, and Html [layers](/docs/guides/layers) |
| [`Path`](/docs/components/Path)                                                                                                                                     | Low-level path primitive (extracted from Spline)                        |
| [`AnnotationLine`](/docs/components/AnnotationLine) / [`AnnotationPoint`](/docs/components/AnnotationPoint) / [`AnnotationRange`](/docs/components/AnnotationRange) | Annotation system                                                       |
| [`Ellipse`](/docs/components/Ellipse)                                                                                                                               | Ellipse primitive                                                       |
| [`Polygon`](/docs/components/Polygon)                                                                                                                               | Polygon primitive with custom shapes                                    |

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

### Canvas Improvements

- Reduced computed style lookups with memoization
- Hit canvas skipped when unneeded for better performance
- Rounded `Rect` via `rx`/`ry` in Canvas
- Dashed stroke support
- `style` attribute passthrough
- Default `lc-*` classes applied in Canvas (matching Svg)
- Disableable hit canvas (useful during animations)

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
- `Highlight`: Radial area support, `opacity` prop
- `LinearGradient`: Html context support
- `Circle` / `Rect`: `children` snippet for Html layers
- `Spline`: `value` in `startContent` / `endContent` snippets
- `FormatConfig` objects for custom formatting (ex. `format={{ type: 'day', options: { variant: 'long' } }}`)
- `PeriodTypeCode` strings for simplified date formatting (ex. `format="day"`)
- `applyLanes()` util for densely packing timelines

## Foundational Changes

### Svelte 5

LayerChart v2 requires **Svelte 5**. All components have been migrated to runes and snippets.

**Slots → Snippets:**

```diff
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

```diff
- <LineChart renderContext="canvas">
+ <LineChart layer="canvas">
```

### Axis

#### Position props require `$` prefix

```diff
- <Axis x="left">
+ <Axis x="$left">

- <Axis y="top">
+ <Axis y="$top">
```

### Bar

#### `bar` prop renamed to `data`

```diff
- <Bar {bar} />
+ <Bar {data} />
```

### Points

#### `links` prop removed

Use the new `Rule` component with x/y accessors instead:

```diff
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

```diff
- <Spline bind:splineRef />
+ <Spline bind:pathRef />
```

### Annotations

#### `labelOffset` split into `labelXOffset` / `labelYOffset`

```diff
- <AnnotationLine labelOffset={10} />
+ <AnnotationLine labelXOffset={10} labelYOffset={0} />

- <AnnotationPoint labelOffset={10} />
+ <AnnotationPoint labelXOffset={10} labelYOffset={0} />
```

### Legend

#### `classes.swatches` renamed to `classes.item`

```diff
- <Legend classes={{ swatches: 'gap-2' }} />
+ <Legend classes={{ item: 'gap-2' }} />
```

### Treemap

#### `selected` prop removed

The `selected` prop has been removed from Treemap.

### Blur

#### Children snippet props removed

```diff
- <Blur>{#snippet children({ ... })}{/snippet}</Blur>
+ <Blur>{#snippet children()}{/snippet}</Blur>
```

### `defaultChartPadding()` signature changed

```diff
- defaultChartPadding(axis, legend)
+ defaultChartPadding({ axis, legend })

// Now also supports explicit overrides:
+ defaultChartPadding({ left: 50 })
```

### Default tooltip modes changed

- `AreaChart`: `bisect-x` → `quadtree-x`
- `LineChart`: `bisect-x` → `quadtree-x`
- `ScatterChart`: `voronoi` → `quadtree`

These new defaults work with categorical data and don't require sorted data. See the [tooltip guide](/docs/guides/tooltip) for all available modes.

## Quick Reference — Find & Replace

| Before                      | After                          | Scope                |
| --------------------------- | ------------------------------ | -------------------- |
| `renderContext=`            | `layer=`                       | Simplified charts    |
| `<Axis x="left">`           | `<Axis x="$left">`             | Axis position        |
| `<Axis x="right">`          | `<Axis x="$right">`            | Axis position        |
| `<Axis y="top">`            | `<Axis y="$top">`              | Axis position        |
| `<Axis y="bottom">`         | `<Axis y="$bottom">`           | Axis position        |
| `bar={` / `{bar}`           | `data={` / `{data}`            | Bar component        |
| `splineRef`                 | `pathRef`                      | Spline bind          |
| `labelOffset=`              | `labelXOffset=`                | AnnotationLine/Point |
| `classes={{ swatches`       | `classes={{ item`              | Legend               |
| `<Points links`             | `<Points />` + `<Rule>`        | Points component     |
| `defaultChartPadding(a, b)` | `defaultChartPadding({ ... })` | Utility              |
