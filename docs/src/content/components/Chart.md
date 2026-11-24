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

## Guides

Most of what a chart can do is configured on `Chart`, and each part has its own guide:

| Guide                                           | Covers                                       |
| ----------------------------------------------- | -------------------------------------------- |
| [Scales](/docs/guides/scales)                   | `x`, `y`, `xDomain`, `xScale`, `xRange`, ... |
| [Structure](/docs/guides/structure)             | snippets and the order layers are drawn in   |
| [Series](/docs/guides/series)                   | `series`, `seriesLayout`, `c`                |
| [Multiple scales](/docs/guides/multiple-scales) | mixed marks, dual axes                       |
| [Facets](/docs/guides/facets)                   | `fx`, `fy`                                   |
| [Tooltip](/docs/guides/tooltip)                 | `tooltipContext`                             |
| [Brush](/docs/guides/brush)                     | `brush`                                      |
| [Transform](/docs/guides/transform)             | `transform`                                  |
| [Chart Group](/docs/guides/chart-group)         | `group`                                      |
| [Geo](/docs/guides/geo)                         | `geo`                                        |
| [Isometric](/docs/guides/isometric)             | `view`                                       |

## Padding

`padding` is the space between the chart's container and its plot, where the axes, their titles and the legend draw. Pass a number for every side, or an object for each (`{ left: 40, bottom: 24 }`).

Set a side — or `padding` itself — to `'auto'` to size it to fit what the axes draw there instead of tuning it by hand: tick labels (as formatted, rotated, or wrapped), and the axis title. Every axis is measured against every edge, so the first and last labels of a bottom axis get room on the left and right too.

To fit and then adjust, pass a function. It is given the size that fits:

```svelte
<!-- Fit the axes on every side -->
<Chart padding="auto" />

<!-- Fit the left, plus 16px of breathing room -->
<Chart padding={{ left: (auto) => auto + 16, bottom: 24 }} />

<!-- Fit, but never less than 40px (ex. to line up with another chart) -->
<Chart padding={(auto) => Math.max(auto, 40)} />
```

:example{ name="padding-auto" }

The padding grows as soon as a label needs more room, but only shrinks once the labels have settled, so a domain animating or zooming through shorter labels doesn't nudge the plot on every frame. Until the axes have measured — including while server rendering — an `'auto'` side uses the default padding. A legend below the chart keeps its room under a fitted bottom axis.

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
