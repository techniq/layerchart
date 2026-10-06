---
title: Isometric (Faux 3D)
category: state
---

`isometric` draws a chart's plot area as a floor seen from above at an angle — the look of an isometric illustration, without WebGL. It works with the `Svg`, `Canvas`, and `Html` layers and every existing mark, because nothing about the chart changes except how the finished plot is drawn.

## Quick start

Add `isometric` to any `Chart`:

```svelte
<Chart {data} x="week" y="day" xScale={scaleBand()} yScale={scaleBand()} c="value" isometric>
	<Layer>
		<Axis placement="bottom" />
		<Axis placement="left" />
		<Cell x="week" y="day" fill="value" />
	</Layer>
</Chart>
```

:example{ component="Chart" name="isometric-heatmap" }

To try it on every chart at once, turn on the `isometric` setting — charts that set their own `isometric` (including `false`) keep it. On these docs, it's the **Isometric** switch in a component page's settings menu.

```svelte
<script>
	import { setSettings } from 'layerchart';
	setSettings({ isometric: true });
</script>
```

## How it works

The chart lays out on a **floor** of its own proportions rather than on the plot area, sized so that turned and tipped back it fits the chart. The scales, marks, and axes lay out across that floor exactly as they would across a flat plot, then each layer draws it through one matrix that turns it and tips it away from the viewer, centred in the chart. Everything drawn lies on the floor — a cell becomes a diamond, a circle an ellipse, and an axis runs along the floor's edge.

Because the floor keeps its proportions, resizing the chart scales it rather than stretching it, and text and strokes stay their natural size. It is a parallel projection: the far side of the floor is drawn the same size as the near side, with no vanishing point.

## The view

`isometric` takes `rotate` and `tilt` in degrees, and the floor's `aspect`:

| Option   | What it does                                                                      | Default                   |
| -------- | --------------------------------------------------------------------------------- | ------------------------- |
| `rotate` | Turns the floor about its centre, clockwise                                       | `-45`                     |
| `tilt`   | Tips it away from the viewer, from `0` (seen from directly above) towards edge on | `54.7356`, true isometric |
| `aspect` | The floor's width over its depth, or `'auto'` to take it from the data            | `'auto'`                  |

The defaults are true isometric: the origin (bottom-left of the flat plot) sits at the front corner, `x` runs up and to the right, `y` up and to the left, and both meet the horizontal at 30°.

```svelte
<!-- True isometric -->
<Chart isometric>

<!-- 2:1 "pixel art" projection -->
<Chart isometric={{ tilt: 60 }}>

<!-- Origin at the left corner instead -->
<Chart isometric={{ rotate: 45 }}>

<!-- A floor twice as wide as it is deep -->
<Chart isometric={{ aspect: 2 }}>
```

`aspect: 'auto'` takes the floor's proportions from the data:

- **Two band scales** — columns over rows, so every cell is square. A 20-week calendar is a floor 20 cells by 7.
- **Two continuous scales** — the domains' spans, so a unit runs as far across the floor as into it. When one span is more than four times the other, equal units would leave a sliver, so the floor is square instead.
- **Anything else** — a band against values, or dates against counts — is square: the units don't compare.

A `radial` chart's floor is always square — the circle it draws — and is fitted by that circle rather than its corners, since a circle keeps its width however it's turned.

### Animating the view

`motion` eases the view to new `rotate` / `tilt` values rather than jumping there. `rotate: 0, tilt: 0` shows the floor from directly above, so switching the angles moves smoothly between that and the tilted view:

```svelte
<script>
	let flat = $state(false);
</script>

<Chart
	isometric={{
		rotate: flat ? 0 : -45,
		tilt: flat ? 0 : 54.7356,
		motion: { type: 'tween', duration: 800 }
	}}
>
```

Any `motion` works — a `'spring'` follows a value that keeps changing, like a slider, without trailing behind it. It's read as the chart mounts, like a chart's `motion`. With a transform (below), the view turns from these eased angles, while the transform's own `motion` eases its zoom buttons and reset.

### Dragging the view

A transform on an isometric chart moves it two ways: it pans and zooms the chart, as on any chart, and it turns and tips the view — dragged across to turn it, up and down to tip it. `drag` picks which a plain drag does, and holding `dragSwitchKey` (`shift` by default) as a drag starts does the other:

```svelte
<!-- Drag to pan, shift-drag to turn -->
<Chart isometric transform={{ mode: 'canvas', scrollMode: 'scale' }}>

<!-- Drag to turn, shift-drag to pan -->
<Chart isometric transform={{ mode: 'canvas', drag: 'rotate' }}>
```

The view starts from the `isometric` prop's `rotate` and `tilt`, and changing them turns it there, leaving the pan and zoom. `onTransform` reports where it's got to — `rotation.x` is the turn and `rotation.y` the tilt, in degrees — and `reset()` puts the angles back along with the pan and zoom. `transform.drag` is reactive, so controls can switch it.

Try it in the playground below, where the sliders and the drag set the same angles, and **View** eases between them and the floor seen from above.

:example{ component="Chart" name="isometric-playground" }

## Height

`z` raises marks off the floor. Set it on the chart and every `Rect` and `Cell` stands up into a box that tall — its top, and the sides facing the viewer, shaded as if lit from the upper left:

```svelte
<Chart {data} x="week" y="day" xScale={scaleBand()} yScale={scaleBand()} z="value" isometric>
	<Layer>
		<Cell x="week" y="day" fill="value" />
	</Layer>
</Chart>
```

:example{ component="Chart" name="isometric-columns" }

- **The `z` scale** measures up from the floor: its domain reaches down to `0`, and its range runs to half the plot's shorter side. Set `zDomain` / `zRange` to change either — the **Height** slider in the playground above sets `zRange`, and `0` lays the boxes flat.
- **A mark's own `z`** overrides the chart's, and a chart `z` returning `[start, end]` floats the box between the two.
- **A `Rect` placed in pixels** ignores the chart's `z` — it has no row to read — but a number stands it up that many pixels: `<Rect x={0} y={0} width={100} height={60} z={40} />`. With no `width` or `height` it's a wall.
- **`shade={false}`** draws every face in the same flat colour. Shading darkens each side's own colour, so a translucent box stays as see-through as its top.
- **The fit** leaves room above the floor for the top of the `z` range, so tall boxes aren't cut off — the floor is a little smaller to make that room.
- **Boxes are painted back to front**, so nearer ones cover farther ones. That's exact for boxes on a grid, which don't overlap on the floor.
- **On a flat chart**, or in a layer with `ignoreTransform`, `z` has nothing to raise and the rects stay flat.

### 3D scatter

`Circle` floats each point at its `z` too, painted back to front, and `viewport` keeps it round rather than lying on the floor as an ellipse. Around them, `Frame` stands two walls up the floor's far edges, as tall as the `z` range — each a `Rect` with no depth, stood up like a box; `Grid z` draws gridlines across the walls and carries the floor's `x` / `y` gridlines up them; and `Axis placement="back"` runs the height up the corner where the walls start. All of them follow the view as it turns.

```svelte
<Chart {data} x="x" y="y" z="z" isometric transform={{ mode: 'canvas', drag: 'rotate' }}>
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

A `zRange` as tall as the floor is deep makes a cube: `zRange={({ height }) => [0, height]}`. Drag to turn it.

:example{ component="Chart" name="isometric-scatter-3d" }

`quadtree` tooltips find each point where it floats — over the floor or not — and `Highlight` floats with the hovered row. Its `lines` trace the row on every grid the box shows: across the floor at its `x` and `y`, and on each back wall, up it at that edge's `x` or `y` and across it at the row's height. `shadows` lays the row's light spot where those lines cross — on the floor beneath it and on each back wall beside it, lying flat on each.

```svelte
<Highlight data={hovered} lines shadows axis="both" />
<Highlight data={hovered} points={{ fill: 'none', stroke: 'currentColor' }} />
```

A floating highlight point is round, like a `viewport` circle. To mark a single plane instead, pin a coordinate: `z={() => 0}` puts a highlight's points on the floor beneath the row.

### Treemap

Stacked tiers make a treemap 3D: each node stands on its parent, inset by the treemap's padding. A tier is a `Rect` floated between two heights with `z={[start, end]}`, and `zScale` measures them — a `zDomain` of one step per level, and a `zRange` for how tall they all reach. A chart with a `zRange` leaves room above the floor for it, `z` channel or not.

```svelte
<Chart zDomain={[0, root.height + 1]} zRange={[0, 30]} isometric>
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
</Chart>
```

On an isometric chart `Treemap` hands out its `nodes` in the order to paint them, depth first: each node, then each of its children's subtrees whole, back to front. Children stand inside their parent and siblings tile it, so only siblings ever need comparing — and the order is exact for rectangles of any size, re-sorted as the view turns.

- **Labels drawn with their node**, right after its `Rect`, lie on its top: `Text` with the tier's height as `z`, without `viewport`. Nearer towers drawn later cover them, as they should. `rotate` turns one along a tall box, and a half turn more keeps it reading left to right as the view comes round.
- **Leave the `{#each}` unkeyed.** As the view turns the order changes; unkeyed, each row takes its new node, where keyed rows would move — which a `Canvas` layer doesn't follow, as it paints in the order its marks mounted.

Dragging pans it, with the wheel zooming, and shift-dragging turns the view — or the other way round, picked on its controls. A `motion` tween eases the zoom buttons and reset into place, and the view between flat and isometric as the `isometric` prop's angles change, while drags and the wheel follow the pointer directly.

:example{ component="Chart" name="isometric-treemap" }

## Text

Text lies on the floor along with everything else, which suits labels that belong to it. Where it should stay readable instead, set `viewport` to align it to the viewport rather than the floor: the text keeps its spot on the floor but faces the viewer, reading left to right at its natural size. `rotate` still turns it, on screen.

```svelte
<Text x="week" y="day" value="label" viewport />
```

An `Axis` passes it through `tickLabelProps` and `labelProps`. Its edge runs at an angle on screen, so the axis also hangs viewport-aligned labels off the side facing away from the floor rather than centring them under their ticks, and a viewport-aligned title reads left to right rather than turning to follow a vertical axis. Anchors you set yourself still win.

```svelte
<Axis placement="bottom" tickLabelProps={{ viewport: true }} />
<Axis placement="left" label="Day" labelProps={{ viewport: true }} />
```

Switch **Labels** between **Default** and **Viewport** in the example above to compare the two. Text drawn along a `path`, or positioned with a CSS value such as `x="50%"`, has no single point to stand on and stays on the floor.

`z` raises text off the floor like any other mark — a number of pixels, or in data mode a `z` per row, defaulting to the chart's.

## Flat overlays

A layer with `ignoreTransform` is drawn flat, over the floor — for a title, legend, or annotation that shouldn't tilt:

```svelte
<Chart isometric>
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

- **`bisect-x`, `bisect-y`, `bisect-band`** map the pointer back onto the flat plot, then look up the data the usual way.
- **`quadtree`** finds the point nearest the pointer _on screen_. The floor is foreshortened, so that isn't always the point nearest on the floor itself.
- **`band` and `bounds`** draw their hit areas in the chart's layers, so they lie on the floor with the marks.
- **A pointer off the floor** — inside the chart but outside the diamond — shows nothing.
- **`x="data"` / `y="data"`** placement puts the tooltip where the point is drawn.

## Limitations

- **Brushing** isn't supported yet: the brush is drawn and measured on the flat plot, so its selection won't match the floor.
- **`voronoi` tooltips** pick the point nearest on the floor rather than on screen. Prefer `quadtree` for an isometric chart.
- **`WebGL` layers** aren't transformed.
- **`tickOcclusion`** measures labels on the flat plot, so on a floor it may drop or overlap labels it shouldn't.
- **Only `Rect`, `Cell`, `Circle`, `Text`, and `Highlight` have height** so far. Other marks, including `Bars`, lie flat on the floor.
- **The `bottom` / `left` axes stay on their edges** as the view turns, so turned far enough they run along the back.
- **Tooltips** find a box by where it stands on the floor, not by its raised top, so a pointer over a tall box's top can resolve to the box behind it.
