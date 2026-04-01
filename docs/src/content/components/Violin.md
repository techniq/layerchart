---
description: Composite mark rendering a symmetric density curve (violin shape) showing the distribution of data, optionally overlaid with box and median indicators.
category: marks
layers: [svg, canvas]
related: [BoxPlot, Area]
---

## Usage

:example{ name="basic" showCode }

## With box and median

Enable `box` and `median` props to overlay quartile and median indicators inside the violin shape.

:example{ name="with-box-median" showCode }

## Horizontal

Set `valueAxis="x"` on the Chart to render horizontal violins.

:example{ name="horizontal" showCode }

## Custom bandwidth

Control the smoothness of the density curve with the `bandwidth` prop. Lower values show more detail, higher values produce smoother curves.

:example{ name="bandwidth" showCode }

## Combined with BoxPlot

Layer a `Violin` behind a `BoxPlot` to show both the distribution shape and summary statistics.

:example{ component="BoxPlot" name="with-violin" showCode }
