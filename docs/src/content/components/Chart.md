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

## Lazy rendering

A page of many charts pays to build all of them up front, including the ones far below the fold. Set `lazy` to build a chart only once its container comes near the viewport:

```svelte
<LineChart {data} x="date" y="value" lazy />
```

- The container renders right away at its full size, so nothing shifts when the chart builds. Size it as you would any chart.
- A chart that is already on screen builds immediately, without an empty first frame.
- The others build once they come within `200px` of the viewport. Pass `lazy={{ rootMargin: '600px' }}` to start sooner. `threshold` is also accepted.
- Once built, a chart stays built. Scrolling away keeps its tooltip, brush, and zoom state.
- A chart in a hidden container (ex. an inactive tab) builds when it's shown.
- With `ssr`, the server renders the empty container (and any `placeholder`).

### Placeholder

The `placeholder` snippet renders inside the container until the chart is built, for example a loading state. The container already has the chart's size, so `h-full` fills it.

:example{ component="Chart" name="lazy" showCode }

### Every chart on a page

Set `lazy` in [settings](/docs/guides/state#settings-global-defaults) to make it the default for every chart below. Charts that set their own `lazy`, including `false`, keep it.

```svelte
<script>
	import { setSettings } from 'layerchart';
	setSettings({ lazy: true });
</script>
```

:::note
With Svelte's `experimental.async`, a lazy chart that comes into view while an `await` elsewhere on the page is still pending can stall the page ([sveltejs/svelte#18997](https://github.com/sveltejs/svelte/issues/18997)).
:::

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
