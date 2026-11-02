---
description: 'Marking component drawing a sphere per row in a WebGL chart, or a disc when flat, optionally glowing or wrapped in an image.'
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

:example{ name="scatter" }

## Glow and images

`glow` draws each sphere in its own color whatever the lights (ex. a star), and `image` wraps each in an equirectangular image (ex. a planet), turned by `rotate` and leaning by `tilt`.

:example{ name="solar-system" }

## Flat

Without a view, points are discs, for many thousands of them.

:example{ component="webgl/WebGL" name="flat" }
