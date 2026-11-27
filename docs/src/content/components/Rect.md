---
description: Primitive component which draws a rectangle to highlight areas, ranges, or specific regions of interest.
category: primitives
layers: [svg, canvas, html]
related: [Bars, Highlight, RectClipPath]
components:
  - { name: Rect }
  - { name: webgl/Rect, label: Rect (WebGL) }
---

## Usage

### Playground

Use the playground to compare pixel and data modes, switch between `x`/`y` plus `width`/`height` and edge props (`x0`, `y0`, `x1`, `y1`), and adjust each corner radius independently with `corners`.

:example{ name="playground" }

### Pixel mode

Pass numeric pixel values to draw a rectangle at exact screen coordinates. You can use either `x`, `y`, `width`, and `height`, or edge props such as `x0`, `y0`, `x1`, and `y1`.

:example{ name="styling-using-classes" showCode }

### Data mode

Pass string property names or accessor functions to derive rectangle positions from chart data. Edge props are ideal for histograms and ranged highlights, while `x`/`y` can position data-driven rects with explicit or data-driven `width` and `height`.

:example{ name="data-mode-edge" showCode }

### Color via ordinal scale

Use `fill` with a data property name to color each rect through the chart's color scale.

:example{ name="color-via-ordinal-scale" showCode }

### Color via threshold scale

Use a threshold scale to color rects based on value ranges.

:example{ name="color-via-threshold-scale" showCode }

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), it's a box standing as tall as its z. See the [WebGL guide](/docs/guides/webgl) to get started.

A box per row, `z` tall, placed as the core [`Rect`](/docs/components/Rect) places it: by its sides `x0` / `x1` and `y0` / `y1`, or by `x` / `y` and a `width` / `height` in pixels. Sides and positions are data properties or functions of the row through the chart's scales, or numbers in pixels. A `z` function can return `[start, end]` to float a box between two values (ex. a treemap's tiers).

```svelte
<Rect data={tiles} x0="x0" x1="x1" y0="y0" y1="y1" z={(d) => [d.depth, d.depth + 1]} />
```

:example{ name="treemap" }
