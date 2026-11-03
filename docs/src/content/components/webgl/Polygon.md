---
description: 'Primitive component which renders a multi-sided shape on a chart to represent complex areas, boundaries, or regions of interest. In a WebGL layer, it stands up by its z.'
category: WebGL marks
related: [Polygon, guides/webgl]
components:
  - { name: webgl/Polygon, label: Polygon }
---

::tip
Part of [`@layerchart/webgl`](/docs/guides/webgl), drawn in a `WebGL` layer. See the [WebGL guide](/docs/guides/webgl) to get started.
::

## Usage

A polygon per row, with LayerChart's [Polygon](/docs/components/Polygon) props: a regular polygon (or star, with `inset`) of `points` corners about `cx` / `cy` with radius `r`, or explicit `points` in pixels, `rotate`d, stretched, skewed, and rounded by `cornerRadius`. `z` stands it up, as on an `isometric` chart; without one it lies flat.

:example{ name="tree" }
