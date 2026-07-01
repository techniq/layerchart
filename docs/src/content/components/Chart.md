---
description: Base component providing chart dimensions and contexts such as TooltipContext, GeoContext, and TransformContext. See also simplified charts such as AreaChart and BarChart for streamlined implementations.
category: charts
layers: [svg, canvas, html]
related:
  [ArcChart, AreaChart, BarChart, LineChart, PieChart, ScatterChart, TooltipContext, GeoContext]
order: 1
---

## Usage

:example{ component="Area" name="basic" showCode }

::note
Features: Adds support for x and y baselines (always show 0, etc)
::

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
