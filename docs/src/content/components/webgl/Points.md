---
description: 'Marking component which plots individual data points on a graph to show distribution, relationships, or clusters without connecting lines. In a WebGL layer, each point is a sphere (a disc when flat), and can glow or wear an image.'
category: WebGL marks
related: [Points, guides/webgl]
components:
  - { name: webgl/Points, label: Points }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A sphere per row, at its `x`, `y`, and `z`. `r` sets the radius in pixels, else the chart's `r` scale.

```svelte
<Chart {data} x="x" y="y" z="z" view={perspective}>
	<WebGL>
		<Points r={6} tooltip />
	</WebGL>
</Chart>
```

:example{ name="scatter-3d" }

## Glow and images

`glow` draws each sphere in its own color whatever the lights (ex. a star), and `image` wraps each in an equirectangular image (ex. a planet), turned by `rotate` and leaning by `tilt`.

:example{ name="solar-system" }

## Flat

Without a view, points are discs, for many thousands of them.

:example{ name="scatter" }

The grid, axes, and highlight can be LayerChart's own `Svg` layers instead, with only the points in WebGL:

:example{ name="scatter-with-svg" }
