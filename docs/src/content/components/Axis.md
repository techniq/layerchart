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

:example{ name="linechart-tickspacing" }

:example{ name="barchart-tickspacing" }

::tip
See [time scales](#time-scales) for how tick labels are chosen, and [brush](/docs/components/Axis/time-scale-brush-multiline) for tick spacing while zooming.
::

### tickOcclusion

`tickSpacing` divides the axis length by a pixel budget to pick a tick **count**. It never looks at
the labels, so it is only right when every label is about as wide as the budget assumes.
`tickOcclusion` measures each label at the size it renders and drops the ticks whose labels would
overlap one already kept.

Reach for `tickSpacing` when labels are uniform (a numeric scale, `12:00`-style times) — it is
cheaper and gives evenly spaced ticks. Reach for `tickOcclusion` when they are not:

:example{ name="tick-occlusion" }

`padding` is the minimum gap required between two kept labels — raise it to thin the axis further
than mere non-overlap would.

#### Why not just lower `tickSpacing`?

Because one budget has to serve every label. Set it wide enough for `Customer Success Operations`
and you throw away ticks next to `HR`; set it for `HR` and the long ones still collide.

:example{ name="tick-occlusion-vs-tick-spacing" }

::note
Band scales default `tickSpacing` to `null` and draw a tick per band, so a category axis with long
names overlaps out of the box. This is the case `tickOcclusion` is most useful for.
::

#### Ticks `tickSpacing` cannot thin at all

An explicit `ticks` array or time interval sets the tick values outright — `tickSpacing` and
`count` have no say (see [time scale (explicit)](#time-scale-explicit)). `tickOcclusion` runs after
the values are chosen, so it is the only way to thin them while keeping the interval you asked for.

:example{ name="tick-occlusion-explicit-ticks" }

#### Priority

Which ticks win when labels compete:

- `'end'` (default) — keep the last tick and walk backwards. The newest value on a time axis.
- `'start'` — keep the first and walk forwards.
- `'start-end'` — anchor both ends of the axis, thin what is between them, so the reader always
  sees the range the chart spans.

:example{ name="tick-occlusion-priority" }

#### Rotated labels

Rotation is the other way out of a crowded category axis, and the two compose: labels are measured
after rotation, so an angled label — which needs far less horizontal room — keeps neighbours that a
flat one would push out.

:example{ name="tick-occlusion-rotated" }

#### Options

```svelte
<Axis placement="bottom" tickOcclusion={{ priority: 'start-end', padding: 12 }} />
```

- `priority` — `'end'` (default), `'start'`, or `'start-end'`.
- `padding` — minimum gap, in pixels, required between two kept labels. Defaults to `4`.

::note
The whole tick is dropped, not just its label — its tick mark and grid line go with it, the same way
a lower `tickSpacing` would.
::

::note
Labels are tested against each other, not against the plot bounds. A kept label at either end of the
axis is drawn wherever its tick sits, so reserve horizontal `padding` for it — especially with
`priority: 'start-end'`, which anchors both ends by design.
::

### time scales

With no `format`, tick labels are chosen automatically from the duration between ticks — a domain spanning years is labelled with years, one spanning a minute with seconds. Resizing the chart (or changing `tickSpacing`) changes the tick density, and the labels follow.

:example{ name="time-scale-auto" }

Passing an explicit `format` does two things: it labels the ticks, and it **filters** them to that boundary. A `day` format keeps only ticks landing exactly on a day, so a denser tick set never repeats the same label.

:example{ name="time-scale-auto-format-filtering" }

::note
Because the filter is what keeps labels unique, an explicit `format` can yield fewer ticks than `tickSpacing` alone would produce. If an axis renders no ticks, check that the format's boundary matches the values — see [UTC](#utc) for the common case.
::

`tickMultiline` splits the automatic labels across two lines (ex. day above, month below), fitting more context into the same width.

:example{ name="time-scale-auto-multiline" }

#### UTC

Ticks are filtered and labelled on the same boundaries the scale uses, so pass `xScale={scaleUtc()}` when your values are keyed on a UTC calendar date (ex. daily partitions) rather than on an instant. The default `scaleTime()` floors on _local_ boundaries, which sits one UTC offset away from each UTC day for every viewer outside UTC.

::note
This applies to the tick _labels_ as well — a `scaleUtc()` axis formats its ticks in UTC, so a tick at UTC midnight is never labelled with the previous local day.
::

:example{ name="utc-scale" }

### band scales

When creating time-series bar charts, it can be useful to use a time scale axis instead of a bar scale axis. This helps show gaps in data (such as on [weekends](/docs/components/BarChart/time-scale-interval)) and provides improved axis ticks.

To enable this, you must define the interval (daily, hourly, etc) of your data using [d3-time interval](https://d3js.org/d3-time#timeMillisecond), such as `xInterval={timeDay}`.

Since band padding is not available when not using a band scale, you can leverage `xInset={...}` to add padding between bars.

:example{ name="barchart-xinterval-xinset" }

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
