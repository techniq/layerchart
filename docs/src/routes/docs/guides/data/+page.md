<script lang="ts">
  import Example from '$lib/components/Example.svelte';
</script>

# Data

LayerChart supports passing data in a variety of ways including:

- Chart
  ```svelte
  <Chart data={...}>
  ```
- Per-series
  ```svelte
  <Chart series={[...]}>
  ```
- Per-mark
  ```svelte
  <Spline data={...}>
  ```

all supporting single and multiple marks per Chart.

## Chart data

### Single mark

<Example component="Chart" name="data-chart-single" showCode />

### Multiple marks

<Example component="Chart" name="data-chart-multi" showCode />

> TODO: improve tooltip, legend support without requiring series
> TODO: do not require passing in `y={[...]}` as well

## Marks data

> Can also provide accessors Spline. Currently need to pass overall chart data (or series) (see next)

```svelte
<Chart
  {data}
  x="date"
  y="value"
>
  {#snippet marks()}
	  <Spline data={[{ year: 2025, value: 10 }, ...]} />
  {/snippet}
</Chart>
```

> TODO: need to support adding marks data to overall Chart context (implicit series?)

Similar to SveltePlot

```svelte
<Chart>
  {#snippet marks()}
	  <Spline data={[{ year: 2025, value: 10 }, ...]} x="date" y="value" />
  {/snippet}
</Chart>
```

## Series

- useful to define common color (for marks, legend, tooltip)
  - define key, color, label (optional), data (optional)
- can simplify by passing series props (not needing custom marks)
  - debatable?
- Passing `series.data` instead of `<Spline {data}>` might be faster (don't have to wait for all components to register on the context before determining the extents (scales, axis, etc))

### Unified data with per-series values

A single data array with per-series values as separate properties

<Example component="Chart" name="data-series-chart-data" showCode />

### Per-series data

Each series has it's own data

<Example component="Chart" name="data-series-separate-data" showCode />
