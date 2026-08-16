---
title: Facets (Small multiples)
category: state
---

Faceting partitions the data into a grid of panels, one per distinct value, and draws the same chart in each. The **position scales stay shared across every panel**, which is what makes them comparable — the point of small multiples over a row of separate charts.

Facet when the panels measure the **same thing** split by a category. When they measure _different_ things that share an axis — requests, latency, and errors over the same dates — reach for [`ChartGroup`](/docs/guides/chart-group#group-or-facets) instead. The two compose: a faceted chart can be a group member.

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

## Colouring by panel

`fx` / `fy` are ordinary data properties, so a mark colours by one the same way it colours by anything else — `fill` (or `stroke`) naming the property, resolved through the chart's `c` scale:

```svelte
<Chart {data} fx="species" c="species" cRange={[...]}>
	{#snippet marks()}
		<Circle cx="flipper_length_mm" cy="body_mass_g" fill="species" />
	{/snippet}
</Chart>
```

:example{ component="Chart" name="facet-color" }

The `c` domain is built from the whole dataset, so the colours are stable regardless of which rows land in which panel. A legend is usually redundant here — the panel headers already name each colour.

To style the panel _itself_ rather than its rows — a tinted background, a rule, anything not per-row — take the panel from the layer and read `fx` / `fy` off it:

```svelte
{#snippet children({ context })}
	<Svg>
		{#snippet children({ facet })}
			<Rect
				width={facet.width}
				height={facet.height}
				fill={context.cScale?.(facet.fx)}
				opacity={0.05}
			/>
		{/snippet}
	</Svg>
{/snippet}
```

## Annotating one panel

The `marks` snippet (and the rest rendered inside the layer) is handed the panel it's drawing, so a mark can appear in a single panel — a note that belongs to one group rather than all of them:

```svelte
{#snippet aboveMarks({ context, facet })}
	{#if facet.fy === 'Adelie'}
		<Text value="Adelie penguins were observed on all three islands." x={context.width - 6} y={6} />
	{/if}
{/snippet}
```

:example{ component="Chart" name="facet-annotation" }

Stacked series stack within their own panel too, so a category appearing in several panels keeps a separate total in each.

## Wrapping into a grid

A one-dimensional facet can be wrapped into a grid by making `fx` the column and `fy` the row — the index of the value divided by the number of columns, as [Observable Plot does](https://observablehq.com/@observablehq/plot-facet-wrap):

```svelte
<script>
	const columns = 3;
	const column = (d) => industries.indexOf(d.industry) % columns;
	const row = (d) => Math.floor(industries.indexOf(d.industry) / columns);
</script>

<Chart {data} fx={column} fy={row} facet={{ axis: false }}>
```

:example{ component="Chart" name="facet-wrap" }

The `fx` / `fy` headers are grid positions rather than names, so they're turned off and each panel labels itself from the panel it's given.

## Tooltips

The pointer resolves the panel it's over, then finds the row within _that_ panel — so equal values in neighbouring panels stay distinct, in every mode (`bisect-*`, `quadtree*`, `bounds` / `band`, `voronoi`).

`Highlight` stays in that panel too — crosshair, point, and area all mark the row being shown. (Its `lines` draw one crosshair by default, on `x`; a scatter usually wants `axis="both"`, which `ScatterChart` sets for you.)

:example{ component="Chart" name="facet-tooltip" }

### One tooltip per panel

`facetAll` on the highlight and the tooltip marks and labels the hovered _position_ in every panel, each resolving its own value there:

```svelte
<LineChart
	{data}
	fx="region"
	highlight={{ lines: true, points: true, facetAll: true }}
	props={{ tooltip: { root: { facetAll: true } } }}
/>
```

:example{ component="ChartGroup" name="faceted-member" }

Panels with nothing at that position draw no point and no tooltip — the crosshair still marks the position, since that's a place rather than a row. A hand-composed chart sets it on the tooltip directly: `<Tooltip.Root facetAll />`.

The two are independent, so a grid with many panels can take the crosshair everywhere while keeping a single tooltip — `highlight={{ facetAll: true }}` without the tooltip half, as [facet wrap](#wrapping-into-a-grid) does.

To build the rows yourself — a single tooltip listing every panel, say — `panelDatum(context, panel, row)` gives a panel's row at the same position, or `undefined` when it has none. It's the facet counterpart of `findDatumByValue`, which is how a [`ChartGroup`](/docs/guides/chart-group) member resolves another chart's pointer.

::note
A faceted chart resolves tooltips against the rows the panels were partitioned from — the chart's `data`. Marks given their own `data` aren't part of that partition, so their points are not found by the pointer.
::

## Brushing

A brush gesture belongs to the panel it starts in, so the range it produces is read from that panel's coordinates. What it produces is a range of the _shared_ scales, though — so the selection applies to every panel, and is drawn in each of them.

Zooming to a selection leaves rows outside the new domain positioned outside their panel, where they'd otherwise be drawn over the neighbouring one. `Chart`'s default layout clips its marks while brushing, and `ChartClipPath` sizes itself to the panel, so this is handled for you.

A hand-composed chart clips what it chooses to — wrap the marks that should stay inside the panel, leaving axes and grids out of it:

```svelte
<Svg>
	<Axis placement="left" />
	<ChartClipPath>
		<Circle cx="flipper_length_mm" cy="body_mass_g" />
	</ChartClipPath>
</Svg>
```

:example{ component="Chart" name="facet-brush" }

::note
Zooming with `transform` isn't facet-aware yet — a pan or pinch moves the whole plot rather than the panel under the pointer. Brushing with `zoomOnBrush` is the way to zoom a faceted chart today.
::

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
| `has(row)`                          | Whether a row belongs to this panel, by `fx` / `fy`      |
