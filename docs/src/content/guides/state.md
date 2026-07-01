---
title: Overview
category: state
order: 1
---

The `<Chart>` component creates a central `ChartState` object that manages everything needed to render and interact with a visualization — [data](/docs/guides/data), [scales](/docs/guides/scales), dimensions, accessors, and a set of optional sub-states for interactive features.

## What ChartState manages

### Data & accessors

`Chart` accepts a [data](/docs/guides/data) array and accessor props (`x`, `y`, `z`, `r`, `c`) that describe how to read values from each data item. Accessors can be strings (property names), functions, or arrays. The resolved accessor functions are available on the context:

```svelte
<Chart {data} x="date" y="value" r="size">
	{#snippet children({ context })}
		{#each data as d}
			<!-- context.x(d), context.y(d), context.r(d) -->
		{/each}
	{/snippet}
</Chart>
```

| Property   | Description                            |
| ---------- | -------------------------------------- |
| `data`     | Chart data array                       |
| `flatData` | Flattened data (for nested structures) |
| `x`        | X accessor function                    |
| `y`        | Y accessor function                    |
| `z`        | Z accessor function                    |
| `r`        | Radius accessor function               |
| `c`        | Color accessor function                |

See the [Data guide](/docs/guides/data) for formats, nesting, and per-series data.

### Scales

[Scales](/docs/guides/scales) map data values (the **domain**) to visual values (the **range** — pixels, colors, radii, etc.). `Chart` creates scales automatically from your data and accessors, or you can override domains and ranges explicitly:

```svelte
<Chart {data} x="date" y="value" yDomain={[0, null]} yRange={[height, 0]}>
```

Each scale is reactive — when data, dimensions, or domain/range props change, scales update and all dependent components re-render.

| Property  | Description                                       |
| --------- | ------------------------------------------------- |
| `xScale`  | Primary x-axis scale                              |
| `yScale`  | Primary y-axis scale                              |
| `zScale`  | Z-axis scale (e.g. color or size encoding)        |
| `rScale`  | Radius scale                                      |
| `cScale`  | Color scale                                       |
| `x1Scale` | Secondary x-axis (grouped bars)                   |
| `y1Scale` | Secondary y-axis                                  |
| `xGet`    | Shorthand: `(d) => xScale(x(d))` — data to pixels |
| `yGet`    | Shorthand: `(d) => yScale(y(d))` — data to pixels |

See the [Scales guide](/docs/guides/scales) for scale types, domain overrides, and custom ranges.

### Dimensions

`Chart` measures its container and computes inner dimensions after padding. These are used for scale ranges and are available on the context:

| Property          | Description                                       |
| ----------------- | ------------------------------------------------- |
| `width`           | Inner width (container minus left/right padding)  |
| `height`          | Inner height (container minus top/bottom padding) |
| `containerWidth`  | Full container width                              |
| `containerHeight` | Full container height                             |
| `padding`         | `{ top, right, bottom, left }` in pixels          |
| `aspectRatio`     | Container aspect ratio                            |

## Interactive sub-states

`ChartState` coordinates five optional sub-states for interactive features. Each is activated by passing its corresponding prop to `<Chart>` and has a dedicated guide:

| Sub-state     | Prop        | Context             | Guide                                            |
| ------------- | ----------- | ------------------- | ------------------------------------------------ |
| **Brush**     | `brush`     | `context.brush`     | [Brush (Selection)](/docs/guides/brush)          |
| **Geo**       | `geo`       | `context.geo`       | [Geo (Maps & Projections)](/docs/guides/geo)     |
| **Series**    | `series`    | `context.series`    | [Series (Multi-series)](/docs/guides/series)     |
| **Tooltip**   | `tooltip`   | `context.tooltip`   | [Tooltip (Hover Data)](/docs/guides/tooltip)     |
| **Transform** | `transform` | `context.transform` | [Transform (Pan & Zoom)](/docs/guides/transform) |

```svelte
<Chart
  {data}
  x="date"
  y="value"
  brush
  geo={{ projection: geoMercator, fitGeojson }}
  series={[{ key: 'apples' }, { key: 'bananas' }]}
  tooltip={{ mode: 'bisect-x' }}
  transform={{ mode: 'domain', axis: 'x' }}
>
```

### [Brush (Selection)](/docs/guides/brush)

Interactive drag-to-select regions for filtering, zooming, or syncing charts. Supports x-axis, y-axis, or 2D selection with configurable events and styling.

`context.brush` — `x`, `y`, `active`, `reset()`, `selectAll()`, `move()`

### [Geo (Maps & Projections)](/docs/guides/geo)

Geographic rendering with d3 projections, auto-fitting, and a suite of geo components (`GeoPath`, `GeoPoint`, `GeoTile`, `GeoCircle`, `GeoSpline`).

`context.geo` — `projection`, `fitSizeRange`, `chartWidth`, `chartHeight`

### [Series (Multi-series)](/docs/guides/series)

Render multiple data series with per-series colors, visibility toggling, stacking layouts, and legend integration.

`context.series` — `visibleSeries`, `selectedKeys`, `highlightKey`, `isVisible()`, `getStackValue()`

### [Tooltip (Hover Data)](/docs/guides/tooltip)

Show data on hover with automatic pointer tracking, bisect/voronoi/quadtree modes, and composable display components.

`context.tooltip` — `data`, `x`, `y`, `show()`, `hide()`

### [Transform (Pan & Zoom)](/docs/guides/transform)

Pan and zoom via domain narrowing, CSS/SVG transforms, or projection manipulation. Supports scroll zoom, drag pan, inertia, and constraints.

`context.transform` — `scale`, `translate`, `reset()`, `zoomIn()`, `zoomOut()`

## Accessing chart state

There are three ways to read the `ChartState`:

### Children snippet

```svelte
<Chart {data} x="date" y="value">
	{#snippet children({ context })}
		<!-- context.xScale, context.yScale, context.brush, etc. -->
	{/snippet}
</Chart>
```

### `getChartContext()` (custom components)

Use inside any component rendered within a `<Chart>`:

```svelte
<script lang="ts">
	import { getChartContext } from 'layerchart';
	const ctx = getChartContext();
	// ctx.xScale, ctx.yScale, ctx.brush, etc.
</script>
```

### `bind:context` (external access)

Access chart state from outside the `<Chart>` component tree:

```svelte
<script lang="ts">
	import { type ChartState } from 'layerchart';
	let context = $state<ChartState>(null!);
</script>

<Chart bind:context {data} x="date" y="value">
	<!-- ... -->
</Chart>

<!-- Use context.xScale, context.brush, etc. here -->
```

## Settings (global defaults)

Global settings control defaults across all charts in the component tree. Set them once at the top level:

```svelte
<script lang="ts">
	import { setSettings } from 'layerchart';

	setSettings({
		layer: 'svg', // default Layer type: 'svg' | 'canvas' | 'html'
		debug: false
	});
</script>
```

Read settings anywhere below:

```svelte
<script lang="ts">
	import { getSettings } from 'layerchart';
	const settings = getSettings();
</script>
```

See the [Layers guide](/docs/guides/layers) for details on SVG, Canvas, and HTML rendering.

## Layer context

Get the nearest `<Layer>` rendering type. Falls back to the settings default. Typically only needed in custom [primitive](/docs/guides/primitives) components:

```svelte
<script lang="ts">
	import { getLayerContext } from 'layerchart';
	const layerCtx = getLayerContext(); // 'svg' | 'canvas' | 'html'
</script>
```

See the [Layers guide](/docs/guides/layers) and [Primitives guide](/docs/guides/primitives) for more on multi-layer rendering.
