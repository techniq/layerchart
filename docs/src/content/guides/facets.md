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

A faceted chart carries two kinds of axis, and they behave differently.

### Data axes

The ones measuring `x` and `y` belong to the panels. They place themselves on the grid's **outer edge** — a `left` axis on the leftmost column, a `bottom` axis on the last row — so interior panels don't redraw the same ticks. On a 3 × 3 grid that's three of each, not nine.

Set `facetAll` on an `Axis` to draw one in every panel instead — all nine:

```svelte
<Axis placement="left" facetAll />
```

### Panel headers

The labels naming each column and row are a different thing. `fx` and `fy` are scales, so the headers are **axes over those scales** — one across the top and one down the right, for the whole grid. There is one of each however many panels there are, so `facetAll` doesn't apply to them.

Configure them with `Axis` props, or remove them:

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

## Grouped bars

A band scale inside each panel makes a grouped bar chart, with the panel doing the grouping rather than an offset within a band — a column per group, a bar per value inside it:

```svelte
<BarChart {data} x="year" y="percent" fx="party" c="party" cRange={[...]} />
```

:example{ component="Chart" name="facet-bars" }

Hovering a panel gives one bar by default. `tooltipContext={{ mode: 'facet' }}` gives the group instead — see [bands inside panels](#bands-inside-panels).

`seriesLayout="group"` on a [`BarChart`](/docs/components/BarChart) does the same job from wide data, one column per key. Facet instead when the data is long, when the groups want their own labels, or when the inner bars are a scale of their own rather than a fixed set of series.

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

A one-dimensional facet can be wrapped into a grid by making `fx` the column and `fy` the row — the index of the value divided by the number of columns:

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

### Bands inside panels

A band scale inside a panel can be read two ways, and `mode` says which.

`band`, what the bar charts default to, resolves to a bar — a full-height target over its column, so the pointer doesn't have to find a short bar. `facet` widens that to the panel around it: the highlight marks the whole panel and the tooltip lists its rows. The panel groups the way `x1` / `y1` do inside a band, with the scale inside it as the sub-band.

```svelte
<!-- a bar per hover: its own value, beside the panel's name -->
<BarChart {data} x="month" fx="region" />

<!-- the panel per hover: every row it holds -->
<BarChart {data} x="year" fx="party" tooltipContext={{ mode: 'facet' }} />
```

A few bars to a panel is what `facet` is for — [grouped bars](#grouped-bars) read as groups when hovering a party gives both its years at once:

:example{ component="Chart" name="facet-bars" }

A dozen bars to a panel is what it isn't:

:example{ component="Chart" name="facet-brush-band" }

Configured `series` rule the grouping out even in `facet` mode — each row then carries the whole set rather than one sub-band's share of it, so a band already _is_ a row, and one target over the panel would resolve every hover in it to the panel's first row.

### Naming the panel

A band value alone names a row in every panel — three panels each have a `Torgersen` — so the tooltip puts the panel in front of it: `Adelie · Torgersen`.

Where the panel _is_ what the pointer resolves to, that name is the header on its own. Either way `facet.tooltip` is what says it:

```svelte
<!-- the panel facets on position, and carries its name on the row -->
<Chart {data} fx={column} fy={row} facet={{ tooltip: (d) => d.industry }}>

<!-- or leave the header to the value alone -->
<Chart {data} fx={column} fy={row} facet={{ tooltip: false }}>
```

Panel headers are `facet.axis`'s to draw, separately — a wrapped grid usually turns those off and labels its panels itself, and this is the same question asked of the tooltip.

::note
`quadtree` and `voronoi` tooltips head their list with the series rather than a value, so there's nowhere for the panel to go — `ScatterChart` and hand-composed point charts are unaffected by this option.
::

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

:example{ component="ChartGroup" name="faceted-group" }

Panels with nothing at that position draw no point and no tooltip — the crosshair still marks the position, since that's a place rather than a row. A hand-composed chart sets it on the tooltip directly: `<Tooltip.Root facetAll />`.

The two are independent, so a grid with many panels can take the crosshair everywhere while keeping a single tooltip — `highlight={{ facetAll: true }}` without the tooltip half, as [facet wrap](#wrapping-into-a-grid) does.

To build the rows yourself — a single tooltip listing every panel, say — `panelDatum(context, panel, row)` gives a panel's row at the same position, or `undefined` when it has none. It's the facet counterpart of `findDatumByValue`, which is how a [`ChartGroup`](/docs/guides/chart-group) member resolves another chart's pointer.

::note
A faceted chart resolves tooltips against the rows the panels were partitioned from — the chart's `data`. Marks given their own `data` aren't part of that partition, so their points are not found by the pointer.
::

## Brushing

A brush gesture belongs to the panel it starts in, so the range it produces is read from that panel's coordinates. What it produces is a range of the _shared_ scales, though — so the selection applies to every panel, and is drawn in each of them.

That shared range is what makes a faceted brush worth having: it lets the panels answer one question together. `contains()` asks whether a point falls inside the selection, and a gesture drawn over one panel picks out the matching rows in all of them:

```svelte
{@const isSelected = context.brush.contains({ x: d.flipper_length_mm, y: d.body_mass_g })}
```

:example{ component="Chart" name="facet-brush" }

It takes domain values rather than the row itself, so each point is asked about with the same accessors the chart was given. An axis with no selection is unconstrained — an inactive brush contains everything, so nothing is singled out until a gesture is made.

### Zooming to the selection

`zoomOnBrush` applies the selection instead of leaving it to be read: the range becomes the panels' new domain, and the brush clears.

That leaves the rows outside the new domain positioned outside their panel, where they'd otherwise be drawn over the neighbouring one. `Chart`'s default layout clips its marks while brushing, and `ChartClipPath` sizes itself to the panel, so this is handled for you.

A hand-composed chart clips what it chooses to — wrap the marks that should stay inside the panel, leaving axes and grids out of it:

```svelte
<Svg>
	<Axis placement="left" />
	<ChartClipPath>
		<Circle cx="flipper_length_mm" cy="body_mass_g" />
	</ChartClipPath>
</Svg>
```

:example{ component="Chart" name="facet-brush-zoom" }

::note
Zooming with `transform` isn't facet-aware yet — a pan or pinch moves the whole plot rather than the panel under the pointer. Brushing with `zoomOnBrush` is the way to zoom a faceted chart today.
::

### Summarising the selection

A [`ChartGroup`](/docs/guides/chart-group) carries the same test to a chart drawn on other scales. The group publishes the selection in the _publisher's_ domain values, so a summary asks about its rows with the faceted chart's accessors rather than with its own:

```svelte
{@const selected = data.filter((d) =>
	group.brush.contains({ x: d.flipper_length_mm, y: d.body_mass_g })
)}
```

:example{ component="Chart" name="facet-brush-summary" }

### Categories

Brushing a band scale snaps to whole categories, and the run it selects is the same run in every panel.

Which categories those are is a question about _positions_: `brush.x` holds the first and last of them, and the ones between are the ones the domain puts between — not the ones that sort between, which is what `contains()` would compare.

```ts
const [first, last] = brush.x.map((month) => months.indexOf(month));
const selected = months.slice(Math.min(first, last), Math.max(first, last) + 1);
```

:example{ component="Chart" name="facet-brush-band" }

### Driving the panels from elsewhere

The brush needn't live in a panel at all. An overview beside the facets can own it, with the panels narrowing to what it selects:

:example{ component="Chart" name="facet-brush-overview" }

::note
Narrow the panels by filtering the rows rather than by `xDomain` alone. A domain narrower than the data leaves the rows outside it positioned outside their panel, drawn over the neighbouring one — the panel clip that prevents this is on while a chart is brushing or transforming, and a chart driven from elsewhere is doing neither.
::

## Composed charts

Faceting is applied by the layer, not by the default layout, so a hand-composed chart facets too — with no `<Facet>` of your own:

```svelte
<Chart {data} x="bill_length_mm" y="body_mass_g" fx="species">
	<Svg>
		<Grid y />
		<Axis placement="left" />
		<Axis placement="bottom" />
		<Circle cx="bill_length_mm" cy="body_mass_g" r={2.5} />
	</Svg>
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
