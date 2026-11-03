---
description: "Layer drawing its marks with WebGL (three.js), through the chart's `perspective` or `orthographic` view in 3D, or flat for many marks in 2D."
category: WebGL
related: [Layer, Canvas, guides/webgl, guides/isometric]
components:
  - { name: webgl/WebGL, label: WebGL }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A `WebGL` layer draws the `@layerchart/webgl` marks inside it. The chart's `view` says how it's seen, and its `transform` turns, pans, and zooms it.

```svelte
<script>
	import { Chart, Points, WebGL, perspective } from '@layerchart/webgl';
</script>

<Chart {data} x="x" y="y" z="z" view={perspective} transform={{ mode: 'canvas', drag: 'rotate' }}>
	<WebGL>
		<Points />
	</WebGL>
</Chart>
```

## The view

`perspective` draws farther things smaller; `orthographic` keeps sizes true at any depth. Both take `rotate`, `tilt`, `aspect`, and `motion` (and `perspective` a `fov`). Dragging hands its angles back through the chart's `onTransform`.

:example{ name="playground" }

## Flat

Without a `view`, the layer is seen from directly above and drawn unshaded, each chart pixel where an `Svg` or `Canvas` layer would draw it, for charts with more marks than those keep up with.

:example{ component="webgl/Points" name="scatter" }

Only the marks need to be drawn by it. Here `Svg` layers draw the grid, axes, and highlight as on any chart, with the chart's tooltip finding the nearest point, and the `WebGL` layer the 100,000 points between them.

:example{ component="webgl/Points" name="scatter-with-svg" }

## Limits

- Browsers limit how many WebGL contexts a page can have at once (16 in Chromium). A `WebGL` layer only holds one while it's on screen (or nearly), and gives it back when it's scrolled away.
- Nothing is drawn on the server. The layer renders once it mounts in the browser.
