---
description: Commonly used component which explains the symbols, colors, or patterns used in a chart, helping interpret the represented data categories. Typically paired with `Chart` `cScale` (color scale). Filtering and toggling visibility of data series can be enabled for interactivity.
category: common
layers: [html]
withinLayer: false
related: [CircleLegend, GeoLegend]
---

## Usage

:example{ name="sequential" showCode }

### Tooltip indicator

When the chart has an active tooltip, `Legend` draws a small arrow below the color ramp at the position of the currently hovered value. By default it reads `ctx.tooltip.data` and pipes it through the chart's color accessor (`ctx.c`), so charts that configure `c` / `cScale` on `<Chart>` get the indicator automatically.

For `scaleThreshold` / `scaleQuantize` / `scaleQuantile` scales, the arrow centers on the matching bucket swatch.

Pass an explicit `value` prop to override the auto-detection — useful when the tooltip data shape doesn't match the chart's color accessor:

```svelte
<Legend scale={colorScale} value={context.tooltip.data?.properties.data?.percentUnder18} />
```

See the [choropleth](/docs/components/GeoPath/choropleth) and [bubble-map](/docs/components/GeoPath/bubble-map) examples.

<!-- ## Examples

### scaleSequential

:example{ name="sequential" }

### scaleSequentialSqrt

:example{ name="sequential-sqrt" }

### scaleDiverging

:example{ name="diverging" }

### scaleDivergingSqrt

:example{ name="diverging-sqrt" }

### scaleSequentialLog

:example{ name="sequential-log" }

### scaleSequentialQuantile

:example{ name="sequential-quantile" }

### scaleSqrt

:example{ name="sqrt" }

### scaleQuantize

:example{ name="quantize" }

### scaleQuantile

:example{ name="quantile" }

### scaleThreshold

:example{ name="threshold" }

### scaleOrdinal

:example{ name="ordinal" }

### Chart integration

:example{ name="chart-integration" }

### Chart placement

:example{ name="chart-placement" }

### Square swatch

:example{ name="square-swatch" }

### Vertical orientation

:example{ name="vertical-orientation" }

### Styling

:example{ name="styling" }

### Responsive swatches

:example{ name="responsive-swatches" }

### Click handler

:example{ name="click-handler" }

### Children override

:example{ name="children-override" } -->
