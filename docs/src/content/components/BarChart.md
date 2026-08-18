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

`seriesLayout` picks one or the other, but a sub-band does both: `x1` (or `y1` when horizontal) puts each group in its own slot within the band, and the series stack within each group rather than sharing one running total.

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

:example{ name="group-stack-series" showCode }

:example{ name="group-stack-series-horizontal" showCode }

Each row carries its band value, its group, and a column per stacked series — so one row per `year` × `basket` here.

### Grouping long data

Without `series` to stack, `x1` groups on its own — one bar per `x1` value within each band, from rows that already carry their category. Nothing has to be pivoted into a column per series first, and the tooltip lists the band's rows:

```svelte
<BarChart {data} x="year" x1="fruit" y="value" seriesLayout="group" c="fruit" />
```

:example{ name="group-long-data" showCode }

## Fixed width

Use `width` or `height` on bars to override the scale-derived size with a fixed pixel value. The bar is centered within its band.

:example{ name="vertical-fixed-width" showCode }
