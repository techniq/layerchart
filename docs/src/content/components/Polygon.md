---
description: Primitive component which renders a multi-sided shape on a chart to represent complex areas, boundaries, or regions of interest.
category: primitives
layers: [svg, canvas]
related: []
components:
  - { name: Polygon }
  - { name: webgl/Polygon, label: Polygon (WebGL) }
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

## Isometric

On an [isometric](/docs/guides/isometric) chart, `z` stands a polygon up into a prism. See the [isometric tree](/docs/components/Tree#isometric).

## WebGL

In a [`WebGL`](/docs/components/WebGL) layer, from [`@layerchart/webgl`](/docs/guides/webgl), it stands up by its z. See the [WebGL guide](/docs/guides/webgl) to get started.

A polygon per row, with the core [Polygon](/docs/components/Polygon) props: a regular polygon (or star, with `inset`) of `points` corners about `cx` / `cy` with radius `r`, or explicit `points` in pixels, `rotate`d, stretched, skewed, and rounded by `cornerRadius`. `z` stands it up, as on an `isometric` chart; without one it lies flat.

:example{ name="tree" }
