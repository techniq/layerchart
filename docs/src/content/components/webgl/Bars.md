---
description: 'Marking component which applies horizontal bars to represent and visually compare discrete data values. In a WebGL layer, each bar is a box standing as tall as its z.'
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
