---
description: Marking component which shades the space under a line on a chart to emphasize the magnitude and trend of data over a range.
category: marks
layers: [svg, canvas]
related: []
---

::info
See also: [AreaChart](/docs/components/AreaChart) for simplified examples
::

## Usage

:example{ name="basic" showCode }

### Multiple areas (`g`)

Set `g` to draw a separate area per distinct value, all from one mark — the same channel [`Spline`](/docs/components/Spline#multiple-lines-g) uses. A `fill` (or `stroke`) that names a data property implies it, so this draws one area per fruit, colored through the chart's [`c` scale](/docs/guides/scales):

```svelte
<Chart {data} x="date" y="value" c="fruit" {cRange}>
	<Area fill="fruit" fillOpacity={0.3} line />
</Chart>
```

`line` draws a line per area too, inheriting the area's color unless you override it.

This replaces grouping the data yourself and rendering an `Area` per group — every mark registers with the chart and rebuilds its domains, so a mark per area costs O(areas × rows) at mount.

:example{ name="multiple-series-with-labels" showCode }

`fill`, `stroke`, `opacity`, and `class` also accept a function, resolved per area.

### Playground

:example{ name="playground" }

## Isometric ridgeline

On an [isometric](/docs/guides/isometric) chart, `z` gives each point a height, and an `Area` stands up as a curtain from the floor to those heights. One curtain per row of a band `y`, drawn back to front, makes a 3D ridgeline.

:example{ name="oscilloscope-ridgeline-isometric" }
