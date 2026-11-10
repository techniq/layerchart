---
title: Scales
order: 5
---

<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import { Code } from '@layerstack/docs/components';
	import DomainRangeChart from './scales/DomainRangeChart.svelte';

  let domain = $state([100, 400]);
  let range = $state([0, 500]);
  let value = $state(250);

  let scale = $derived(scaleLinear(domain, range));

  let scaleExample = $derived(`
    xScale(${domain[0]}) => ${scale(domain[0])};
    xScale(${domain[1]}) => ${scale(domain[1])};
    xScale(${value}) => ${format(scale(value), 'decimal')};
  `);

  // array access (`domain[0]`) doesn't work in markdown
  let [minDomain, maxDomain] = $derived(domain);
  let [minRange, maxRange] = $derived(range);
</script>

## What is a scale?

At its essence, a scale is a function that maps data values (`domain`) to pixel or color values (`range`) on a per-dimension basis (`x`, `y`, `color`, etc).

LayerChart uses [d3-scale](https://d3js.org/d3-scale) under the hood, which provides many different scale types including [`scaleLinear`](https://d3js.org/d3-scale/linear), [`scaleTime`](https://d3js.org/d3-scale/time), [`scaleBand`](https://d3js.org/d3-scale/band), and [many others](https://d3js.org/d3-scale).

<DomainRangeChart bind:domain bind:range bind:value />

In this interactive example, the **domain** (top bar) represents your data values ranging from <code>{minDomain}</code> to <code>{maxDomain}</code>, while the **range** (bottom bar) represents the pixel values from <code>{minRange}</code> to <code>{maxRange}</code>. The animated line shows how a domain value maps to its corresponding range value. Try dragging the edges to resize the domain/range, or mouse over to see how different values map between them.

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

## Color

Color is a scale like any other. The `c` channel picks a value out of each row, `cDomain` holds the values to map, and `cRange` holds the colors they map to.

```svelte
<Chart
  {data}
  x="date"
  y="value"
  c="fruit"
  cRange={['var(--color-apples)', 'var(--color-bananas)']}
>
```

### The color channel

- **`c`**: A property name (`c="fruit"`) or an accessor function (`c={(d) => d.value > 0 ? 'gain' : 'loss'}`).
- **`cDomain`**: When `c` returns numbers, this is their extent (`[min, max]`). Otherwise it's the unique values, in the order they first appear. It's read from every row, including any a legend has hidden, so hiding a category doesn't recolor the ones that are left.
- **`cRange`**: The colors. These can be any CSS color, including `var(--color-*)`, which keeps charts in step with your theme and dark mode.
- **`cScale`**: Defaults to [`scaleOrdinal`](https://d3js.org/d3-scale/ordinal), which pairs each domain value with a color in turn. Unlike `x` and `y`, the type isn't inferred from the data, so a numeric `c` is still ordinal unless you pass a ramp or bucketing scale yourself.

The chart has no built-in palette. If `c` is set but nothing supplies colors (no `cRange`, a `cScale` with no range of its own, or `series` colors), the marks keep their [default CSS color](/docs/guides/styles#global-css-colors). The simplified charts pass a single `--color-primary` range, so `BarChart` and `ScatterChart` stay one color until you give them more.

### Choosing a color scale

Any d3 scale that returns colors works. If you pass a `cScale` that already has a range and leave out `cRange`, its range is kept.

```svelte
<script>
	import { scaleOrdinal, scaleSequential, scaleThreshold } from 'd3-scale';
	import { schemeTableau10, interpolateViridis } from 'd3-scale-chromatic';
</script>

<!-- Categorical: one color per category, from a d3 scheme -->
<Chart {data} c="species" cScale={scaleOrdinal(schemeTableau10)} />

<!-- Continuous: a ramp across the extent of `temperature` -->
<Chart {data} c="temperature" cScale={scaleSequential(interpolateViridis)} />

<!-- Thresholds: below 50, then 50 and above -->
<Chart
	{data}
	c="value"
	cScale={scaleThreshold()}
	cDomain={[50]}
	cRange={['var(--color-danger)', 'var(--color-success)']}
/>
```

`scaleQuantize`, `scaleQuantile`, `scaleDiverging` and the `sqrt`/`log` variants of the sequential scales work the same way. See [Legend](/docs/components/Legend) for one example of each, and [Styles](/docs/guides/styles#data-driven-colors) for charts built with them.

### How a mark resolves its color

Each mark uses the first of these that gives it a color:

1. **Its own `fill` / `stroke`** (see below)
2. **Its series' `color`**, when the mark draws a [series](/docs/guides/series)
3. **The chart's `c` channel**, the row's value passed through `cScale`
4. **The mark's default CSS color**, such as `--color-primary`. See [Styles](/docs/guides/styles#global-css-colors).

A `fill` or `stroke` prop is resolved like this:

| Value                                       | Resolves to                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `"#e15759"`, `"rgb(…)"`, `"var(--color-…)"` | Used as is. Anything starting with `#` or containing `(`                              |
| `"species"` (a property of the row)         | `d.species` passed through `cScale`                                                   |
| `"tomato"` (not a property of the row)      | Used as is, as a named CSS color                                                      |
| `(d) => …`                                  | The result passed through `cScale`. A returned CSS color (`#…`, `…(…)`) is used as is |

If there's no `cScale`, or the scale has nothing for a value, the value itself is used. This means a column that already holds colors works with no scale at all:

```svelte
<Points fill="color" />
```

### Series colors

When `series` declare a `color` and the chart has no `cScale` or `cRange`, the chart builds an ordinal `cScale` from them, mapping each series `key` to its `color`. The marks, legend and tooltip then share one palette without you repeating it as `cDomain` / `cRange`:

```svelte
<Chart
  series={[
    { key: 'apples', color: 'var(--color-apples)' },
    { key: 'bananas', color: 'var(--color-bananas)' }
  ]}
>
```

This scale only covers the series keys. Any other value is left alone rather than given the next color in the palette.

Passing `cScale` or `cRange` replaces it. A mark drawing a series still uses that series' `color` first.

### Colors as groups

Setting `c` to a property of strings or booleans (`c="fruit"`) when no `series` are configured means each category is a group, not just a color:

- the legend lists the categories, and clicking one hides its rows
- bars and areas [stack](/docs/guides/series) by category
- `Spline` and `Area` draw one line per category, in that category's color

To split lines into separate paths without coloring them, use `g`. `c` is still what the legend names, so a chart can use both (`g="id"` with `c="region"`).

A numeric `c`, or one given as a function, is a color for each row and does none of this.

### Color from a mark alone

A chart with no `c` can still have a color channel. When a mark's `fill` or `stroke` names a property of the data (`<Circle fill="island" />`), that property is used for the chart's `cDomain` and per-row color lookups, so the tooltip and legend use it too. A `Spline` or `Area` also draws one line per value. If marks name different properties, the chart doesn't pick one.

This channel only adds color. To also group, stack and filter by the property, set `c` on the chart.

### Marks with their own ramp

`Contour`, `Density` and `Raster` color values they compute (a density, a grid cell), not values from your rows. They copy a continuous `cScale` and re-domain it to their own values. They ignore an ordinal one, and with no continuous `cScale` they use a built-in sequential ramp.

### Legend

A [Legend](/docs/components/Legend) shows whichever of these the chart is using:

- **series items**, when `series` declare colors and `c` doesn't name the groups
- otherwise **the `cScale`**: swatches for an ordinal scale, or a ramp for anything else (a gradient for continuous scales, blocks for threshold, quantize and quantile). A ramp marks the hovered row's value.

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
