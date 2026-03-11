---
description: Primitive component which draws a straight line on a chart to represent trends, connections, or boundaries between data points.
category: primitives
layers: [svg, canvas, html]
related: [Rule, Spline]
---

## Usage

### Pixel mode

Pass numeric pixel values for `x1`, `y1`, `x2`, and `y2` to draw lines at exact positions.

:example{ name="styling-using-classes" showCode }

### Data mode

Pass string property names or accessor functions to position endpoints from data. The component renders one line per data item, useful for lollipop charts or drop lines.

:example{ name="data-mode" showCode }

### Color via ordinal scale

Use `stroke` with a data property name to color each line through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color lines based on value ranges.

:example{ name="color-via-threshold-scale" showCode }
