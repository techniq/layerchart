---
description: "Commonly used component displays the scale and reference lines on a chart, providing context for interpreting data values. In a WebGL layer, it runs along the plot box's edges: bottom for x, left for y, and back for z."
category: WebGL
related: [Axis, guides/webgl]
components:
  - { name: webgl/Axis, label: Axis }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Tick labels along an edge: `bottom` for `x`, `left` for `y`, and `back` for `z` (up the corner behind the plot). They keep to the edges in front as the view turns.

Labels are drawn on the plot box, turning with it: the floor's (`bottom`, `left`) lie on it, as on an [isometric](/docs/guides/isometric#text) chart, and the height axis' (`back`) stand on the back wall beside its edge. `tickLabelProps={{ viewport: true }}` and `labelProps={{ viewport: true }}` draw them facing the viewer instead, over the scene, upright and crisp however the view turns.

```svelte
<WebGL>
	<Axis placement="bottom" label="x" />
	<Axis
		placement="left"
		label="y"
		tickLabelProps={{ viewport: true }}
		labelProps={{ viewport: true }}
	/>
	<Axis placement="back" label="z" />
	<Points />
</WebGL>
```

:example{ component="webgl/Points" name="scatter-3d" }

:example{ component="webgl/Spline" name="temperatures" }
