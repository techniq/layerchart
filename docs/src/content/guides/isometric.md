---
title: Isometric (Faux 3D)
category: state
---

`isometric` draws a chart's plot area as a floor seen from above at an angle. Works in any layer type (`Svg`, `Canvas`, `Html`) and marks (ex. `Axis`, `Rect`, etc).

## Quick start

Import `isometric` and pass as `view` to `Chart`.

```svelte
<script>
	import { Axis, Cell, Chart, Layer, isometric } from 'layerchart';
</script>

<Chart {data} x="week" y="day" xScale={scaleBand()} yScale={scaleBand()} c="value" view={isometric}>
	<Layer>
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Cell x="week" y="day" fill="value" />
	</Layer>
</Chart>
```

:example{ component="Chart" name="isometric-heatmap" }

To try it on every chart at once, set it as the `view` setting. Charts that set their own `view` (including `null`) keep it. LayerChart docs support this and exposed via the **Isometric** switch in a component page's settings menu.

```svelte
<script>
	import { isometric, setSettings } from 'layerchart';
	setSettings({ view: isometric });
</script>
```

## How it works

The scales, marks, and axes lay out on a flat **floor**, exactly as they would on a flat chart. Each layer then draws the floor turned and tipped away from the viewer, centered in the chart. A cell becomes a diamond, a circle an ellipse, and an axis runs along the floor's edge.

The floor keeps its own proportions, so resizing the chart scales it rather than stretching it. Text and strokes stay their natural size. It's a parallel projection: the far side of the floor is the same size as the near side.

## The view

Call `isometric` with options to change the view:

| Option   | What it does                                                                      | Default                    |
| -------- | --------------------------------------------------------------------------------- | -------------------------- |
| `rotate` | Turns the floor about its center, clockwise, in degrees                           | `-45`                      |
| `tilt`   | Tips it away from the viewer, from `0` (seen from directly above) towards edge on | `54.7356` (true isometric) |
| `aspect` | The floor's width over its depth, or `'auto'` to take it from the data            | `'auto'`                   |
| `motion` | Eases the view to new `rotate` / `tilt` values ([below](#animating-the-view))     |                            |

The defaults are true isometric: the origin sits at the front corner, and both axes meet the horizontal at 30°.

```svelte
<!-- True isometric -->
<Chart view={isometric}>

<!-- 2:1 "pixel art" projection -->
<Chart view={isometric({ tilt: 60 })}>

<!-- Origin at the left corner instead -->
<Chart view={isometric({ rotate: 45 })}>

<!-- A floor twice as wide as it is deep -->
<Chart view={isometric({ aspect: 2 })}>
```

`aspect: 'auto'` picks the floor's proportions from the scales:

- **Two band scales:** columns over rows, so every cell is square. A 20-week calendar is a floor 20 cells by 7.
- **Two continuous scales:** the domains' spans, so a unit runs as far across the floor as into it. If one span is more than four times the other, the floor is square instead.
- **Anything else:** square.

A `radial` chart's floor is always square.

### Animating the view

`motion` eases the view to new `rotate` / `tilt` values instead of jumping. `rotate: 0, tilt: 0` shows the floor from directly above, so toggling between that and the tilted view animates smoothly:

```svelte
<script>
	let flat = $state(false);
</script>

<Chart
	view={isometric({
		rotate: flat ? 0 : -45,
		tilt: flat ? 0 : 54.7356,
		motion: { type: 'tween', duration: 800 }
	})}
>
```

Any `motion` works. A `'spring'` suits values that change continuously, like a slider.

### Dragging the view

With a `transform`, an isometric chart can pan and zoom, and it can also turn: drag across to rotate it, up and down to tilt it. `drag` picks what a plain drag does. Holding `dragSwitchKey` (`shift` by default) as the drag starts does the other.

```svelte
<!-- Drag to pan, shift-drag to turn -->
<Chart view={isometric} transform={{ mode: 'canvas', scrollMode: 'scale' }}>

<!-- Drag to turn, shift-drag to pan -->
<Chart view={isometric} transform={{ mode: 'canvas', drag: 'rotate' }}>
```

The view starts at its `rotate` and `tilt`, and moves to new values when they change. `onTransform` reports the current angles as `rotation` (`x` is the turn, `y` the tilt, in degrees). `reset()` restores them along with the pan and zoom. `transform.drag` is reactive, so a control can switch it. `TransformContextControls` has one built in.

In the playground below, the sliders and dragging set the same angles.

:example{ component="Chart" name="isometric-playground" }

`mode: 'domain'` works too: panning and zooming change the domains rather than the drawing, so the axes re-tick and marks keep their size. Wrap the marks in `ChartClipPath` to clip them to the floor as they pan past its edge. Switch modes below to compare.

:example{ component="Chart" name="isometric-pan-zoom" }

## Height

`z` raises marks off the floor. Set it on the chart and every `Rect` and `Cell` stands up into a box that tall, with the sides facing the viewer shaded:

```svelte
<Chart {data} x="week" y="day" xScale={scaleBand()} yScale={scaleBand()} z="value" view={isometric}>
	<Layer>
		<Cell x="week" y="day" fill="value" />
	</Layer>
</Chart>
```

:example{ component="Chart" name="isometric-columns" }

- **The `z` scale** measures up from the floor. Its domain includes `0`, and its range defaults to half the floor's shorter side. Set `zDomain` / `zRange` to change them. The chart leaves room above the floor for the top of the range.
- **A mark's own `z`** overrides the chart's. A value of `[start, end]` floats the box between the two heights.
- **A `Rect` placed in pixels** takes a pixel height: `<Rect x={0} y={0} width={100} height={60} z={40} />`.
- **`shade={false}`** draws the sides in the same color as the top.
- **Nearer boxes draw over farther ones.**
- **On a flat chart**, or in a layer with `ignoreTransform`, `z` has no effect.

### 3D scatter

`Circle` floats each point at its `z`. Add `viewport` to keep it round instead of lying flat as an ellipse. To frame the points:

- `Frame` stands walls up the floor's two far edges, as tall as the `z` range.
- `Grid z` draws gridlines on the walls.
- `Axis placement="back"` runs a height axis up the back corner.

```svelte
<Chart {data} x="x" y="y" z="z" view={isometric} transform={{ mode: 'canvas', drag: 'rotate' }}>
	<Layer>
		<Frame />
		<Grid x y z />
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Axis placement="back" />
		<Circle cx="x" cy="y" r={6} viewport />
	</Layer>
</Chart>
```

A `zRange` as tall as the floor is deep makes a cube: `zRange={({ height }) => [0, height]}`.

:example{ component="Chart" name="isometric-scatter-3d" }

`quadtree` tooltips find each point where it floats, and `Highlight` follows the hovered point. Its `lines` trace the point on the floor and on each wall, and `shadows` marks where those lines cross.

```svelte
<Highlight lines shadows axis="both" />
<Highlight points={{ fill: 'none', stroke: 'currentColor' }} />
```

### Treemap

Floating each node's `Rect` one step above its parent makes a 3D treemap. Use `zScale` to measure the steps: a `zDomain` with one step per level, and a `zRange` for the total height.

```svelte
<Chart zDomain={[0, root.height + 1]} zRange={[0, 30]} view={isometric}>
	{#snippet children({ context })}
		<Layer>
			<Treemap hierarchy={root} paddingOuter={4}>
				{#snippet children({ nodes })}
					{#each nodes as node}
						<Rect
							x={node.x0}
							y={node.y0}
							width={node.x1 - node.x0}
							height={node.y1 - node.y0}
							z={[context.zScale(node.depth), context.zScale(node.depth + 1)]}
						/>
					{/each}
				{/snippet}
			</Treemap>
		</Layer>
	{/snippet}
</Chart>
```

On an isometric chart, `Treemap` passes `nodes` in drawing order, so nearer tiers cover farther ones. Leave the `{#each}` unkeyed: the order changes as the view turns, and a `Canvas` layer draws in the order its marks mounted.

To label a node on its top, draw a `Text` right after its `Rect`, with the tier's top as its `z`.

:example{ component="Chart" name="isometric-treemap" }

### Contours

`Contour` raises each band with `z`. With `z="value"`, each band stands at its threshold, measured by `zScale`. Filled bands stack into terraces, and unfilled ones float as lines. See [Contour](/docs/components/Contour#isometric-terrain).

:example{ component="Contour" name="volcano-isometric" }

### Paths and maps

`Path` takes a `z` in pixels, or `[start, end]` to float it, and stands its shape up with shaded sides. An unfilled path is raised as a line. Marks drawn with `Path` pass it through, so a `GeoPath` can stand a region up:

```svelte
<GeoPath geojson={state} z={share * 60} fill={color} />
```

When shapes stand side by side, draw nearer ones last. With `m = context.isometricMatrix`, a point `[x, y]` on the floor is nearer the viewer the larger `m.b * x + m.d * y` is. The map below sorts its states by their centers this way:

```svelte
{@const m = context.isometricMatrix}
{@const depth = ([x, y]) => m.b * x + m.d * y}
{#each states.toSorted((a, b) => depth(geoPath().centroid(a)) - depth(geoPath().centroid(b))) as state}
```

Sorting by center works for shapes of similar size. A large shape wrapped around a smaller one can still draw in the wrong order.

:example{ component="GeoPath" name="election-isometric" }

### More marks with height

- **Bars:** with `valueAxis="z"`, values stand up off the floor instead of running along it. Each bar stands on its `x` / `y` band cell, and the chart stacks the values per cell, so hiding a series in the legend closes up the stacks.

  ```svelte
  <Chart {data} x="year" y="basket" z="value" valueAxis="z" c="fruit" view={isometric}>
  	<Layer>
  		<Bars />
  	</Layer>
  </Chart>
  ```

  :example{ component="Chart" name="isometric-stacked-columns" }

- **Calendar:** `z` stands each day up to its value.

  :example{ component="Calendar" name="isometric" }

- **Area and Spline:** `z` gives each point a height. A `Spline` runs through the points in 3D, and an `Area` stands up as a curtain from the floor to each point. One curtain per row of a band `y`, drawn back to front, makes a 3D area chart or ridgeline.

  :example{ component="Chart" name="isometric-areas" }

- **Polygon:** `z` stands a polygon up into a prism.

  :example{ component="Tree" name="isometric" }

- **Pie:** `z` stands every slice up, for a 3D pie or donut. Give an `ArcLabel` the same `z` and its callouts keep clear of the slices' sides. The `arcs` it passes to `children` come in drawing order, so match a slice to its data with `arc.index` or `arc.data` rather than the `{#each}` index.

  :example{ component="Pie" name="isometric" }

- **Line:** `z1` / `z2` raise each end. A line from the floor up to a point is a stem:

  ```svelte
  <Line x1="x" y1="y" x2="x" y2="y" z2="z" />
  ```

- **Labels** float with their points, at the chart's `z` or their own.

Heights animate with a mark's `motion`, like its position. The map above eases its states between parties with `motion` on each `GeoPath`.

## Text

Text lies on the floor like everything else. To keep it readable, set `viewport`: the text stays at its spot on the floor but faces the viewer, left to right at its natural size.

```svelte
<Text x="week" y="day" value="label" viewport />
```

On an `Axis`, pass it through `tickLabelProps` and `labelProps`:

```svelte
<Axis placement="bottom" tickLabelProps={{ viewport: true }} />
<Axis placement="left" label="Day" labelProps={{ viewport: true }} />
```

The **Labels** toggle in the [playground](#dragging-the-view) compares the two. Text along a `path`, or positioned with a CSS value such as `x="50%"`, stays on the floor.

`z` raises text like any other mark.

## Flat overlays

A layer with `ignoreTransform` draws flat, over the floor. Use it for a title, legend, or annotation that shouldn't tilt:

```svelte
<Chart view={isometric}>
	<Layer>
		<!-- On the floor -->
	</Layer>
	<Layer ignoreTransform>
		<!-- Flat, over the chart -->
	</Layer>
</Chart>
```

## Tooltips

Tooltips follow the pointer onto the floor, including on the simplified charts:

:example{ component="Chart" name="isometric-scatter" }

- **`bisect-x`, `bisect-y`, `bisect-band`** look up the data under the pointer on the floor.
- **`quadtree` and `voronoi`** find the point nearest the pointer on screen, where you see it, raised by its height.
- **`band` and `bounds`** hit areas lie on the floor with the marks. For boxes with height, let each box be its own hit area instead: `<Bars tooltip>` with `tooltipContext={{ mode: 'manual' }}`.
- **A pointer off the floor** shows nothing.
- **`x="data"` / `y="data"`** placement puts the tooltip where the point is drawn.
