---
description: Nested-circle legend used to communicate values encoded by circle radius (typically `Chart` `rScale`). Inspired by Harry Stevens' Observable circle legend.
category: common
layers: [html]
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
