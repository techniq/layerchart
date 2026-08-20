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

### Multiple areas (`z`)

Set `z` to draw a separate area per distinct value, all from one mark — the same channel [`Spline`](/docs/components/Spline#multiple-lines-z) uses. A `fill` (or `stroke`) that names a data property implies it, so this draws one area per fruit, colored through the chart's [`c` scale](/docs/guides/scales):

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
