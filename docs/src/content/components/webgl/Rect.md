---
description: 'Marking component drawing a box per row in a WebGL chart, from pixel x, y, width, and height, z tall.'
category: WebGL marks
related: [Rect, guides/webgl]
components:
  - { name: webgl/Rect, label: Rect }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A box per row, `z` tall, placed as LayerChart's [`Rect`](/docs/components/Rect) places it: by its sides `x0` / `x1` and `y0` / `y1`, or by `x` / `y` and a `width` / `height` in pixels. Sides and positions are data properties or functions of the row through the chart's scales, or numbers in pixels. A `z` function can return `[start, end]` to float a box between two values (ex. a treemap's tiers).

```svelte
<Rect data={tiles} x0="x0" x1="x1" y0="y0" y1="y1" z={(d) => [d.depth, d.depth + 1]} />
```

:example{ name="treemap" }
