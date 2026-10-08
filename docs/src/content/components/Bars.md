---
description: Marking component which applies horizontal bars to represent and visually compare discrete data values.
category: marks
layers: [svg, canvas, html]
related: [Bar]
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
