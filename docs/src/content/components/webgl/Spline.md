---
description: 'Marking component which applies data points connected by smooth, curved lines to show trends or patterns over a continuous range. In a WebGL layer, lines run through 3D, colored per point.'
category: WebGL marks
related: [Spline, guides/webgl]
components:
  - { name: webgl/Spline, label: Spline }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A line through the rows, one per `g` (or `stroke` key, or `c`) value, at each row's `x`, `y`, and `z`. `stroke` colors it per point, so a line can change color along its length.

```svelte
<Chart {data} x="t" y="key" yScale={scaleBand()} z="value" c="key" view={perspective}>
	<WebGL>
		<Spline strokeWidth={3} tooltip />
	</WebGL>
</Chart>
```

:example{ name="series" }

:example{ name="line3d" }

:example{ name="temperatures" }
