---
description: Primitive component which renders a multi-sided shape on a chart to represent complex areas, boundaries, or regions of interest.
category: primitives
layers: [svg, canvas]
related: []
---

## Usage

### Pixel mode

Pass numeric pixel values for `cx`, `cy`, and `r` to position and size polygons directly.

:example{ name="playground" showCode }

### Data mode

Pass string property names or accessor functions to `cx` and `cy` to have values resolved from data and scaled automatically. The component renders one polygon per data item.

:example{ name="data-mode" showCode }

### Color via ordinal scale

Use `fill` or `stroke` with a data property name to color each item through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color items based on value ranges.

:example{ name="color-via-threshold-scale" showCode }
