---
description: Nested-circle legend used to communicate values encoded by circle radius (typically `Chart` `rScale`). Inspired by Harry Stevens' Observable circle legend.
category: common
layers: [html]
withinLayer: false
related: [Legend, GeoLegend, Chart, ScatterChart, GeoPath]
---

## Usage

:example{ name="basic" showCode }

### Scale types

`CircleLegend` works with any continuous d3 scale. `scaleSqrt` is the most common choice since it makes circle _area_ proportional to the value, but `scaleLinear`, `scaleLog` (strictly positive domains), and `scalePow` are also supported.

:example{ name="scale-types" showCode }

### Label placement

Use `labelPlacement` to control where tick labels are rendered. `'right'` (default) and `'left'` render labels outside the circles with leader lines, while `'inline'` centers each label inside its circle near the top.

:example{ name="label-placement" showCode }

### Tooltip indicator

When the chart has an active tooltip, `CircleLegend` draws a 50%-opacity filled circle at the current hovered value's radius, overlaid on the nested circles. By default it reads `ctx.tooltip.data` and pipes it through the chart's radius accessor (`ctx.r`), so charts that configure `r` / `rScale` on `<Chart>` get the indicator automatically.

Pass an explicit `value` prop to override the auto-detection when the tooltip data shape doesn't match the chart's radius accessor:

```svelte
<CircleLegend
  scale={rScale}
  value={context.tooltip.data?.properties.data?.population}
/>
```

See the [bubble-map](/docs/components/GeoPath/bubble-map) example.
