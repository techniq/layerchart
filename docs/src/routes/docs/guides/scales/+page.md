<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Code from '$lib/components/Code.svelte';
	import DomainRangeChart from './DomainRangeChart.svelte';

  let domain = $state([100, 400]);
  let range = $state([0, 500]);
  let value = $state(250);

  let scale = $derived(scaleLinear(domain, range));

  let scaleExample = $derived(`
    xScale(${domain[0]}) => ${scale(domain[0])};
    xScale(${domain[1]}) => ${scale(domain[1])};
    xScale(${value}) => ${format(scale(value), 'decimal')};
  `);
</script>

# Scales

## What is a scale?

At its essence, a scale is a function that maps data values (`domain`) to pixel or color values (`range`) on a per-dimension basis (`x`, `y`, `color`, etc).

LayerChart uses [d3-scale](https://d3js.org/d3-scale) under the hood, which provides many different scale types including [`scaleLinear`](https://d3js.org/d3-scale/linear), [`scaleTime`](https://d3js.org/d3-scale/time), [`scaleBand`](https://d3js.org/d3-scale/band), and [many others](https://d3js.org/d3-scale).

<DomainRangeChart bind:domain bind:range bind:value />

In this interactive example, the **domain** (top bar) represents your data values ranging from <code>{domain[0]}</code> to <code>{domain[1]}</code>, while the **range** (bottom bar) represents the pixel values from <code>{range[0]}</code> to <code>{range[1]}</code>. The animated line shows how a domain value maps to its corresponding range value. Try dragging the edges to resize the domain/range, or mouse over to see how different values map between them.

### Creating a scale

Under the hood, LayerChart creates scales for you, but here's what that looks like:

```js
const xScale = scaleLinear().domain(domain).range(range);
```

or using the shorthand syntax:

```js
const xScale = scaleLinear(domain, range);
```

With the current values, this scale would produce:

<Code source={scaleExample} language="js" />

## Automatic scale selection

LayerChart intelligently selects the appropriate scale type based on your data. You don't need to explicitly specify whether to use `scaleLinear`, `scaleTime`, or `scaleBand` — LayerChart determines this automatically by inspecting your domain values or data.

The scale selection logic works as follows:

1. **`scaleTime`** — Used when domain or data contains `Date` objects
2. **`scaleLinear`** — Used when domain or data contains numbers
3. **`scaleBand`** — Used when domain or data contains strings (categorical data)

For example:

```svelte
<!-- Automatically uses scaleTime for x-axis -->
<Chart data={timeSeriesData} x="date" y="value" />

<!-- Automatically uses scaleBand for x-axis -->
<Chart data={categoricalData} x="category" y="value" />

<!-- Automatically uses scaleLinear for both axes -->
<Chart data={numericData} x="temperature" y="pressure" />
```

You can override the automatic selection by explicitly passing a scale:

```svelte
<Chart xScale={scaleLog()} yScale={scaleSqrt()} />
```

## Automatic domain and range calculation

Within a `Chart`, the domain and range are automatically determined for you based on your data and chart dimensions:

- **`xDomain`**: The extent (min/max) of all `x` values in your data (based on the value accessor)
- **`xRange`**: The `width` of the chart (minus left/right padding)
- **`yDomain`**: The extent (min/max) of all `y` values in your data (based on the value accessor)
- **`yRange`**: The `height` of the chart (minus top/bottom padding)

For most continuous scales like `scaleLinear`, the domain and range are specified as two-element arrays representing the minimum and maximum values.

### Overriding domain and range

You can override the automatic calculation by providing explicit values. If you want LayerChart to calculate one of the extent values, pass `null` for that position:

```svelte
<Chart yDomain={[0, null]} />
```

This sets a minimum y-domain value of `0` (regardless of your smallest data value) while letting LayerChart calculate the maximum value based on your data. This is useful when you want to ensure your y-axis always starts at zero.

You can also specify both values to have complete control:

```svelte
<Chart xDomain={[0, 100]} yDomain={[0, 1000]} />
```

## Scale types

LayerChart supports all d3-scale types:

- **Continuous scales**: Map continuous domains to continuous ranges
  - [`scaleLinear`](https://d3js.org/d3-scale/linear): Linear mapping (most common)
  - [`scaleLog`](https://d3js.org/d3-scale/log): Logarithmic mapping
  - [`scalePow`](https://d3js.org/d3-scale/pow): Power (exponential) mapping
  - [`scaleTime`](https://d3js.org/d3-scale/time): Time-based mapping with calendar intervals

- **Discrete scales**: Map discrete domains to discrete or continuous ranges
  - [`scaleBand`](https://d3js.org/d3-scale/band): For bar charts and categorical data
  - [`scalePoint`](https://d3js.org/d3-scale/point): For scatter plots with categorical data
  - [`scaleOrdinal`](https://d3js.org/d3-scale/ordinal): General categorical mapping

- **Sequential scales**: Map continuous domains to interpolated color schemes
  - [`scaleSequential`](https://d3js.org/d3-scale/sequential): For heatmaps and choropleth maps

See the [d3-scale documentation](https://d3js.org/d3-scale) for a complete reference.

## Ticks

Scales provide a `.ticks()` method that generates human-readable reference values at regular intervals. LayerChart uses these for axis labels and grid lines. You can customize the number of ticks or provide explicit tick values.

Learn more: [Scale Ticks (Observable)](https://observablehq.com/@d3/scale-ticks?collection=@d3/d3-scale)

## Useful resources

- [d3-scale documentation](https://d3js.org/d3-scale)
- [Introducing d3-scale](https://medium.com/@mbostock/introducing-d3-scale-61980c51545f 'https://medium.com/@mbostock/introducing-d3-scale-61980c51545f')
- [D3 in Depth: D3 Scale functions](https://www.d3indepth.com/scales/)
- [https://scottmurray.org/tutorials/d3/scales](https://scottmurray.org/tutorials/d3/scales 'https://scottmurray.org/tutorials/d3/scales')
- [https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/](https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/ 'https://jckr.github.io/blog/2011/08/11/d3-scales-and-color/')
- https://observablehq.com/@d3/continuous-scales?collection=@d3/d3-scale
