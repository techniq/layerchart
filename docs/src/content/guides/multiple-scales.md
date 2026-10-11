---
title: Multiple Scales (Dual axis)
category: state
---

A chart has one `y` scale, so every mark is measured against the same axis. Plotting two measures on one chart — sales and fuel efficiency, energy and a percentage — takes one of a few approaches, depending on whether the measures share units and how much of the chart they need to share.

## Choosing an approach

|                                                     | Scales                      | Tooltip & highlight            | Use when                                                            |
| --------------------------------------------------- | --------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| [One scale, extra marks](#one-scale-extra-marks)    | one                         | one, covers every mark         | the measures share units                                            |
| [Remapped onto one scale](#remapped-onto-one-scale) | one, plus a hand-built axis | one, covers every mark         | different units, one chart's interactions                           |
| [Overlaid charts](#overlaid-charts)                 | one per chart               | per chart, synced with a group | different units, and each measure needs its own range or chart type |
| [Side by side](#side-by-side)                       | one per chart               | per chart, synced with a group | the measures don't need to share a plot                             |

A second axis invites readers to compare where two lines cross or which bar is taller, though both depend on the domains you picked. When the measures don't need to share a plot, [side by side](#side-by-side) avoids that.

## One scale, extra marks

When the measures share units — a stack of sales and a sales target — there is no second scale. Draw the extra mark from its own accessor and the domain covers it:

```svelte
<Chart {data} x="month" series={[{ key: 'apples' }, { key: 'bananas' }, { key: 'cherries' }]}>
	{#snippet children({ context })}
		<Layer>
			{#each context.series.visibleSeries as s (s.key)}
				<Bars seriesKey={s.key} />
			{/each}
			<Spline y="target" />
		</Layer>
	{/snippet}
</Chart>
```

:example{ component="Chart" name="mixed-marks-with-stack" }

Simplified charts take extra marks through `aboveMarks` / `belowMarks`:

:example{ component="Chart" name="compound-common-scale-with-extra-marks" }

## Remapped onto one scale

Map the second measure into the first measure's domain, so it's drawn against the same `y` scale, then draw its axis with a scale of its own. One chart means one tooltip, one highlight, and one legend.

On `Chart`, `y1` with `y1Range={({ yScale }) => yScale.domain()}` does the mapping — `context.y1Scale` turns an efficiency into its equivalent in sales:

```svelte
<Chart {data} x="year" y="sales" y1="efficiency" y1Range={({ yScale }) => yScale.domain()}>
	{#snippet children({ context })}
		<Layer>
			<Axis placement="left" />
			<Axis placement="right" scale={scaleLinear(context.y1Scale.domain(), [context.height, 0])} />
			<Spline />
			<Spline y={(d) => context.y1Scale(d.efficiency)} />
		</Layer>
	{/snippet}
</Chart>
```

:example{ component="Chart" name="compound-dual-axis-with-single-chart-using-remapped-scale" }

`y1` is also the sub-band of horizontal grouped bars, so on a simplified chart build the mapping as a standalone scale and use it as a series `value`. Set `yDomain` from the first measure alone, or the remapped series widens it:

```svelte
<script>
	const yScale = scaleLinear()
		.domain([0, max(data, (d) => d.energy)])
		.nice();
	const efficiencyScale = scaleLinear()
		.domain([0, max(data, (d) => d.efficiency)])
		.nice();
	const efficiencyToY = scaleLinear().domain(efficiencyScale.domain()).range(yScale.domain());
</script>

<BarChart
	{data}
	x="month"
	yDomain={yScale.domain()}
	series={[{ key: 'energy' }, { key: 'efficiency', value: (d) => efficiencyToY(d.efficiency) }]}
	seriesLayout="group"
/>
```

:example{ component="BarChart" name="group-series-dual-axis" }

The tooltip reads each series' `value`, so it would show the remapped number — write a `tooltip` snippet that reads the original field.

## Overlaid charts

Stack two charts in the same grid cell, each with its own scales, marks, and axis. Each measure can have its own range — rainfall hanging from the top while flows rise from the bottom — or its own chart type.

```svelte
<ChartGroup>
	<div class="grid grid-stack">
		<Chart {data} x="year" y="sales" {padding} height={300}>...</Chart>
		<Chart {data} x="year" y="efficiency" {padding} height={300}>...</Chart>
	</div>
</ChartGroup>
```

:example{ component="Chart" name="compound-dual-axis-with-stacked-charts" }

The plot areas only line up if the charts share `height`, `padding`, and `x` domain, so set them on both. The top chart receives the pointer; wrap them in a [`ChartGroup`](/docs/guides/chart-group) and the charts underneath show their highlight too.

:example{ component="Chart" name="compound-separate-scales-with-stacked-charts-and-overridden-marks" }

:example{ component="Chart" name="compound-separate-scales-with-stacked-charts-with-inverted-range-top-down" }

## Side by side

When the measures don't need to share a plot, give each its own chart. A [`ChartGroup`](/docs/guides/chart-group#group-or-facets) keeps the pointer, brush, and zoom in step, and each chart keeps an axis that only it is read against.
