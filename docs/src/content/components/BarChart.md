---
description: Streamlined visualization displaying categorical data using rectangular bars whose lengths represent the values of each category.
category: charts
layers: [svg, canvas, html]
related: [Chart, Bars]
---

## Usage

:example{ name="vertical-default" showCode }

:::tip
See also: [Axis](/docs/components/Axis) for examples of using time scale axes with bar charts
:::

## Grouped and stacked

`series` names a column per series, and `seriesLayout` decides how they share the band. Two or more of them stack unless told otherwise — the default stacks about zero, so negative values run downward rather than continuing the total.

```svelte
<BarChart
	{data}
	x="year"
	series={[{ key: 'apples' }, { key: 'bananas' }, ...]}
	seriesLayout="group"
/>
```

`seriesLayout="group"` gives each series its own slot within the band, so they're compared side by side:

:example{ name="group-series" }

`seriesLayout="stack"` gives them one running total instead, so the band's full height is their sum — what happens by default without a `seriesLayout`, except that it stacks every value in the same direction:

:example{ name="stack-series" }

A sub-band does both: `x1` (or `y1` when horizontal) puts each group in its own slot within the band, and the series stack within each group rather than sharing one running total.

```svelte
<BarChart
	{data}
	x="year"
	x1="basket"
	x1Scale={scaleBand().padding(0.1)}
	x1Range={({ xScale }) => [0, xScale.bandwidth()]}
	series={[{ key: 'apples' }, { key: 'bananas' }, ...]}
	seriesLayout="stack"
/>
```

:example{ name="group-stack-series" }

`orientation="horizontal"` swaps the axes, with `y1` as the sub-band and the series stacking to the right:

:example{ name="group-stack-series-horizontal" }

Each row carries its band value, its group, and a column per stacked series — so one row per `year` × `basket` here.

### Grouping long data

Without `series` to stack, `x1` groups on its own — one bar per `x1` value within each band, from rows that already carry their category. Nothing has to be pivoted into a column per series first, the tooltip lists the band's rows, and `legend` reads the categories off the `c` scale — hovering an item fades the rest, clicking one filters to it:

```svelte
<BarChart {data} x="year" x1="fruit" y="value" seriesLayout="group" c="fruit" legend />
```

:example{ name="group-long-data" }

Or stack it — `c` names the layers, so nothing has to be declared:

```svelte
<BarChart {data} x="year" y="value" c="fruit" legend />
```

:example{ name="stack-long-data" }

## Fixed width

Use `width` or `height` on bars to override the scale-derived size with a fixed pixel value. The bar is centered within its band.

:example{ name="vertical-fixed-width" }
