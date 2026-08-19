---
title: Data
order: 6
---

LayerChart supports passing data at multiple levels, giving you flexibility from simple single-series charts to complex multi-series visualizations.

## Data patterns

**Chart data** — Single mark or shared data across marks. [details →](#chart-data)

```svelte
<Chart data={salesData} x="date" y="revenue">
	<Spline />
</Chart>
```

**Chart data + per-mark accessors** — Same data, different values per mark. [details →](#multiple-marks)

```svelte
<Chart data={fruitData} x="date">
	<Spline y="apples" />
	<Spline y="oranges" />
</Chart>
```

**Per-mark data** — Individual marks need different data than the chart. [details →](#per-mark-data)

```svelte
<Chart x="date" y="value">
	<Spline data={actualData} />
	<Spline data={forecastData} />
</Chart>
```

**Long format (grouped by a channel)** — One row per observation, with the category in a column. [details →](#long-format)

```svelte
<Chart data={longData} x="year" y="value" c="fruit">
	<Spline />
</Chart>
```

**Series (unified data)** — Multiple series from the same data array (wide format) with legend/tooltip. [details →](#unified-data-with-per-series-values)

```svelte
<Chart
	data={fruitData}
	x="date"
	series={[
		{ key: 'apples', label: 'Apples' },
		{ key: 'oranges', label: 'Oranges' }
	]}
>
	<Spline />
	<Legend />
</Chart>
```

**Series (per-series data)** — Each series has its own data array (long format / different lengths). [details →](#per-series-data)

```svelte
<Chart
	x="date"
	y="value"
	series={[
		{ key: 'actual', data: actualData },
		{ key: 'forecast', data: forecastData }
	]}
>
	<Spline />
	<Legend />
</Chart>
```

## Accessors

### Chart-level (x, y)

The `x` and `y` props on `<Chart>` define how values are extracted from your data for scale and domain calculation.

| Type     | Example              | Description                             |
| -------- | -------------------- | --------------------------------------- |
| String   | `x="date"`           | Property name lookup                    |
| Function | `x={(d) => d.date}`  | Custom accessor function                |
| Array    | `y={['min', 'max']}` | Multiple properties (domain covers all) |

When omitted, the chart infers accessors from the marks that register inside it.

### Mark-level position props (DataProp)

Position props on primitive marks (`cx`, `cy`, `r` on Circle; `x`, `y`, `width`, `height` on Rect; etc.) accept a `DataProp`:

| Type     | Example                   | Behavior                                                            |
| -------- | ------------------------- | ------------------------------------------------------------------- |
| Number   | `cx={100}`                | Direct pixel value — single mark at a fixed position                |
| String   | `cx="longitude"`          | Property name → resolved via scale — renders one mark per data item |
| Function | `cx={(d) => d.longitude}` | Accessor → resolved via scale — renders one mark per data item      |

When any position prop is a string or function the mark enters **data mode** and renders once per data item using the mark's `data` prop (or the chart's `data` if not set). A plain number keeps the mark in **pixel mode** — a single fixed-position element.

```svelte
<!-- Pixel mode: one circle at fixed position -->
<Circle cx={200} cy={150} r={10} />

<!-- Data mode: one circle per data item, positions resolved via xScale / yScale -->
<Circle cx="date" cy="value" r={5} />
```

## Chart data

The simplest approach — pass `data`, `x`, and `y` directly to Chart.

### Single mark

:example{ component="Chart" name="data-chart-single" showCode }

### Multiple marks

Each mark specifies its own `y` accessor. The chart automatically aggregates accessors from registered marks for domain calculation — no need to pass `y={['apples', 'oranges']}` on Chart.

:example{ component="Chart" name="data-chart-multi" showCode }

Tooltip and legend also work automatically based on the registered marks. See the [Series guide](/docs/guides/series) for more control over colors, labels, stacking, and legend behavior.

## Per-mark data

Marks can provide their own `data` prop, which is included in the chart's domain calculation automatically.

:example{ component="Chart" name="data-mark-data" showCode }

Data resolves in this order: mark `data` prop → series data → chart `data`.

### Primitive marks

Primitive marks like `Circle`, `Rect`, and `Ellipse` can own their data directly. No chart-level `x`, `y`, or `data` is required when the marks define their own via `data` + DataProp accessors.

:example{ component="Chart" name="data-primitive-data" showCode }

Each mark's data and accessors are registered with the chart for domain and scale calculation, so axes and tooltips work without any extra configuration.

## Data-driven styling

In data mode, style props (`fill`, `stroke`, `fillOpacity`, `strokeWidth`, `opacity`, `class`) accept a function that is called per data item, letting you vary appearance based on data values.

```svelte
<Circle
	cx="date"
	cy="value"
	r={6}
	fill={(d) => (d.value > 50 ? 'var(--color-danger)' : 'var(--color-primary)')}
	opacity={(d) => (d.active ? 1 : 0.3)}
/>
```

Color props (`fill`, `stroke`) can also reference a data property that is mapped through the chart's `cScale`:

```svelte
<Chart {data} x="date" y="value" c="category" cRange={['red', 'blue', 'green']}>
	<!-- fill resolves "category" through cScale automatically -->
	<Circle cx="date" cy="value" r={5} fill="category" />
</Chart>
```

## Long format

Long ("tidy") data carries the category in a column rather than a column per category — one row per observation:

```js
const data = [
	{ year: 2019, fruit: 'apples', value: 3840 },
	{ year: 2019, fruit: 'bananas', value: 1920 },
	{ year: 2018, fruit: 'apples', value: 1600 }
	// …
];
```

Naming that column as the `c` channel is enough to draw it. There's no `series` to declare, and nothing to pivot into a column per fruit first:

```svelte
<LineChart {data} x="year" y="value" c="fruit" legend />
```

:example{ component="LineChart" name="long-data" }

### How the split is resolved

`Spline` and `Area` group their rows into one path per distinct value, resolving what to group by in this order — the first that's set wins:

| Source            | Example                     | Notes                                       |
| ----------------- | --------------------------- | ------------------------------------------- |
| The mark's `z`    | `<Spline z="id" />`         | Most specific                               |
| The chart's `z`   | `<Chart z="id">`            | Applies to every mark inside                |
| `stroke` / `fill` | `<Spline stroke="fruit" />` | Names a data property, colored via `cScale` |
| The chart's `c`   | `<Chart c="fruit">`         | Only when its values are categorical        |

A continuous `c` (`c="value"` with a sequential scale) is a color ramp, not a set of categories, so it doesn't split anything. Neither does a mark handed its own rows via `data` — whoever grouped them already decided.

Use `z` when the split and the color aren't the same thing. Here each line is one flower, colored by its species:

```svelte
<Chart {data} z="id" c="group">
```

### Legend

With no `series` to name, the legend's items are the `c` categories. Hovering one fades the rest, and clicking one filters to it — the chart's domains recalculate from what's left, and the hidden categories keep their color:

:example{ component="BarChart" name="group-long-data" }

### Overlap, group, and stack

`seriesLayout` behaves differently for long data, because the rows — not the series — carry the categories:

| Layout    | Long data                                                                                 |
| --------- | ----------------------------------------------------------------------------------------- |
| `auto`    | Default for `BarChart` / `AreaChart`. Stacks by `c`, since `c` names layers to stack      |
| `overlap` | Each mark drawn from the axis, compared against the others rather than summed             |
| `group`   | Pair with `x1` (or `y1`) to divide each band — `x1` names the sub-band, `group` splits it |
| `stack`   | `c` names the layers, bottom-first in `cDomain` order                                     |

Bars need both `x1` and `seriesLayout="group"`: `x1` names the sub-band, and the group layout is what gives that sub-band a scale to sit on. With `x1` alone the bars share the full band and overlap.

```svelte
<BarChart {data} x="year" x1="fruit" y="value" seriesLayout="group" c="fruit" legend />
```

Stacking needs neither — the same `c` that colors the bars is what stacks them, and `auto` reaches for it without being asked:

```svelte
<BarChart {data} x="year" y="value" c="fruit" legend />
```

:example{ component="BarChart" name="stack-long-data" }

`stackExpand` and `stackDiverging` work the same way, and the [Series guide](/docs/guides/series#layouts) covers stacking the wide format.

## Series

For multi-series charts with full tooltip, legend, and stacking support, use the `series` prop. See the [Series guide](/docs/guides/series) for complete documentation.

### Unified data with per-series values

A single data array with per-series values as separate properties (wide format):

:example{ component="Chart" name="data-series-chart-data" showCode }

### Per-series data

Each series has its own data array:

:example{ component="Chart" name="data-series-separate-data" showCode }

## Performance

Passing data and accessors as Chart-level props (`data`, `x`, `y`, `series`) is the most efficient approach — all info is available immediately and domains, scales, and axes compute in a single render pass.

Per-mark accessors (`<Spline y="apples" />`) and per-mark data (`<Spline data={...} />`) use mark registration, which runs after the initial render. This means the chart renders twice: once with incomplete domain info, then again after marks register. The visual difference is negligible, but for performance-critical charts with many marks or large datasets, prefer Chart-level props.
