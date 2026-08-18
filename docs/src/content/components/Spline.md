---
description: Marking component which applies data points connected by smooth, curved lines to show trends or patterns over a continuous range.
category: marks
layers: [svg, canvas]
related: [Path, Trail, LineChart]
---

::tip
See also: [LineChart](/docs/components/LineChart) for simplified examples
::

## Usage

:example{ name="basic" showCode }

### Multiple lines (`z`)

Set `z` to draw a separate line per distinct value, all from one mark — the same channel Observable Plot and SveltePlot use for series.

```svelte
<Chart {data} x="date" y="value" c="fruit" {cRange}>
	<Spline stroke="fruit" />
</Chart>
```

Most of the time you don't set it at all: a `stroke` (or `fill`) that names a data property implies it, so the line above draws one line per fruit. `z` resolves in order — this mark's `z`, the Chart's `z`, then whatever `stroke` / `fill` names.

This replaces grouping the data yourself and rendering a `Spline` per group. Prefer it: every mark registers with the chart and rebuilds its domains, so a mark per line costs O(lines × rows) at mount — with a few hundred lines that's the difference between ~1.9s and under 100ms.

`z` keeps its scale, so the same field can group the lines _and_ encode them:

```svelte
<Chart {data} x="date" y="value" z="year" zDomain={[1940, 2024]} zRange={[0.1, 0.2]}>
	<Spline opacity={(d) => context.zScale(d.year)} />
</Chart>
```

Set it explicitly when the grouping isn't the color — [parallel coordinates](#parallel-coordinates) groups by row (`z="index"`) while coloring by species.

### Colors

`stroke` and `fill` accept a CSS color, or the name of a data property — which resolves through the chart's [`c` scale](/docs/guides/scales), like every other mark. With `z`, the color resolves per line.

```svelte
<Spline stroke="fruit" />
```

### Per-segment styling

Pass a function to `stroke`, `fill`, `opacity`, or `class` to style each segment independently. Consecutive data points with the same resolved value are grouped into separate path segments. This composes with `z` — each line is split into its own segments, so a function is the way to style a grouped `Spline` per line:

```svelte
<Spline z="year" class={(d) => (d.year === 2024 ? 'stroke-primary' : 'stroke-surface-content')} />
```

:example{ name="stroke-grouping" showCode }

### Geo mode

When inside a `GeoProjection` context, Spline automatically renders as a projected geographic path. The `x` and `y` accessors extract longitude/latitude from each data point, which are converted to a GeoJSON `LineString` and rendered via `geoPath(projection)` — providing geodesic interpolation (great circle arcs) and proper antimeridian wrapping.

:example{ name="geo-routes" showCode }

### Parallel coordinates

One line per row across an axis per dimension, from a single `Spline` grouped by `z`. Each dimension keeps its own domain — `Axis` takes a `scale` override, so the ticks read in real units — while positions are normalized to a shared `0–1` domain so every dimension can share the chart's `y` scale. `Group` places each axis at its point on the categorical `x` scale.

:example{ name="parallel-coordinates" showCode }

### Brushable parallel coordinates

A chart's `brush` prop owns one selection over the whole plot area. For several — one per axis here — place a [`Brush`](/docs/components/Brush) over each, a narrow strip of its own. Each owns its selection and takes only the drags that start inside its region: drag to select, drag the middle to move, drag an edge to resize, click to clear.

```svelte
<Brush bind:state={brushes[key]} axis="y" x={-12} width={24} />
```

`contains()` then filters the lines — a row is kept when every brushed dimension contains it, so brushing several intersects them.

:example{ name="parallel-coordinates-brush" showCode }

### Mixed dimension types

A dimension doesn't have to be numeric. Give each one the scale its own data calls for — a point scale over the distinct values of a categorical column, a linear scale over the extent of a quantitative one — and they still share the chart's `y`, since each normalizes to `0–1`.

Here `species` is an axis in its own right as well as the color, so brushing it narrows to those species and intersects with the numeric dimensions like any other.

:example{name="parallel-coordinates-mixed" showCode}

### Faceted parallel coordinates

A line crosses every dimension, so the dimensions can't be panels — but `fy` gives one plot per group, sharing the dimension scales so the panels stay comparable. The per-dimension axes repeat in each panel with `facetAll`, while the dimension names, being an axis over the shared `x`, draw above the top panel only.

:example{ name="parallel-coordinates-faceted" showCode }

### Playground

:example{ name="playground" }

<!-- ## Playground

:example{ name="playground" }

## Examples

### draw

:example{ name="draw" }

### tweened

:example{ name="tweened" }

### markers / arrows

:example{ name="markers-arrows" }

### basic start and end snippets

:example{ name="basic-start-and-end-snippets" }

### label using start/end snippets

:example{ name="label-using-start-end-snippets" }

### end snippet with draw

:example{ name="end-snippet-with-draw" }

### end slot with draw with value

:example{ name="end-slot-with-draw-with-value" }

- Because the draw transition and tweened store use different timers, there is no guarantee they will start at the same time -->
