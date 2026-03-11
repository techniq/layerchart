---
description: Primitive component which draws a circular shape to mark specific points or emphasize data visually.
category: primitives
layers: [svg, canvas, html]
related: [Points]
---

## Usage

### Pixel mode

Pass numeric pixel values for `cx`, `cy`, and `r` to position and size circles directly.

:example{ name="styling-using-classes" showCode }

### Data mode

Pass string property names or accessor functions to `cx` and `cy` to have values resolved from data and scaled automatically. The component renders one circle per data item.

:example{ name="data-mode" showCode }

### Color via ordinal scale

Use `fill` or `stroke` with a data property name to color each item through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color items based on value ranges.

:example{ name="color-via-threshold-scale" showCode }
