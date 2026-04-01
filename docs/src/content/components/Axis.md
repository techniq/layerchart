---
description: Commonly used component displays the scale and reference lines on a chart, providing context for interpreting data values.
category: common
layers: [svg, canvas, html]
related: [Grid, Rule]
---

## Usage

:example{ name="placement-bottom-left" showCode }

### tickSpacing

Controls the number of pixels allotted for each tick (higher => fewer ticks). Works with both continuous scales (linear, time) and band scales. When zoomed in on a band scale, tick labels automatically adjust to show more as bands get wider.

::note
Default: `80` for horizontal axes (top/bottom/angle) and `50` for vertical axes (left/right/radius).
::

:example{ name="linechart-tickspacing" showCode }

:example{ name="barchart-tickspacing" showCode }

::tip
See also: time scale [auto](/docs/components/Axis/time-scale-auto), [multiline](/docs/components/Axis/time-scale-auto-multiline), and [brush](/docs/components/Axis/time-scale-brush-multiline) examples
::

### band scales

When creating time-series bar charts, it can be useful to use a time scale axis instead of a bar scale axis. This helps show gaps in data (such as on [weekends](/docs/components/BarChart/time-scale-interval)) and provides improved axis ticks.

To enable this, you must define the interval (daily, hourly, etc) of your data using [d3-time interval](https://d3js.org/d3-time#timeMillisecond), such as `xInterval={timeDay}`.

Since band padding is not available when not using a band scale, you can leverage `xInset={...}` to add padding between bars.

:example{ name="barchart-xinterval-xinset" showCode }

<!-- ## Examples

### Placement (bottom / left)

:example{ name="placement-bottom-left" }

### Placement (top / right)

:example{ name="placement-top-right" }

### Placement (bottom / left with rule)

:example{ name="placement-bottom-left-rule" }

### Placement (top / right with rule)

:example{ name="placement-top-right-rule" }

### Grid

:example{ name="grid" }

### Grid (dashed)

:example{ name="grid-dashed" }

### Multiple axis grids with single rule

:example{ name="basic" }

> Axis with rule should be rendered last

### Multiple axis grids and rules

:example{ name="multiple-axis-grid-and-rules" }

> Top-most axis must have separate rule due to SVG rendering order

### Multiple axis grids and rules (separate grid)

:example{ name="multiple-axis-grid-and-rules" }

### Arrow markers

:example{ name="arrow-markers" }

### Tick label styling

:example{ name="tick-label-styling" }

### Rotate labels

:example{ name="rotate-labels" }

### Remove tick marks

:example{ name="remove-tick-marks" }

### Show first/last ticks only with alignment

:example{ name="extent-ticks-only" }

### Integer-only ticks (via filter)

:example{ name="integer-only-filter" }

### Integer-only ticks (via format)

:example{ name="integer-only-format" }

### Hide `0` (via filter)

:example{ name="hide-zero-filter" }

### Hide `0` (via format)

:example{ name="hide-zero-format" }

### Explicit ticks

:example{ name="explicit-ticks" }

### Inject tick value

:example{ name="inject-ticks" }

### Tick count

:example{ name="tick-count" }

### Tick spacing

:example{ name="tick-spacing" }

### Label next to hash

:example{ name="labels-next-hash" }

### Override axis ticks with custom scale

:example{ name="override-axis-ticks-scale" }

### Axis label placements (top / bottom)

:example{ name="axis-label-placement-top-bottom" }

### Axis label placements (left / right)

:example{ name="axis-label-placement-left-right" }

### Multiline tick labels with format (`\n`)

:example{ name="multiline-tick-labels" }

### Multiple time axis with same placement (bottom)

:example{ name="multiple-axis-same-placement-bottom" }

### Multiple time axis with same placement (right)

:example{ name="multiple-axis-same-placement-right" }

### Radial rule

:example{ name="radial-rule" }

### Radial grid

:example{ name="radial-grid" }

### Log scale

:example{ name="log-scale" }

### Time scale (auto)

:example{ name="time-scale-auto" }

### Time scale (auto) with multiline ticks

Provides a compact multiline representation of dates. Also useful to see boundary changes (years, months, etc)

:example{ name="time-scale-auto-multiline" }

### Time scale (auto) with format (filtering)

Useful when you want to keep all ticks at the same resolution (ex. day) while still allowing tickSpacing/count to reduce ticks

:example{ name="time-scale-auto-format-filtering" }

### Time scale (explicit)

Specify explicit time intervals such as every day, every 6 months, etc.

> Note: `tickSpacing` / `count` have no effect

:example{ name="time-scale-explicit" }

### Time scale (explicit) with multiline ticks

Specify explicit time intervals such as every day, every 6 months, etc with compact multiline representtion.

> Note: `tickSpacing` / `count` have no effect

:example{ name="time-scale-explicit-multiline" }

### Time scale (brush)

:example{ name="time-scale-brush" }

### Time scale (brush) with multiline ticks

:example{ name="time-scale-brush-multiline" } -->
