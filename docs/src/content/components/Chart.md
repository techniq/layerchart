---
description: Base component providing chart dimensions and contexts such as TooltipContext, GeoProjection, and TransformContext. See also simplified charts such as AreaChart and BarChart for streamlined implementations.
category: charts
layers: [svg, canvas, html]
related:
  [ArcChart, AreaChart, BarChart, LineChart, PieChart, ScatterChart, TooltipContext, GeoProjection]
order: 1
---

## Usage

:example{ component="Area" name="basic" showCode }

::note
Features: Adds support for x and y baselines (always show 0, etc)
::

## Mixed marks

Marks compose: each reads the chart's scales but decides for itself what to draw. Here the `Bars` stack among themselves while the `Spline` draws a target from its own values, and the scale covers both — so the line stays on the chart even where it runs above the tallest stack.

```svelte
{#each context.series.visibleSeries as s (s.key)}
	<Bars seriesKey={s.key} />
{/each}
<Spline y="target" />
```

:example{ name="mixed-marks-with-stack" }

A `Spline` given a `seriesKey` instead follows that series' stacked top, which is how a line is drawn along the edge of a stacked `Area`.

The same chart from long data needs no `series` at all — `c` names the layers, so one `Bars` stacks them:

:example{ name="mixed-marks-with-stack-long-data" }

## Text selection

Charts are treated as interactive widgets: `user-select: none` is applied to the root container (`.lc-root-container`) so dragging to brush, pan, or zoom never selects axis labels or surrounding page text. Since `user-select` inherits, this covers the whole chart.

To re-enable selection where you need it, set the `--lc-user-select` custom property to `text` — on the chart, a wrapping element, or a specific subtree:

```svelte
<!-- Re-enable for a chart (or any descendants under a wrapper) -->
<div style="--lc-user-select: text">
	<Chart {data} ... />
</div>
```

An individual selectable region can also just set `user-select: text` on itself (e.g. Tailwind's `select-text`), which overrides the inherited value.

### Facet (fx)

:example{ name="facet-x" }

### Facet (fy)

:example{ name="facet-y" }

### Facet grid (fx + fy)

:example{ name="facet-grid" }

### Faceted lines

:example{ name="facet-lines" }

### Facet with composed children

:example{ name="facet-composed" }

### Two-dimensional faceting

:example{ name="facet-two-dimensional" }

### Non-faceted marks

:example{ name="facet-non-faceted-marks" }

### Facet wrap

:example{ name="facet-wrap" }

### Annotated facets

:example{ name="facet-annotation" }

### Panel colours

:example{ name="facet-color" }

### Panel spacing

:example{ name="facet-spacing" }

### Facet tooltips

:example{ name="facet-tooltip" }

### Facet brushing

:example{ name="facet-brush" }

### Facet brush-to-zoom

:example{ name="facet-brush-zoom" }
