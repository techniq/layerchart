---
title: Data
order: 6
---

# Data

LayerChart supports passing data at multiple levels, giving you flexibility from simple single-series charts to complex multi-series visualizations.

## Data patterns

| Pattern | When to use |
|---------|-------------|
| Chart data | Single mark or shared data across marks |
| Chart data + per-mark accessors | Same data, different values per mark (e.g. `y="apples"` vs `y="oranges"`) |
| Per-mark data | Individual marks need different data than the chart |
| Series (unified data) | Multiple series from the same data array (wide format) with legend/tooltip |
| Series (per-series data) | Each series has its own data array (long format / different lengths) |

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
