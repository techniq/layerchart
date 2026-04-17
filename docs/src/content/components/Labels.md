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

:example{ component="Bars" name="vertical-outside-labels-default" showCode }

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

### Simplified charts

Labels are also integrated in simplified charts via the `labels` prop

:example{ component="BarChart" name="labels" showCode }
