---
description: 'Marking component drawing a box per row in a WebGL chart, standing on its band cell as tall as its z, stacking along z.'
category: WebGL marks
related: [Bars, guides/webgl]
components:
  - { name: webgl/Bars, label: Bars }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A box per row, standing on its `x` × `y` band cell, as tall as its `z`.

```svelte
<Chart
	{data}
	x="week"
	xScale={scaleBand()}
	y="day"
	yScale={scaleBand()}
	z="value"
	view={perspective}
>
	<WebGL>
		<Bars tooltip />
	</WebGL>
</Chart>
```

:example{ name="columns" }

## Stacked

With series and `valueAxis="z"`, bars stack up off the floor.

:example{ name="stacked-columns" }

## Heatmap and calendar

:example{ name="heatmap" }

:example{ name="calendar" }
