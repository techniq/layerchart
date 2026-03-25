---
title: Data
order: 6
---

# Data

LayerChart supports passing data at multiple levels, giving you flexibility from simple single-series charts to complex multi-series visualizations.

## Data patterns

**Chart data** — Single mark or shared data across marks.

```svelte
<Chart data={salesData} x="date" y="revenue">
  <Spline />
</Chart>
```

**Chart data + per-mark accessors** — Same data, different values per mark.

```svelte
<Chart data={fruitData} x="date">
  <Spline y="apples" />
  <Spline y="oranges" />
</Chart>
```

**Per-mark data** — Individual marks need different data than the chart.

```svelte
<Chart x="date" y="value">
  <Spline data={actualData} />
  <Spline data={forecastData} />
</Chart>
```

**Series (unified data)** — Multiple series from the same data array (wide format) with legend/tooltip.

```svelte
<Chart
  data={fruitData}
  x="date"
  series={[
    { key: 'apples', label: 'Apples' },
    { key: 'oranges', label: 'Oranges' },
  ]}
>
  <Spline />
  <Legend />
</Chart>
```

**Series (per-series data)** — Each series has its own data array (long format / different lengths).

```svelte
<Chart
  x="date"
  y="value"
  series={[
    { key: 'actual', data: actualData },
    { key: 'forecast', data: forecastData },
  ]}
>
  <Spline />
  <Legend />
</Chart>
```

## Accessors

The `x` and `y` props accept several accessor types:

| Type | Example | Description |
|------|---------|-------------|
| String | `x="date"` | Property name lookup |
| Function | `x={(d) => d.date}` | Custom accessor function |
| Index | `x={0}` | Array index (for tuple data) |
| Array | `y={['apples', 'oranges']}` | Multiple values (for domain calculation) |

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
