---
title: Structure
order: 4
---

<script lang="ts">
	const layers = [
		{ name: 'tooltip', types: ['snippet'], indent: 0 },
		{ name: 'legend', types: ['prop', 'snippet'], indent: 0 },
		{ name: 'aboveContext', types: ['snippet'], indent: 0 },
		{ name: 'Layer (Svg / Canvas / Html)', indent: 1 },
		{ name: 'annotations', types: ['prop'], indent: 2 },
		{ name: 'highlight', types: ['prop', 'snippet'], indent: 2 },
		{ name: 'labels', types: ['prop', 'snippet'], indent: 2 },
		{ name: 'points', types: ['prop', 'snippet'], indent: 2 },
		{ name: 'rule', types: ['prop', 'snippet'], indent: 2 },
		{ name: 'axis', types: ['prop', 'snippet'], indent: 2 },
		{ name: 'aboveMarks', types: ['snippet'], indent: 2 },
		{ name: 'marks — Spline, Bars, Area, etc.', types: ['snippet'], indent: 2 },
		{ name: 'belowMarks', types: ['snippet'], indent: 2 },
		{ name: 'grid', types: ['prop', 'snippet'], indent: 2 },
		{ name: 'belowContext', types: ['snippet'], indent: 0 },
	];
</script>

Understanding how `<Chart>` is structured helps you place components in the right spots, enable or disable built-in features, and choose between composing from scratch or using a simplified chart.

## Render layout

`<Chart>` renders its visual content through a series of **snippets**, each targeting a specific layer in the render order. From bottom to top:

<div class="text-xs font-mono not-prose flex flex-col -space-y-px">
	{#each layers as layer}
		{@const ml = layer.indent === 1 ? 'ml-4' : layer.indent === 2 ? 'ml-8' : ''}
		<div class="border border-surface-content/15 {ml} px-3 py-1.5 bg-surface-content/5 text-surface-content/40">
			{layer.name}
			{#each layer.types ?? [] as type}
				{#if type === 'prop'}
					<span class="text-[10px] border border-surface-content/30 text-surface-content/50 rounded px-1 py-0.5 ml-1 font-sans">{type}</span>
				{:else}
					<span class="text-[10px] border border-primary/30 text-primary/60 rounded px-1 py-0.5 ml-1 font-sans">{type}</span>
				{/if}
			{/each}
		</div>
	{/each}
</div>

### Snippet reference

All snippets receive `{ context }` — the full `ChartState`:

| Snippet        | Location                           | Use case                                                    |
| -------------- | ---------------------------------- | ----------------------------------------------------------- |
| `children`     | Replaces the entire default layout | Full custom rendering — bypasses all built-in components    |
| `belowContext` | Below the Layer                    | HTML elements beneath the chart (custom legends, controls)  |
| `belowMarks`   | Inside Layer, before marks         | Reference lines, background shading, annotations under data |
| `marks`        | Inside Layer, main content area    | Your data marks — Spline, Bars, Area, Points, etc.          |
| `aboveMarks`   | Inside Layer, after marks          | Overlays, custom highlights, labels on top of data          |
| `aboveContext` | Above the Layer                    | HTML overlays on top of the chart                           |

```svelte
<Chart {data} x="date" y="value">
	{#snippet belowMarks({ context })}
		<Rect x={0} y={0} width={context.width} height={context.height} fill="#f0f0f0" />
	{/snippet}

	{#snippet marks({ context })}
		<Spline />
		<Area fillOpacity={0.1} />
	{/snippet}

	{#snippet aboveMarks({ context })}
		<Labels />
	{/snippet}
</Chart>
```

### The `children` snippet

If you provide `children`, the entire default layout is replaced. You take full control — no Grid, Axis, Rule, or Tooltip unless you add them:

```svelte
<Chart {data} x="date" y="value">
	{#snippet children({ context })}
		<Svg>
			<Spline />
		</Svg>
	{/snippet}
</Chart>
```

Most of the time, you should use `marks` instead of `children` to keep the built-in features while adding your own data marks.

## Default features

`<Chart>` includes several components by default. Each can be toggled on or off, configured with props, or fully replaced with a snippet:

| Feature          | Default | Description                      |
| ---------------- | ------- | -------------------------------- |
| `axis`           | `true`  | X and Y axes                     |
| `grid`           | `true`  | Background grid lines            |
| `rule`           | `true`  | Zero-line rule on the value axis |
| `highlight`      | `true`  | Hover highlight                  |
| `points`         | `false` | Point markers on data            |
| `labels`         | `false` | Data labels                      |
| `legend`         | `false` | Legend                           |
| `tooltipContext` | `false` | Tooltip (opt-in)                 |
| `brush`          | `false` | Brush/selection (opt-in)         |

### Three ways to configure each feature

Every feature accepts three forms:

::steps

## Boolean — toggle on/off with defaults

```svelte
<Chart {data} x="date" y="value" legend points />
```

## Props object — customize the component

```svelte
<Chart {data} x="date" y="value" axis="x" grid={{ x: false }} legend={{ placement: 'top' }} />
```

## Snippet — full control over rendering

```svelte
<Chart {data} x="date" y="value">
	{#snippet legend({ context })}
		<Legend placement="top" tickFormat={(s) => s.toUpperCase()} />
	{/snippet}
</Chart>
```

::

### Fine-tuning with `props`

The `props` object lets you pass additional props to internally rendered components without fully overriding them via snippets:

```svelte
<Chart
	{data}
	x="date"
	y="value"
	props={{
		grid: { strokeDasharray: '4 2' },
		xAxis: { tickCount: 5 },
		tooltip: { header: { format: 'date' } },
		spline: { curve: curveCatmullRom }
	}}
/>
```

This is especially useful with simplified charts where the internal marks are rendered for you.

## Simplified charts

Simplified charts (`LineChart`, `BarChart`, `AreaChart`, `ScatterChart`, `PieChart`, `ArcChart`) are pre-configured `<Chart>` wrappers that provide sensible defaults for common chart types.

### What simplified charts do for you

- Select the right mark component (Spline for lines, Bars for bars, etc.)
- Set appropriate tooltip mode (`quadtree-x` for lines, `band` for bars, etc.)
- Configure axis, grid, rule, and highlight defaults for the chart type
- Create a default single series when `series` is not provided
- Handle orientation, value axis, and scale selection

### Comparison

The same multi-series line chart built two ways:

**Using `<LineChart>`:**

```svelte
<LineChart
	{data}
	x="date"
	series={[
		{ key: 'apples', color: 'red' },
		{ key: 'oranges', color: 'orange' }
	]}
	legend
/>
```

**Using `<Chart>` directly:**

```svelte
<Chart
	{data}
	x="date"
	y={['apples', 'oranges']}
	series={[
		{ key: 'apples', color: 'red' },
		{ key: 'oranges', color: 'orange' }
	]}
	tooltipContext={{ mode: 'quadtree-x' }}
	yBaseline={0}
	yNice
	legend
	highlight={{ lines: true, points: true }}
>
	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Spline seriesKey={s.key} />
		{/each}
	{/snippet}
</Chart>
```

A stacked bar chart comparison:

**Using `<BarChart>`:**

```svelte
<BarChart
	{data}
	x="category"
	series={[
		{ key: 'q1', color: 'steelblue' },
		{ key: 'q2', color: 'coral' }
	]}
	seriesLayout="stack"
	legend
/>
```

**Using `<Chart>` directly:**

```svelte
<Chart
	{data}
	x="category"
	xScale={scaleBand()}
	xDomain={data.map((d) => d.category)}
	y={['q1', 'q2']}
	yBaseline={0}
	series={[
		{ key: 'q1', color: 'steelblue' },
		{ key: 'q2', color: 'coral' }
	]}
	seriesLayout="stack"
	tooltipContext={{ mode: 'band' }}
	legend
	highlight={{ area: true }}
>
	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Bars seriesKey={s.key} />
		{/each}
	{/snippet}
</Chart>
```

### Escape hatches

Simplified charts accept the same snippets as `<Chart>`. When you need to customize beyond what props offer, use a snippet to override just that part:

```svelte
<LineChart {data} x="date" y="value" legend>
	{#snippet marks({ context })}
		{#each context.series.visibleSeries as s (s.key)}
			<Spline seriesKey={s.key} curve={curveCatmullRom} />
		{/each}
	{/snippet}

	{#snippet legend({ context })}
		<Legend placement="top" tickFormat={(s) => s.toUpperCase()} />
	{/snippet}
</LineChart>
```

The `marks` snippet replaces the default mark rendering while keeping all other features (axis, grid, tooltip, highlight) intact.

### When to use which

| Use a simplified chart when...               | Use `<Chart>` directly when...                               |
| -------------------------------------------- | ------------------------------------------------------------ |
| Building a standard chart type               | Combining multiple mark types (line + area + points)         |
| You want sensible defaults with minimal code | You need full control over render order                      |
| Customization fits within props + snippets   | Building non-standard visualizations (sankey, treemap, etc.) |
| Prototyping quickly                          | Using radial, hierarchical, or geographic layouts            |

## Related guides

- [State overview](/docs/guides/state) — ChartState, sub-states, and how to access context
- [Data](/docs/guides/data) — Data patterns, accessors, and performance
- [Series](/docs/guides/series) — Multi-series charts, stacking, and legend integration
- [Scales](/docs/guides/scales) — Scale types, domains, ranges, and overrides
- [Layers](/docs/guides/layers) — SVG, Canvas, and HTML rendering
- [Tooltip](/docs/guides/tooltip) — Tooltip modes and customization
