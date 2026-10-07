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

## Isometric

On an [isometric](/docs/guides/isometric) chart, `z1` / `z2` raise each end of a line. A line from a point on the floor up to its height is a stem — under a 3D scatter's points, or the spikes of a map:

```svelte
<Line x1="x" y1="y" x2="x" y2="y" z2="z" />
```
