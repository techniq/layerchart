---
description: 'Mark raising a grid of values into a lit surface in a WebGL chart, with optional wireframe and contour lines.'
category: WebGL surfaces
related: [Raster, Contour, guides/webgl]
components:
  - { name: webgl/Surface, label: Surface }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

Heights from values, through the chart's `z` scale (whose domain widens to reach them), colored through the chart's continuous color scale (`cScale`), else yellow-green-blue. Values come the same ways as LayerChart's [Raster](/docs/components/Raster):

- **A grid:** `data` (row-major values) with `width` × `height`, laid across the plot, or across `x1` / `y1` to `x2` / `y2` in data coordinates.
- **A function:** `value={(x, y) => ...}`, sampled every `pixelSize` pixels, in data coordinates (longitude and latitude on a map).
- **Scattered rows:** `data` with `x`, `y`, and `value`, interpolated onto a grid (`interpolate`).

```svelte
<Chart
	xDomain={[-1, 1]}
	yDomain={[-1, 1]}
	cScale={scaleSequential(interpolateRdYlBu)}
	view={perspective}
>
	<WebGL>
		<Surface value={(x, y) => Math.sin(x * Math.PI) * Math.sin(y * Math.PI)} wireframe />
	</WebGL>
</Chart>
```

:example{ name="basic" }

## Contours, and raising or flattening

`contours` draws contour lines at their heights. To raise or flatten a surface, ease the chart's `zRange` (ex. with a `Tween`), which the surface, its contours, and the view's fit all follow.

:example{ name="volcano" }

## Motion

`motion` eases to new values (ex. a new `value` function): heights, colors, and contours move together.

:example{ name="math-functions" }

## Terrain

A function of longitude and latitude on a map is terrain. These load elevation from the open terrain tiles AWS hosts, and light it with a sun you can move.

:example{ name="us-elevation" }

:example{ name="terrain" }

:example{ name="world-elevation" }
