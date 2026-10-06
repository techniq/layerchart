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

`rotate: 0, tilt: 0` shows the floor from directly above, so tweening both moves smoothly between that and the tilted view:

```svelte
<script>
	import { Tween } from 'svelte/motion';

	let view = $state('isometric');
	const t = Tween.of(() => (view === 'isometric' ? 1 : 0));
</script>

<Chart isometric={{ rotate: -45 * t.current, tilt: 54.7356 * t.current }}>
```

### Dragging the view

`transform={{ mode: 'projection' }}` lets the viewer turn and tip the floor by dragging — across to turn it, up and down to tip it — the same mode that spins a globe. The drag starts from the `isometric` prop's `rotate` and `tilt`, and `onTransform` reports where it's got to: `translate.x` is the turn and `translate.y` the tilt, in degrees.

```svelte
<Chart isometric transform={{ mode: 'projection' }}>
```

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
- **The fit** leaves room above the floor for the top of the `z` range, so tall boxes aren't cut off — the floor is a little smaller to make that room.
- **Boxes are painted back to front**, so nearer ones cover farther ones. That's exact for boxes on a grid, which don't overlap on the floor.
- **On a flat chart**, or in a layer with `ignoreTransform`, `z` has nothing to raise and the rects stay flat.

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
- **Only `Rect` and `Cell` have height** so far. Other marks, including `Bars`, lie flat on the floor.
- **Tooltips** find a box by where it stands on the floor, not by its raised top, so a pointer over a tall box's top can resolve to the box behind it.
