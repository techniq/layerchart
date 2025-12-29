---
description: Marking component which displays text directly on a chart to identify or annotate specific data points.
category: marks
layers: [svg, canvas]
related: []
---

## Usage

:example{ component="Bars" name="vertical-outside-labels-default" showCode }

## Bar charts

By default labels will be on the outside of bars, above for positive values and below for negative values

:example{ component="Bars" name="vertical-outside-labels-default" showCode }

You can also use `placement="inside"` to place within the bars (near the value)

:example{ component="Bars" name="vertical-inside-labels" }

## Line charts

:example{ component="Spline" name="with-labels" }

## Scatter charts

:example{ component="Points" name="with-labels" }

## Simplified charts

Labels are also integrated in simplified charts via the `labels` prop

:example{ component="BarChart" name="labels" }
