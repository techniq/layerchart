---
description: Marking component which displays text directly on a chart to identify or annotate specific data points.
category: marks
layers: [svg, canvas, html]
related: []
---

## Usage

:example{ component="Bars" name="vertical-outside-labels-default" showCode }

### Bar charts

By default labels will be on the outside of bars, above for positive values and below for negative values

:example{ component="Bars" name="vertical-outside-labels-default" }

You can also use `placement="inside"` to place within the bars (near the value edge)

:example{ component="Bars" name="vertical-inside-labels" }

Use `placement="middle"` to align the label to the value edge with a centered anchor, or `placement="center"` to center the label within the bar body (between the value edge and the baseline).

:example{ component="BarChart" name="labels-placement" }

Labels work with horizontal bar charts, with placement respecting the value edge direction.

:example{ component="BarChart" name="series-horizontal-labels" }

Labels on grouped series bar charts will be placed relative to each series' bar.

:example{ component="BarChart" name="group-series-labels" }

Labels are also supported on duration (range) bars, showing the span value inside or outside each bar.

:example{ component="BarChart" name="duration-labels" }

### Line charts

:example{ component="Spline" name="with-labels" }

Use `placement="smart"` to dynamically position labels based on neighboring point values (peaks, troughs, rising, and falling) to reduce overlap.

:example{ component="LineChart" name="smart-labels-with-points" }

Labels can also be rendered within enlarged points for a compact inline annotation style.

:example{ component="LineChart" name="labels-within-points" }

Series end labels can be shown for multi-series line charts, and highlighted on hover.

:example{ component="LineChart" name="series-labels-hover" }

### Scatter plots

Use `layout="voronoi"` to orient each label towards the open space of its Voronoi
cell, `occlude` to hide labels that would overlap a roomier-cell neighbor, and
`links` to move each label out into open space with a leader line back to the point
(d3-ring-note / smart-labels style) — no per-point placement setup required.

:example{ name="voronoi" }

It works on maps too — in a geo `<Chart>`, `<Points>` and the labels project through
the projection, so the same props place airport labels in open space with leaders.

:example{ name="voronoi-geo" }

### Areas and regions

Use `layout="shape"` to label each shape once, rather than each data point. A label goes as near
its shape's visual center as its text fits (where it has the most room otherwise), so a wide label
moves into the widest stretch of a band, and it keeps its place as the chart resizes rather than
jumping between equally roomy spots.

For a stacked (or overlapping) area chart, add a single `<Labels layout="shape" />` beside the
areas: each series' area, or each `c` category's (as here, with `c="name"`), is labeled with its
name. Add `occlude` to hide the labels that don't fit within their shape, such as a band too thin
for its name.

:example{ name="shape-area" showCode }

A simplified chart takes the same props through `labels` (here with the other languages summed
into "Other", and stacked to 100% with `seriesLayout="stackExpand"`).

:example{ name="shape-area-chart" showCode }

In a geo `<Chart>`, pass GeoJSON features as `data` to label each region by its `properties.name`,
or by a `value` accessor (here, each state's abbreviation or name). The label goes where the region
has room for it, such as the middle of Florida's peninsula rather than its panhandle.

:example{ name="shape-geo" showCode }

### Simplified charts

Labels are also integrated in simplified charts via the `labels` prop

:example{ component="BarChart" name="labels" showCode }
