---
description: Primitive component which draws a rectangle to highlight areas, ranges, or specific regions of interest.
category: primitives
layers: [svg, canvas, html]
related: [Bars, Highlight, RectClipPath]
---

## Usage

### Pixel mode

Pass numeric pixel values for `x`, `y`, `width`, and `height` to draw rectangles at exact positions.

:example{ name="styling-using-classes" showCode }

### Data mode

Pass string property names or accessor functions to edge props (`x0`, `x1`, `y0`, `y1`) to derive rectangle bounds from data. The component renders one rect per data item, ideal for histograms and bar-like layouts.

:example{ name="data-mode-edge" showCode }

### Color via ordinal scale

Use `fill` with a data property name to color each rect through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color rects based on value ranges.

:example{ name="color-via-threshold-scale" showCode }
