---
description: Marking component which applies horizontal bars to represent and visually compare discrete data values.
category: marks
layers: [svg, canvas, html]
related: [Bar]
components:
  - { name: Bars }
  - { name: webgl/Bars, label: Bars (WebGL) }
---

:::tip
See also: [BarChart](/docs/components/BarChart) for simplified examples
:::

## Usage

:example{ name="vertical-basic" showCode }

## Fixed width

Use `width` or `height` to override the scale-derived size with a fixed pixel value. The bar is centered within its band.

:example{ name="vertical-fixed-width" showCode }

## Isometric

On an [isometric](/docs/guides/isometric) chart with `valueAxis="z"`, bars stand up off the floor as 3D columns, stacked by the chart.

:example{ component="Chart" name="isometric-stacked-columns" }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), each bar is a box standing as tall as its z. See the [WebGL guide](/docs/guides/webgl) to get started.

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

### Stacked

With series and `valueAxis="z"`, bars stack up off the floor.

:example{ name="stacked-columns" }

### Heatmap and calendar

:example{ name="heatmap" }

:example{ name="calendar" }
