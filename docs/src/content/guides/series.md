---
title: Series (Multi-series)
category: state
---

LayerChart provides a series system for rendering multiple data series on a single chart. Each series can have its own color, data, and component props. The `SeriesState` manages visibility, highlighting, and stacking across series, and integrates with Legend and Tooltip components.

## Quick start

Pass a `series` array to any simplified chart to render multiple series:

```svelte
<LineChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	]}
/>
```

Each series `key` maps to a property in your data. The chart renders one line (or area, bar, etc.) per series.

:example{ component="LineChart" name="series" }

## Series definition

Each item in the `series` array is a `SeriesData` object:

| Property   | Type                      | Description                                                           |
| ---------- | ------------------------- | --------------------------------------------------------------------- |
| `key`      | `string`                  | **Required.** Maps to a data property or identifies the series        |
| `label`    | `string`                  | Display name (used by Legend/Tooltip). Defaults to `key`              |
| `value`    | `Accessor<TData>`         | Custom value accessor. Defaults to `key` as a property name           |
| `maxValue` | `number`                  | Maximum possible value. Useful when `data` is a single item           |
| `data`     | `TData[]`                 | Per-series data array. When set, each series can have its own data    |
| `color`    | `string`                  | Series color (used by marks, legend, and tooltip)                     |
| `selected` | `boolean`                 | Whether the series is initially visible. Defaults to `true`. Reactive |
| `props`    | `Partial<ComponentProps>` | Additional props passed to the series' rendered component             |

## Data formats

### Wide format (shared data)

The most common approach — one data array with a column per series:

```ts
const data = [
	{ date: '2024-01', apples: 100, bananas: 80, oranges: 60 },
	{ date: '2024-02', apples: 120, bananas: 90, oranges: 70 }
];
```

```svelte
<BarChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'var(--color-apples)' },
		{ key: 'bananas', color: 'var(--color-bananas)' },
		{ key: 'oranges', color: 'var(--color-oranges)' }
	]}
/>
```

:example{ component="BarChart" name="series" }

### Separate data per series

Each series can have its own `data` array. This is useful for long-format data or when series have different data points:

```svelte
<LineChart
	x="date"
	y="value"
	series={[
		{ key: 'apples', data: applesData, color: 'red' },
		{ key: 'bananas', data: bananasData, color: 'yellow' }
	]}
/>
```

When using separate data, set the `y` accessor on the chart (or `value` on each series) to tell the chart which property holds the value.

:example{ component="LineChart" name="series-separate-data" }

Separate data arrays can even have different lengths:

:example{ component="LineChart" name="series-separate-data-diff-length" }

## Layouts

The `seriesLayout` prop controls how multiple series are arranged:

| Layout             | Effect                                               |
| ------------------ | ---------------------------------------------------- |
| `'overlap'`        | Series overlap (default). Later series render on top |
| `'stack'`          | Series are stacked vertically                        |
| `'stackExpand'`    | Stacked and normalized to 100%                       |
| `'stackDiverging'` | Positive values stack up, negative values stack down |
| `'group'`          | Side-by-side within each band (bar charts only)      |

### Overlap (default)

Series render on top of each other. Useful for comparing trends:

:example{ component="BarChart" name="series" }

### Stack

Series are stacked, with each series starting where the previous one ended:

```svelte
<BarChart {data} x="year" series={[...]} seriesLayout="stack" />
```

:example{ component="BarChart" name="stack-series" }

:example{ component="AreaChart" name="series-stack" }

### Stack expand (100%)

Stacked and normalized so the total is always 100%:

:example{ component="BarChart" name="stack-series-expand" }

### Stack diverging

Positive and negative values stack in opposite directions:

:example{ component="BarChart" name="stack-series-diverging" }

### Stacking with separate data

Stacking works with per-series data arrays too. The stack is computed by aligning data across series using the x-axis key:

:example{ component="BarChart" name="series-stack-separate-data" }

### Group

Bars are placed side-by-side within each band:

:example{ component="BarChart" name="group-series" }

## Legend

Add `legend` to show a clickable legend that controls series visibility:

```svelte
<BarChart {data} x="year" series={[...]} seriesLayout="stack" legend />
```

Clicking a legend item toggles that series on or off. The chart's domain and stacking recalculate based on the visible series.

:example{ component="BarChart" name="legend-stack-series" }

:example{ component="AreaChart" name="series-stack-legend" }

## Highlighting

Hovering a legend item highlights the corresponding series and fades the others. This uses `context.series.highlightKey` which components like `Spline`, `Area`, and `Bar` read to apply opacity/saturation changes.

You can also read the highlight state in custom mark snippets:

```svelte
<LineChart {data} x="date" series={[...]} legend>
	{#snippet aboveMarks({ context })}
		{#if context.series.highlightKey}
			<Labels seriesKey={context.series.highlightKey} offset={10} />
		{/if}
	{/snippet}
</LineChart>
```

:example{ component="LineChart" name="series-labels-hover" }

## Programmatic control

Access the series state via `bind:context` to build your own series toggle UI, set initial visibility, or control series from external components.

### Custom legend

Use `context.series.selectedKeys.toggle(key)` to toggle series visibility, and `context.series.isVisible(key)` to read the current state. Call `context.series.selectedKeys.clear()` to show all series again (an empty selection means all visible):

```svelte
<script>
	let context = $state();
</script>

{#each series as s}
	<button onclick={() => context?.series?.selectedKeys?.toggle(s.key)}>
		{s.key}: {context?.series?.isVisible(s.key) ? 'visible' : 'hidden'}
	</button>
{/each}
<button onclick={() => context?.series?.selectedKeys?.clear()}>Show All</button>

<LineChart bind:context {data} x="date" {series} />
```

:example{ component="LineChart" name="series-programmatic-control" }

### Default visible series

Set `selected: false` on any series to hide it on mount. Series without `selected` (or with `selected: true`) are visible by default:

```svelte
<LineChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'red' },
		{ key: 'bananas', color: 'yellow', selected: false },
		{ key: 'oranges', color: 'orange' }
	]}
/>
```

"Bananas" starts hidden. Users can then toggle it on via the legend or programmatic controls. This is reactive — changing `selected` in the series prop will update visibility. The above example demonstrates both features together.

### Context via snippets

You can also access series state inside a Chart's `children` snippet without `bind:context`:

```svelte
<Chart {data} x="date" series={[...]}>
	{#snippet children({ context })}
		{#each context.series.visibleSeries as s}
			<span>{s.key}: {s.color}</span>
		{/each}
	{/snippet}
</Chart>
```

### Properties

| Property            | Type                           | Description                                             |
| ------------------- | ------------------------------ | ------------------------------------------------------- |
| `series`            | `SeriesData[]`                 | All series definitions                                  |
| `visibleSeries`     | `SeriesData[]`                 | Only visible (non-filtered) series                      |
| `selectedKeys`      | `SelectionState<string>`       | Selection state managing which series are visible       |
| `highlightKey`      | `string \| null`               | Currently highlighted series key                        |
| `isStacked`         | `boolean`                      | Whether a stacking layout is active                     |
| `stackLayout`       | `StackLayout`                  | Current layout mode                                     |
| `isDefaultSeries`   | `boolean`                      | True when no series prop was provided                   |
| `allSeriesData`     | `Array<TData & { seriesKey }>` | Flattened data from all series (with `seriesKey` added) |
| `visibleSeriesData` | `Array<TData & { seriesKey }>` | Flattened data from visible series only                 |
| `allSeriesColors`   | `string[]`                     | Colors from all series                                  |

### Methods

| Method                                    | Description                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `isVisible(seriesKey)`                    | Whether a series is visible (all visible when none are selected)          |
| `isHighlighted(seriesKey, defaultValue?)` | Whether a series is highlighted. Default `false` when no highlight active |
| `getStackValue(seriesKey, d)`             | Get stack `[y0, y1]` values for a data point                              |
| `getStackAccessors(seriesKey)`            | Create `{ y0, y1, value }` accessor functions for stacked layouts         |

## Per-series component props

Pass additional props to the underlying component for each series via the `props` field:

```svelte
<BarChart
	{data}
	x="date"
	series={[
		{ key: 'baseline', color: 'gray', props: { fillOpacity: 0.2 } },
		{ key: 'value', color: 'blue', props: { insets: { x: 8 } } }
	]}
/>
```

:example{ component="BarChart" name="series-data" }

## With tooltips

Simplified charts render tooltips that automatically show all series values. For individual series tooltips (e.g., quadtree-based nearest-point), use custom tooltip snippets:

:example{ component="LineChart" name="series-individual-tooltip" }

## With annotations

Annotations can be associated with a specific series via `seriesKey`. When set, the annotation is only visible when that series is highlighted:

:example{ component="LineChart" name="series-point-annotations" }

## Quick reference

| Use case                 | Configuration                                 | Example                                                                               |
| ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------- |
| Multi-series line chart  | `series={[{ key: '...' }, ...]}`              | [series](/docs/components/LineChart/series)                                           |
| Multi-series area chart  | `series={[...]}` on AreaChart                 | [series](/docs/components/AreaChart/series)                                           |
| Multi-series bar chart   | `series={[...]}` on BarChart                  | [series](/docs/components/BarChart/series)                                            |
| Stacked bars             | `series={[...]} seriesLayout="stack"`         | [stack-series](/docs/components/BarChart/stack-series)                                |
| Stacked areas            | `series={[...]} seriesLayout="stack"`         | [series-stack](/docs/components/AreaChart/series-stack)                               |
| 100% stacked             | `seriesLayout="stackExpand"`                  | [stack-series-expand](/docs/components/BarChart/stack-series-expand)                  |
| Diverging stack          | `seriesLayout="stackDiverging"`               | [stack-series-diverging](/docs/components/BarChart/stack-series-diverging)            |
| Grouped bars             | `seriesLayout="group"`                        | [group-series](/docs/components/BarChart/group-series)                                |
| Separate data per series | `series={[{ key: '...', data: [...] }, ...]}` | [series-separate-data](/docs/components/LineChart/series-separate-data)               |
| Legend with toggle       | `legend`                                      | [legend-stack-series](/docs/components/BarChart/legend-stack-series)                  |
| Highlight on hover       | `context.series.highlightKey`                 | [series-labels-hover](/docs/components/LineChart/series-labels-hover)                 |
| Programmatic control     | `bind:context` + `selectedKeys.toggle()`      | [series-programmatic-control](/docs/components/LineChart/series-programmatic-control) |
| Default visible series   | `series={[{ key: '...', selected: false }]}`  | [series-programmatic-control](/docs/components/LineChart/series-programmatic-control) |
| Per-series tooltips      | Custom tooltip snippet with `context.series`  | [series-individual-tooltip](/docs/components/LineChart/series-individual-tooltip)     |
| Scatter series           | `series={[...]}` on ScatterChart              | [series](/docs/components/ScatterChart/series)                                        |

## API reference

- [Legend](/docs/components/Legend) — legend component API and props
