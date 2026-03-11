---
description: Primitive component which draws an oval shape  to highlight areas, emphasize points, or decorate visual elements.
category: primitives
layers: [svg, canvas, html]
related: []
---

## Usage

### Pixel mode

Pass numeric pixel values for `cx`, `cy`, `rx`, and `ry` to position and size ellipses directly.

:example{ name="styling-using-classes" showCode }

### Data mode

Pass string property names or accessor functions to `cx` and `cy` to have values resolved from data and scaled automatically. The component renders one ellipse per data item.

:example{ name="data-mode" showCode }

### Color via ordinal scale

Use `fill` or `stroke` with a data property name to color each item through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color items based on value ranges.

:example{ name="color-via-threshold-scale" showCode }
