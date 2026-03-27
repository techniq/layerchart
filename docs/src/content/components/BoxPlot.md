---
description: Composite mark rendering a box-and-whisker plot showing the distribution of data through quartiles, whiskers, and outliers.
category: marks
layers: [svg, canvas]
related: [Violin, Bars]
---

## Usage

:example{ name="basic" showCode }

## Pre-computed statistics

Pass explicit `min`, `q1`, `median`, `q3`, `max`, and `outliers` accessors when you have pre-computed statistics.

:example{ name="pre-computed" showCode }

## Horizontal

Set `valueAxis="x"` on the Chart to render horizontal box plots.

:example{ name="horizontal" showCode }

## Styled

Customize the box appearance with `fill`, `stroke`, `radius`, and other style props.

:example{ name="styled" showCode }

## With Tooltip

Add `tooltipContext={{ mode: 'band' }}` on Chart to enable tooltip on hover for band scales.

:example{ name="with-tooltip" showCode }

## Combined with Violin

Layer a `Violin` behind a `BoxPlot` to show both the distribution shape and summary statistics.

:example{ name="with-violin" showCode }
