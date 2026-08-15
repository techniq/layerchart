---
title: Facets (Small multiples)
category: state
---

Faceting partitions the data into a grid of panels, one per distinct value, and draws the same chart in each. The **position scales stay shared across every panel**, which is what makes them comparable — the point of small multiples over a row of separate charts.

## Quick start

Set `fx` to split the data into a column per value:

```svelte
<Chart {data} x="bill_length_mm" y="body_mass_g" fx="species">
	{#snippet marks()}
		<Circle cx="bill_length_mm" cy="body_mass_g" r={2.5} />
	{/snippet}
</Chart>
```

:example{ component="Chart" name="facet-x" }

Each panel draws only its own rows, but the `x` and `y` scales are computed from **all** of them, so a position means the same thing in every panel.

`fy` splits into rows instead:

:example{ component="Chart" name="facet-y" }

## Two-dimensional faceting

Set both to cross them into a grid. Panel headers appear across the top for `fx` and down the right for `fy`:

```svelte
<Chart {data} x="bill_length_mm" y="bill_depth_mm" fx="sex" fy="species" grid>
```

:example{ component="Chart" name="facet-two-dimensional" }

A crossed grid is usually sparse — not every combination has rows — and those panels simply come out empty while the scales stay shared.

## Non-faceted marks

A mark reads its panel's rows from context. Pass `data` explicitly to opt out, and it draws the full dataset in every panel — useful as a backdrop to compare each panel against the whole:

```svelte
{#snippet marks()}
	<!-- the whole population, repeated in every panel -->
	<Circle {data} cx="bill_length_mm" cy="bill_depth_mm" r={1} fillOpacity={0.25} />

	<!-- just this panel's rows -->
	<Circle cx="bill_length_mm" cy="bill_depth_mm" r={2.5} />
{/snippet}
```

:example{ component="Chart" name="facet-non-faceted-marks" }

## Panel order

Panels follow the order the values appear in the data. Pass `fxDomain` / `fyDomain` to fix it — including which panels exist at all:

```svelte
<Chart {data} fx="sex" fxDomain={['female', 'male', 'NA']}>
```

## Spacing

`facet.padding` is the gap between panels, as a fraction of a panel's size — so it scales with the chart rather than being a fixed pixel gutter. It defaults to `0.1`:

```svelte
<Chart {data} fx="species" facet={{ padding: 0.2 }}>
```

Set `paddingX` / `paddingY` to space the columns and rows differently, and `0` to butt the panels together:

```svelte
<Chart {data} fx="species" fy="sex" facet={{ paddingX: 0.2, paddingY: 0 }}>
```

:example{ component="Chart" name="facet-spacing" }

The gap is _between_ panels only — the grid spans the full plot area, so space around it is the chart's own `padding`.

## Axes and labels

Axes place themselves on the grid's **outer edge** — a `left` axis on the leftmost column, a `bottom` axis on the last row — so interior panels don't redraw the same ticks. Set `facetAll` on an `Axis` to draw one in every panel instead:

```svelte
<Axis placement="left" facetAll />
```

`fx` and `fy` are scales, so the panel headers are **axes over them** — drawn once across the top and down the right, not once per panel. Configure them with `Axis` props, or remove them:

```svelte
<Chart {data} fx="species" facet={{ axis: { format: (d) => d.toUpperCase() } }}>
<Chart {data} fx="species" facet={{ axis: false }}>
```

## Composed charts

Faceting is applied by the layer, not by the default layout, so a hand-composed chart facets too — with no `<Facet>` of your own:

```svelte
<Chart {data} x="bill_length_mm" y="body_mass_g" fx="species">
	{#snippet children()}
		<Svg>
			<Grid y />
			<Axis placement="left" />
			<Axis placement="bottom" />
			<Circle cx="bill_length_mm" cy="body_mass_g" r={2.5} />
		</Svg>
	{/snippet}
</Chart>
```

:example{ component="Chart" name="facet-composed" }

This works for `<Layer>`, `<Layer type="svg">`, and `<Svg>` / `<Canvas>` / `<Html>` used directly.

## Reading the current panel

A layer renders its children once per panel and hands each the panel it's drawing into — which is how `Axis` decides whether it's on an outer edge:

```svelte
<Svg>
	{#snippet children({ facet })}
		{#if facet.left}
			<!-- only in the leftmost column -->
		{/if}
	{/snippet}
</Svg>
```

Without `fx` / `fy` there's a single panel covering the whole plot area, so `facet` is always there to read.

The layout itself lives on the chart state as `context.facet`:

| Member                            | Description                                     |
| --------------------------------- | ----------------------------------------------- |
| `context.facet.enabled`           | Whether `fx` / `fy` partition the chart         |
| `context.facet.panels`            | Every panel, with offsets, rows, and edge flags |
| `context.facet.xScale` / `yScale` | Band scales laying the panels out               |
| `context.facet.width` / `height`  | One panel's dimensions                          |

`context.width` / `height` are that same panel box — `context.box` stays the whole plot area.

A panel itself carries:

| Member                              | Description                                              |
| ----------------------------------- | -------------------------------------------------------- |
| `fx` / `fy`                         | This panel's values, or `undefined` on an unfaceted axis |
| `column` / `row`                    | Index within the `fx` / `fy` domain                      |
| `x` / `y`                           | Offset from the plot area's origin                       |
| `width` / `height`                  | The panel's size                                         |
| `data`                              | The rows belonging to this panel                         |
| `empty`                             | Whether the panel has no rows                            |
| `left` / `right` / `top` / `bottom` | Whether the panel is on that outer edge                  |

::note
Tooltips and brushes are not facet-aware yet: they cover the whole plot area and resolve against the full dataset, so hovering a faceted chart can find a point from another panel.
::
